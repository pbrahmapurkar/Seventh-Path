import { create } from 'zustand';
import type { HabitDef as Habit, DayEntry as HabitDay, HabitStats } from '../lib/habits/types';
import { toYMD, ensureDayEntry, getDayEntry, setDayEntry, getHabit, listHabits, updateHabit as repoUpdateHabit, createHabit as repoCreateHabit, deleteHabit as repoDeleteHabit, computeStats, addReminderTime, editReminderTime, deleteReminderTime, isDayComplete } from '../lib/habits';
import { cancelTodayAtTime, rescheduleForHabit, scheduleNext7Days } from '../lib/notifications';
import * as EventBus from '../lib/eventBus';
import { Capacitor } from '@capacitor/core';

// Simple Preferences-backed JSON helpers
async function setJSON(key: string, value: any): Promise<void> {
  const str = JSON.stringify(value);
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
    const res = await prefs.get({ key });
    return res?.value ? JSON.parse(res.value) as T : null;
  }
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) as T : null;
}
async function removeKey(key: string): Promise<void> {
  const anyWin: any = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
  if (prefs && Capacitor.getPlatform() !== 'web') {
    await prefs.remove({ key });
  } else {
    localStorage.removeItem(key);
  }
}

// Keys
const statsKey = (id: string) => `habit:${id}:stats`;
const dayKey = (id: string, ymd: string) => `habit:${id}:day:${ymd}`;

// Events
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
  for (const h of subscribers[event]) try { h(payload); } catch { /* ignore */ }
}

// Store
export type HydrationState = 'idle' | 'hydrating' | 'ready';

interface HabitsStoreState {
  hydrationState: HydrationState;
  lastHydratedYMD: string | null;
  habitsById: Record<string, Habit>;
  habitDaysByKey: Record<string, HabitDay>;
  statsById: Record<string, HabitStats>;
  hydrateAll: () => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  toggleTime: (habitId: string, time: string, date?: string) => Promise<void>;
  markAllDone: (habitId: string, date?: string) => Promise<void>;
  addReminder: (habitId: string, time: string) => Promise<void>;
  editReminder: (habitId: string, oldTime: string, newTime: string) => Promise<void>;
  removeReminder: (habitId: string, time: string) => Promise<void>;
  editHabit: (patch: Partial<Habit> & { id: string }) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  recomputeStats: (habitId: string) => Promise<void>;
  rescheduleNotifications: (habitId: string) => Promise<void>;
  clearAllHabits: () => Promise<void>;
}

