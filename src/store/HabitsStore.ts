import { create, type StateCreator } from 'zustand';
import type { HabitDef as Habit, DayEntry as HabitDay, HabitStats } from '../lib/habits/types';
import {
  toYMD,
  ensureDayEntry,
  getDayEntry,
  setDayEntry,
  getHabit,
  listHabits,
  updateHabit as repoUpdateHabit,
  createHabit as repoCreateHabit,
  deleteHabit as repoDeleteHabit,
  computeStats,
  addReminderTime,
  editReminderTime,
  deleteReminderTime,
  isDayComplete,
  daysBetween,
} from '../lib/habits';
import { cancelTodayAtTime, rescheduleForHabit } from '../lib/notifications';
import * as EventBus from '../lib/eventBus';
import { Capacitor } from '@capacitor/core';
import { clearCompletionCaches } from '../lib/completion';

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

// Safe JSON parsing with error handling
function safeParseJson<T = any>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn(`Failed to parse JSON for key: ${jsonString.substring(0, 50)}...`, error);
    return null;
  }
}

// Safe JSON stringification with error handling
function safeStringifyJson(value: any): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('Failed to stringify JSON:', error);
    return null;
  }
}

// Safe storage key removal for corrupted data cleanup
async function removeCorruptedKey(key: string): Promise<void> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    if (prefs && Capacitor.getPlatform() !== 'web') {
      await prefs.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
    console.log(`Removed corrupted key: ${key}`);
  } catch (error) {
    console.warn(`Failed to remove corrupted key ${key}:`, error);
  }
}

async function setJSON(key: string, value: any): Promise<void> {
  const str = safeStringifyJson(value);
  if (!str) {
    console.error(`Failed to stringify value for key: ${key}`);
    return;
  }
  
  const anyWin: any = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
  if (prefs && Capacitor.getPlatform() !== 'web') {
    await prefs.set({ key, value: str });
  } else {
    localStorage.setItem(key, str);
  }
}

async function getJSON<T = any>(key: string): Promise<T | null> {
  const anyWin: any = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
  if (prefs && Capacitor.getPlatform() !== 'web') {
    try {
      const res = await prefs.get({ key });
      if (!res?.value) return null;
      const parsed = safeParseJson<T>(res.value);
      if (parsed === null) {
        // Remove corrupted key to prevent future failures
        await removeCorruptedKey(key);
      }
      return parsed;
    } catch (error) {
      console.warn(`Failed to get preference for key ${key}:`, error);
      await removeCorruptedKey(key);
      return null;
    }
  }
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = safeParseJson<T>(raw);
    if (parsed === null) {
      // Remove corrupted key to prevent future failures
      await removeCorruptedKey(key);
    }
    return parsed;
  } catch (error) {
    console.warn(`Failed to get localStorage item for key ${key}:`, error);
    await removeCorruptedKey(key);
    return null;
  }
}

// Keys
const statsKey = (id: string) => `habit:${id}:stats`;
const dayKey = (id: string, ymd: string) => `habit:${id}:day:${ymd}`;
const completionLogKey = 'habit:completion-log';

// ---------------------------------------------------------------------------
// Event system
// ---------------------------------------------------------------------------

export type HabitEventName =
  | 'habit.created'
  | 'habit.updated'
  | 'habit.reminders.updated'
  | 'habit.day.updated'
  | 'habit.deleted'
  | 'stats.updated'
  | 'notifications.rescheduled'
  | 'day.changed';

type Handler = (payload?: any) => void;
const subscribers: Record<HabitEventName, Set<Handler>> = {
  'habit.created': new Set(),
  'habit.updated': new Set(),
  'habit.reminders.updated': new Set(),
  'habit.day.updated': new Set(),
  'habit.deleted': new Set(),
  'stats.updated': new Set(),
  'notifications.rescheduled': new Set(),
  'day.changed': new Set(),
};

export function on(event: HabitEventName, handler: Handler) {
  subscribers[event].add(handler);
  return () => subscribers[event].delete(handler);
}

function emit(event: HabitEventName, payload?: any) {
  for (const h of subscribers[event]) {
    try {
      h(payload);
    } catch {
      // ignore handler failures
    }
  }
}

// ---------------------------------------------------------------------------
// State definition
// ---------------------------------------------------------------------------

export type HydrationState = 'idle' | 'hydrating' | 'ready';

export interface CompletionLogEntry {
  habitId: string;
  date: string;
  action: 'completed' | 'uncompleted';
  timestamp: string;
}

interface HabitsStoreState {
  hydrationState: HydrationState;
  lastHydratedYMD: string | null;
  habitsById: Record<string, Habit>;
  habitDaysByKey: Record<string, HabitDay>;
  statsById: Record<string, HabitStats>;
  completionLog: CompletionLogEntry[];
  _completionCacheVersion: number;
  _hasHydrated: boolean;
  hydrateAll: (force?: boolean) => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  toggleTime: (habitId: string, time: string, date?: string) => Promise<void>;
  markAllDone: (habitId: string, date?: string) => Promise<void>;
  toggleCompletionForDate: (habitId: string, ymd: string) => Promise<void>;
  addReminder: (habitId: string, time: string) => Promise<void>;
  editReminder: (habitId: string, oldTime: string, newTime: string) => Promise<void>;
  removeReminder: (habitId: string, time: string) => Promise<void>;
  editHabit: (patch: Partial<Habit> & { id: string }) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  rescheduleNotifications: (habitId: string) => Promise<void>;
  clearAllHabits: () => Promise<void>;
  factoryReset: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function createEmptyDayEntry(habit: Habit, ymd: string): HabitDay {
  const reminders =
    habit.reminderTimes && habit.reminderTimes.length > 0
      ? habit.reminderTimes.map((time) => ({ time, done: false }))
      : [{ time: 'default', done: false }];

  return {
    habitId: habit.id,
    date: ymd,
    reminders,
    updatedAt: new Date().toISOString(),
  };
}

function computeStatsFromSnapshot(habit: Habit, days: Record<string, HabitDay>): HabitStats {
  const today = new Date();
  const createdAt = new Date(habit.createdAt);
  const totalDays = Math.max(1, daysBetween(createdAt, today) + 1);

  let totalCompletedDays = 0;
  let bestStreak = 0;
  let rollingStreak = 0;
  let currentStreak = 0;

  for (let i = 0; i < totalDays; i += 1) {
    const d = new Date(createdAt.getTime() + i * 24 * 60 * 60 * 1000);
    const ymd = toYMD(d);
    const entry = days[dayKey(habit.id, ymd)];
    const complete = entry ? isDayComplete(entry) : false;

    if (complete) {
      rollingStreak += 1;
      totalCompletedDays += 1;
      bestStreak = Math.max(bestStreak, rollingStreak);
    } else {
      rollingStreak = 0;
    }

    if (toYMD(d) === toYMD(today)) {
      currentStreak = complete ? rollingStreak : 0;
    }
  }

  const weeklyProgress: HabitStats['weeklyProgress'] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const ymd = toYMD(d);
    const entry = days[dayKey(habit.id, ymd)];
    weeklyProgress.push({ date: ymd, complete: entry ? isDayComplete(entry) : false });
  }

  const completionRate = Math.round((totalCompletedDays / totalDays) * 100);

  return {
    currentStreak,
    bestStreak,
    completionRate,
    totalCompletedDays,
    weeklyProgress,
  };
}