export const useHabitsStore = create<HabitsStoreState>()((set, get) => ({
  hydrationState: 'idle',
  lastHydratedYMD: null,
  habitsById: {},
  habitDaysByKey: {},
  statsById: {},

  hydrateAll: async () => {
    if (get().hydrationState === 'hydrating') return;
    set({ hydrationState: 'hydrating' });
    const habits = await listHabits();
    const habitsById: Record<string, Habit> = {};
    const statsById: Record<string, HabitStats> = {};
    const habitDaysByKey: Record<string, HabitDay> = {};
    const today = toYMD(new Date());
    for (const h of habits) {
      habitsById[h.id] = h;
      const s = await getJSON<HabitStats>(statsKey(h.id));
      statsById[h.id] = s ?? await computeStats(h);
      // Ensure today entry exists
      const entry = await ensureDayEntry(h, today);
      habitDaysByKey[dayKey(h.id, today)] = entry;
    }
    set({ habitsById, statsById, habitDaysByKey, hydrationState: 'ready', lastHydratedYMD: today });
  },

  addHabit: async (habit) => {
    const state = get();
    const today = toYMD(new Date());
    
    // Add habit to store
    const updatedHabitsById = { ...state.habitsById, [habit.id]: habit };
    
    // Compute initial stats for the new habit
    const stats = await computeStats(habit);
    const updatedStatsById = { ...state.statsById, [habit.id]: stats };
    
    // Ensure today entry exists for the new habit
    const entry = await ensureDayEntry(habit, today);
    const updatedHabitDaysByKey = { ...state.habitDaysByKey, [dayKey(habit.id, today)]: entry };
    
    // Update store state
    set({ 
      habitsById: updatedHabitsById, 
      statsById: updatedStatsById, 
      habitDaysByKey: updatedHabitDaysByKey 
    });
    
    // Emit events for UI updates
    emit('habit.created', { habitId: habit.id });
    EventBus.emit('habit:created', { habit });
    
    // Save stats to persistence
    await setJSON(statsKey(habit.id), stats);
  },

  toggleTime: async (habitId, time, date) => {
    const state = get();
    const d = date ?? toYMD(new Date());
    const habit = state.habitsById[habitId] || await getHabit(habitId);
    if (!habit) return;
    const entry = (await getDayEntry(habit.id, d)) ?? await ensureDayEntry(habit, d);
    const hasAny = (habit.reminderTimes?.length ?? 0) > 0;
    const actualTime = hasAny ? time : 'default';
    const nextReminders = (() => {
      const existing = entry.reminders.find(r => r.time === actualTime);
      if (existing) {
        return entry.reminders.map(r => r.time === actualTime ? { ...r, done: !r.done } : r);
      }
      return [...entry.reminders, { time: actualTime, done: true }];
    })();
    const nextEntry: HabitDay = { ...entry, reminders: nextReminders, updatedAt: new Date().toISOString() };
    // Optimistic update
    set({ habitDaysByKey: { ...state.habitDaysByKey, [dayKey(habit.id, d)]: nextEntry } });
    await setDayEntry(nextEntry);
    emit('habit.day.updated', { habitId, date: d, entry: nextEntry });
    // Emit public event for app-wide sync
    EventBus.emit('habit:completion-changed', { habitId, date: d, completedTimes: nextEntry.reminders.filter(r=>r.done).map(r=>r.time) });
    // Cancel today's single notification if marking done
    const nowChecked = nextReminders.find(r => r.time === actualTime)?.done;
    if (nowChecked && d === toYMD(new Date())) await cancelTodayAtTime(habit.id, actualTime);
    await get().recomputeStats(habitId);
  },

  markAllDone: async (habitId, date) => {
    const state = get();
    const d = date ?? toYMD(new Date());
    const habit = state.habitsById[habitId] || await getHabit(habitId);
    if (!habit) return;
    const entry = (await getDayEntry(habit.id, d)) ?? await ensureDayEntry(habit, d);
    const reminders = entry.reminders.length > 0 ? entry.reminders : [{ time: 'default', done: true }];
    const next: HabitDay = { ...entry, reminders: reminders.map(r => ({ ...r, done: true })), updatedAt: new Date().toISOString() };
    set({ habitDaysByKey: { ...state.habitDaysByKey, [dayKey(habit.id, d)]: next } });
    await setDayEntry(next);
    emit('habit.day.updated', { habitId, date: d, entry: next });
    EventBus.emit('habit:completion-changed', { habitId, date: d, completedTimes: next.reminders.filter(r=>r.done).map(r=>r.time) });
    if (d === toYMD(new Date())) {
      for (const r of next.reminders) await cancelTodayAtTime(habit.id, r.time);
    }
    await get().recomputeStats(habitId);
  },

  addReminder: async (habitId, time) => {
    const state = get();
    const habit = state.habitsById[habitId];
    if (!habit) return;
    const updated = await addReminderTime(habit, time);
    set({ habitsById: { ...state.habitsById, [habitId]: updated } });
    emit('habit.reminders.updated', { habitId });
    EventBus.emit('habit:updated', { habit: updated });
    // Ensure today's entry reflects new time
    const ymd = toYMD(new Date());
    const entry = await ensureDayEntry(updated, ymd);
    set({ habitDaysByKey: { ...state.habitDaysByKey, [dayKey(habitId, ymd)]: entry } });
    await get().recomputeStats(habitId);
    await get().rescheduleNotifications(habitId);
  },

  editReminder: async (habitId, oldTime, newTime) => {
    const state = get();
    const habit = state.habitsById[habitId];
    if (!habit) return;
    const updated = await editReminderTime(habit, oldTime, newTime);
    set({ habitsById: { ...state.habitsById, [habitId]: updated } });
    emit('habit.reminders.updated', { habitId });
    EventBus.emit('habit:updated', { habit: updated });
    const ymd = toYMD(new Date());
    const entry = await ensureDayEntry(updated, ymd);
    set({ habitDaysByKey: { ...state.habitDaysByKey, [dayKey(habitId, ymd)]: entry } });
    await get().recomputeStats(habitId);
    await get().rescheduleNotifications(habitId);
  },

  removeReminder: async (habitId, time) => {
    const state = get();
    const habit = state.habitsById[habitId];
    if (!habit) return;
    const updated = await deleteReminderTime(habit, time);
    set({ habitsById: { ...state.habitsById, [habitId]: updated } });
    emit('habit.reminders.updated', { habitId });
    EventBus.emit('habit:updated', { habit: updated });
    const ymd = toYMD(new Date());
    const entry = await ensureDayEntry(updated, ymd);
    set({ habitDaysByKey: { ...state.habitDaysByKey, [dayKey(habitId, ymd)]: entry } });
    await get().recomputeStats(habitId);
    await get().rescheduleNotifications(habitId);
  },

  editHabit: async (patch) => {
    const state = get();
    const current = state.habitsById[patch.id] || await getHabit(patch.id);
    if (!current) return;
    const updated = await repoUpdateHabit(patch.id, patch as Partial<Habit>);
    if (!updated) return;
    set({ habitsById: { ...state.habitsById, [patch.id]: updated } });
    emit('habit.updated', { habitId: patch.id });
    EventBus.emit('habit:updated', { habit: updated });
    await get().recomputeStats(patch.id);
    // If scheduling-related fields changed, reschedule
    if (patch.hasOwnProperty('reminderTimes') || patch.hasOwnProperty('frequency') || (patch as any).hasOwnProperty('weeklyDays')) {
      await get().rescheduleNotifications(patch.id);
    }
  },

  deleteHabit: async (habitId) => {
    const state = get();
    const { [habitId]: _, ...rest } = state.habitsById;
    set({ habitsById: rest });
    await repoDeleteHabit(habitId);
    // Clear days and stats in memory
    const nextDays = { ...state.habitDaysByKey };
    Object.keys(nextDays).forEach(k => { if (k.startsWith(`habit:${habitId}:day:`)) delete nextDays[k]; });
    const nextStats = { ...state.statsById }; delete nextStats[habitId];
    set({ habitDaysByKey: nextDays, statsById: nextStats });
    emit('habit.deleted', { habitId });
    EventBus.emit('habit:deleted', { habitId });
  },

  recomputeStats: async (habitId) => {
    const habit = get().habitsById[habitId] || await getHabit(habitId);
    if (!habit) return;
    const stats = await computeStats(habit);
    set({ statsById: { ...get().statsById, [habitId]: stats } });
    await setJSON(statsKey(habitId), stats);
    emit('stats.updated', { habitId });
    // no external event; stats are derived but screens can recompute on completion-changed
  },

  rescheduleNotifications: async (habitId) => {
    const habit = get().habitsById[habitId] || await getHabit(habitId);
    if (!habit) return;
    await rescheduleForHabit(habit);
    // Cancel today's completed slots
    const today = toYMD(new Date());
    const entry = await getDayEntry(habitId, today);
    if (entry) {
      for (const r of entry.reminders) if (r.done) await cancelTodayAtTime(habitId, r.time);
    }
    emit('notifications.rescheduled', { habitId });
  },

  clearAllHabits: async () => {
    // Reset in-memory state
    set({ habitsById: {}, habitDaysByKey: {}, statsById: {}, hydrationState: 'ready', lastHydratedYMD: toYMD(new Date()) });
    // Clear persistence
    try {
      const { clearAllHabitsPersistent } = await import('../lib/habits');
      await clearAllHabitsPersistent();
    } catch {}
    // Emit events that everything is gone
    emit('habit.deleted');
    emit('stats.updated');
    EventBus.emit('habits:cleared');
  },
}));

// Helper for consumers to compute today progress quickly
export function getTodayProgress(habitId: string, state?: HabitsStoreState): { total: number; done: number; complete: boolean } {
  const s = state || useHabitsStore.getState();
  const today = toYMD(new Date());
  const entry = s.habitDaysByKey[dayKey(habitId, today)];
  if (!entry) return { total: 0, done: 0, complete: false };
  const total = entry.reminders.length;
  const done = entry.reminders.filter(r => r.done).length;
  return { total, done, complete: total > 0 && done === total };
}