async function persistStateSnapshot(state: HabitsStoreState): Promise<void> {
  const statWrites = Object.entries(state.statsById).map(([habitId, stats]) => setJSON(statsKey(habitId), stats));
  const dayWrites = Object.values(state.habitDaysByKey).map((entry) => setDayEntry(entry));
  const logWrite = setJSON(completionLogKey, state.completionLog);
  await Promise.all([...statWrites, ...dayWrites, logWrite]);
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

const createHabitsStore: StateCreator<HabitsStoreState> = (set, get) => {
  const commitHabitDayUpdate = async (habit: Habit, entry: HabitDay, logEntry?: CompletionLogEntry) => {
    let completedTimes: string[] = [];
    let snapshot: HabitsStoreState | null = null;

    set((current) => {
      const nextHabitDays = { ...current.habitDaysByKey, [dayKey(habit.id, entry.date)]: entry };
      const nextStatsById = { ...current.statsById };
      nextStatsById[habit.id] = computeStatsFromSnapshot(habit, nextHabitDays);
      completedTimes = entry.reminders.filter((r) => r.done).map((r) => r.time);
      const nextCompletionLog = logEntry
        ? [...current.completionLog, logEntry]
        : current.completionLog;

      const nextState: HabitsStoreState = {
        ...current,
        habitDaysByKey: nextHabitDays,
        statsById: nextStatsById,
        completionLog: nextCompletionLog,
        _completionCacheVersion: current._completionCacheVersion + 1,
      };

      snapshot = nextState;
      return nextState;
    });

    const finalState = snapshot ?? get();
    await persistStateSnapshot(finalState);

    emit('habit.day.updated', { habitId: habit.id, date: entry.date, entry });
    EventBus.emit('habit:completion-changed', {
      habitId: habit.id,
      date: entry.date,
      completedTimes,
    });
    clearCompletionCaches();
  };

  return {
    hydrationState: 'idle',
    lastHydratedYMD: null,
    habitsById: {},
    habitDaysByKey: {},
    statsById: {},
    completionLog: [],
    _completionCacheVersion: 0,
    _hasHydrated: false,

    hydrateAll: async (force = false) => {
      const state = get();
      if (!force && (state.hydrationState === 'hydrating' || state._hasHydrated)) return;
      
      set({ hydrationState: 'hydrating' });

      try {
        // Load habits with error handling
        let habits: Habit[] = [];
        try {
          habits = await listHabits();
        } catch (error) {
          console.error('Failed to load habits during hydration:', error);
          // Reset hydration state on failure
          set({ 
            hydrationState: 'idle',
            _hasHydrated: false 
          });
          return;
        }

        const habitsById: Record<string, Habit> = {};
        const statsById: Record<string, HabitStats> = {};
        const habitDaysByKey: Record<string, HabitDay> = {};
        const todayDate = new Date();
        const today = toYMD(todayDate);
        
        // Load completion log with error handling
        let persistedLog: CompletionLogEntry[] = [];
        try {
          persistedLog = (await getJSON<CompletionLogEntry[]>(completionLogKey)) ?? [];
        } catch (error) {
          console.warn('Failed to load completion log, using empty array:', error);
        }

        const lookbackDays = 90;
        const dateWindow: string[] = [];

        for (let offset = 0; offset < lookbackDays; offset += 1) {
          const d = new Date(todayDate);
          d.setDate(todayDate.getDate() - offset);
          dateWindow.push(toYMD(d));
        }

        // Process each habit with individual error handling
        for (const habit of habits) {
          try {
            habitsById[habit.id] = habit;
            
            // Load stats with error handling
            let storedStats: HabitStats | null = null;
            try {
              storedStats = await getJSON<HabitStats>(statsKey(habit.id));
            } catch (error) {
              console.warn(`Failed to load stats for habit ${habit.id}:`, error);
            }
            
            // Compute stats if loading failed
            try {
              statsById[habit.id] = storedStats ?? (await computeStats(habit));
            } catch (error) {
              console.warn(`Failed to compute stats for habit ${habit.id}:`, error);
              // Use empty stats as fallback
              statsById[habit.id] = {
                currentStreak: 0,
                bestStreak: 0,
                completionRate: 0,
                totalCompletedDays: 0,
                weeklyProgress: []
              };
            }

            // Load day entries with error handling
            for (const ymd of dateWindow) {
              try {
                const entry =
                  ymd === today
                    ? await ensureDayEntry(habit, ymd)
                    : await getDayEntry(habit.id, ymd);
                if (entry) {
                  habitDaysByKey[dayKey(habit.id, ymd)] = entry;
                }
              } catch (error) {
                console.warn(`Failed to load day entry for habit ${habit.id} on ${ymd}:`, error);
                // Continue with other days
              }
            }
          } catch (error) {
            console.error(`Failed to process habit ${habit.id} during hydration:`, error);
            // Continue with other habits
          }
        }

        // Only mark as hydrated if we successfully loaded at least some data
        set((current) => ({
          hydrationState: 'ready',
          lastHydratedYMD: today,
          habitsById,
          habitDaysByKey,
          statsById,
          completionLog: persistedLog,
          _completionCacheVersion: 0,
          _hasHydrated: true,
        }));

      } catch (error) {
        console.error('Critical error during hydration:', error);
        // Reset hydration state on critical failure
        set({ 
          hydrationState: 'idle',
          _hasHydrated: false 
        });
        // Re-throw to allow UI to handle the error
        throw new Error(`Hydration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    addHabit: async (habit) => {
      const today = toYMD(new Date());
      const entry = await ensureDayEntry(habit, today);
      const stats = await computeStatsFromSnapshot(habit, {
        [dayKey(habit.id, today)]: entry,
      });

      set((current) => ({
        habitsById: { ...current.habitsById, [habit.id]: habit },
        habitDaysByKey: { ...current.habitDaysByKey, [dayKey(habit.id, today)]: entry },
        statsById: { ...current.statsById, [habit.id]: stats },
        _completionCacheVersion: current._completionCacheVersion + 1,
      }));

      await persistStateSnapshot(get());
      emit('habit.created', { habitId: habit.id });
      EventBus.emit('habit:created', { habit });
      clearCompletionCaches();
    },

    toggleTime: async (habitId, time, date) => {
      const state = get();
      const targetDate = date ?? toYMD(new Date());
      const habit = state.habitsById[habitId] || (await getHabit(habitId));
      if (!habit) return;

      const key = dayKey(habitId, targetDate);
      const existing = state.habitDaysByKey[key] ?? createEmptyDayEntry(habit, targetDate);
      const baseReminders =
        existing.reminders.length > 0 ? existing.reminders : createEmptyDayEntry(habit, targetDate).reminders;

      const hasAnyConfigured = (habit.reminderTimes?.length ?? 0) > 0;
      const targetTime = hasAnyConfigured ? time : 'default';

      const nextReminders = baseReminders.map((r) =>
        r.time === targetTime ? { ...r, done: !r.done } : r,
      );
      const updatedEntry: HabitDay = {
        ...existing,
        reminders: nextReminders,
        updatedAt: new Date().toISOString(),
      };

      const wasComplete = baseReminders.length > 0 && baseReminders.every((r) => r.done);
      const isComplete = nextReminders.length > 0 && nextReminders.every((r) => r.done);
      const logEntry: CompletionLogEntry | undefined =
        wasComplete !== isComplete
          ? {
              habitId,
              date: targetDate,
              action: isComplete ? 'completed' : 'uncompleted',
              timestamp: new Date().toISOString(),
            }
          : undefined;

      await commitHabitDayUpdate(habit, updatedEntry, logEntry);

      const flipped = nextReminders.find((r) => r.time === targetTime);
      if (flipped?.done && targetDate === toYMD(new Date())) {
        await cancelTodayAtTime(habitId, targetTime);
      }
    },

    markAllDone: async (habitId, date) => {
      const state = get();
      const targetDate = date ?? toYMD(new Date());
      const habit = state.habitsById[habitId] || (await getHabit(habitId));
      if (!habit) return;

      const key = dayKey(habitId, targetDate);
      const existing = state.habitDaysByKey[key] ?? createEmptyDayEntry(habit, targetDate);
      const baseReminders =
        existing.reminders.length > 0 ? existing.reminders : createEmptyDayEntry(habit, targetDate).reminders;

      const nextReminders = baseReminders.map((r) => ({ ...r, done: true }));
      const updatedEntry: HabitDay = {
        ...existing,
        reminders: nextReminders,
        updatedAt: new Date().toISOString(),
      };

      const logEntry: CompletionLogEntry = {
        habitId,
        date: targetDate,
        action: 'completed',
        timestamp: new Date().toISOString(),
      };

      await commitHabitDayUpdate(habit, updatedEntry, logEntry);

      if (targetDate === toYMD(new Date())) {
        for (const reminder of nextReminders) {
          await cancelTodayAtTime(habitId, reminder.time);
        }
      }
    },

    toggleCompletionForDate: async (habitId, ymd) => {
      const state = get();
      const habit = state.habitsById[habitId] || (await getHabit(habitId));
      if (!habit) return;

      const key = dayKey(habitId, ymd);
      const existing = state.habitDaysByKey[key] ?? createEmptyDayEntry(habit, ymd);
      const baseReminders =
        existing.reminders.length > 0 ? existing.reminders : createEmptyDayEntry(habit, ymd).reminders;
      const shouldComplete = !baseReminders.every((r) => r.done);

      const nextReminders = baseReminders.map((r) => ({ ...r, done: shouldComplete }));
      const updatedEntry: HabitDay = {
        ...existing,
        reminders: nextReminders,
        updatedAt: new Date().toISOString(),
      };

      const logEntry: CompletionLogEntry = {
        habitId,
        date: ymd,
        action: shouldComplete ? 'completed' : 'uncompleted',
        timestamp: new Date().toISOString(),
      };

      await commitHabitDayUpdate(habit, updatedEntry, logEntry);
    },

    addReminder: async (habitId, time) => {
      const state = get();
      const habit = state.habitsById[habitId];
      if (!habit) return;
      const updatedHabit = await addReminderTime(habit, time);

      set((current) => ({
        habitsById: { ...current.habitsById, [habitId]: updatedHabit },
      }));

      const ymd = toYMD(new Date());
      const entry = await ensureDayEntry(updatedHabit, ymd);
      await commitHabitDayUpdate(updatedHabit, entry);

      emit('habit.reminders.updated', { habitId });
      EventBus.emit('habit:updated', { habit: updatedHabit });
    },

    editReminder: async (habitId, oldTime, newTime) => {
      const state = get();
      const habit = state.habitsById[habitId];
      if (!habit) return;
      const updatedHabit = await editReminderTime(habit, oldTime, newTime);

      set((current) => ({
        habitsById: { ...current.habitsById, [habitId]: updatedHabit },
      }));

      const ymd = toYMD(new Date());
      const entry = await ensureDayEntry(updatedHabit, ymd);
      await commitHabitDayUpdate(updatedHabit, entry);

      emit('habit.reminders.updated', { habitId });
      EventBus.emit('habit:updated', { habit: updatedHabit });
      await get().rescheduleNotifications(habitId);
    },

    removeReminder: async (habitId, time) => {
      const state = get();
      const habit = state.habitsById[habitId];
      if (!habit) return;
      const updatedHabit = await deleteReminderTime(habit, time);

      set((current) => ({
        habitsById: { ...current.habitsById, [habitId]: updatedHabit },
      }));

      const ymd = toYMD(new Date());
      const entry = await ensureDayEntry(updatedHabit, ymd);
      await commitHabitDayUpdate(updatedHabit, entry);

      emit('habit.reminders.updated', { habitId });
      EventBus.emit('habit:updated', { habit: updatedHabit });
      await get().rescheduleNotifications(habitId);
    },

    editHabit: async (patch) => {
      const state = get();
      const currentHabit = state.habitsById[patch.id] || (await getHabit(patch.id));
      if (!currentHabit) return;
      const updated = await repoUpdateHabit(patch.id, patch as Partial<Habit>);
      if (!updated) return;

      set((current) => ({
        habitsById: { ...current.habitsById, [patch.id]: updated },
      }));

      const ymd = toYMD(new Date());
      const entry = state.habitDaysByKey[dayKey(patch.id, ymd)];
      if (entry) {
        await commitHabitDayUpdate(updated, entry);
      } else {
        await persistStateSnapshot(get());
      }

      emit('habit.updated', { habitId: patch.id });
      EventBus.emit('habit:updated', { habit: updated });

      if (
        Object.prototype.hasOwnProperty.call(patch, 'reminderTimes') ||
        Object.prototype.hasOwnProperty.call(patch, 'frequency') ||
        Object.prototype.hasOwnProperty.call(patch, 'weeklyDays')
      ) {
        await get().rescheduleNotifications(patch.id);
      }
    },

    deleteHabit: async (habitId) => {
      set((current) => {
        const { [habitId]: _, ...rest } = current.habitsById;
        return { habitsById: rest };
      });
      await repoDeleteHabit(habitId);

      set((current) => {
        const nextDays = { ...current.habitDaysByKey };
        Object.keys(nextDays)
          .filter((key) => key.startsWith(`habit:${habitId}:day:`))
          .forEach((key) => delete nextDays[key]);

        const nextStats = { ...current.statsById };
        delete nextStats[habitId];

        return {
          habitDaysByKey: nextDays,
          statsById: nextStats,
          _completionCacheVersion: current._completionCacheVersion + 1,
        };
      });

      await persistStateSnapshot(get());
      emit('habit.deleted', { habitId });
      EventBus.emit('habit:deleted', { habitId });
    },

    rescheduleNotifications: async (habitId) => {
      const habit = get().habitsById[habitId] || (await getHabit(habitId));
      if (!habit) return;
      await rescheduleForHabit(habit);
      const today = toYMD(new Date());
      const entry = await getDayEntry(habitId, today);
      if (entry) {
        for (const reminder of entry.reminders) {
          if (reminder.done) {
            await cancelTodayAtTime(habitId, reminder.time);
          }
        }
      }
      emit('notifications.rescheduled', { habitId });
    },

    clearAllHabits: async () => {
      set({
        habitsById: {},
        habitDaysByKey: {},
        statsById: {},
        completionLog: [],
        hydrationState: 'ready',
        lastHydratedYMD: toYMD(new Date()),
        _completionCacheVersion: 0,
        _hasHydrated: true,
      });
      await persistStateSnapshot(get());
      emit('habit.deleted');
      emit('stats.updated');
      EventBus.emit('habits:cleared');
    },

    factoryReset: async () => {
      const today = toYMD(new Date());
      set({
        hydrationState: 'idle',
        lastHydratedYMD: today,
        habitsById: {},
        habitDaysByKey: {},
        statsById: {},
        completionLog: [],
        _completionCacheVersion: 0,
        _hasHydrated: false,
      });
      await persistStateSnapshot(get());
      clearCompletionCaches();
      emit('habit.deleted');
      emit('stats.updated');
      EventBus.emit('habits:cleared');
    },
  };
};

const withWriteAudit = (creator: StateCreator<HabitsStoreState>): StateCreator<HabitsStoreState> => {
  return (set, get, api) => {
    const auditedSet: typeof set = (partial, replace) => {
      const before = get().habitDaysByKey;
      set(partial as any, replace);
      const after = get().habitDaysByKey;
      if (before !== after) {
        const frame = (new Error()).stack?.split('\n')[2]?.trim() ?? 'unknown';
        console.log('[AUDIT] habitDaysByKey changed by:', frame, 'replace=', !!replace);
      }
      if (replace) {
        console.warn('[AUDIT] replace=true used; verify it does not drop slices');
      }
    };
    return creator(auditedSet, get, api);
  };
};

export const useHabitsStore = create<HabitsStoreState>()(withWriteAudit(createHabitsStore));

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function getTodayProgress(
  habitId: string,
  state?: HabitsStoreState,
): { total: number; done: number; complete: boolean } {
  const snapshot = state ?? useHabitsStore.getState();
  const today = toYMD(new Date());
  const entry = snapshot.habitDaysByKey[dayKey(habitId, today)];
  if (!entry) return { total: 0, done: 0, complete: false };
  const total = entry.reminders.length;
  const done = entry.reminders.filter((r) => r.done).length;
  return { total, done, complete: total > 0 && done === total };
}
