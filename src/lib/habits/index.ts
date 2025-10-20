import { Capacitor } from '@capacitor/core';
import { postMutated } from '../syncBus';
import type { HabitActivityItem, HabitDef, HabitStats, DayEntry, DayReminderState, Frequency } from './types';

// Storage keys
const INDEX_KEY = 'habits:index'; // JSON string array of habit IDs
const habitKey = (id: string) => `habit:${id}`;
const dayKey = (id: string, ymd: string) => `habit:${id}:day:${ymd}`;
const activityKey = (id: string) => `habit:${id}:activity`;
const ONBOARDING_SELECTED = 'onboarding:selected';
const ONBOARDING_COMPLETE = 'onboarding_complete';

// Date helpers
export function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

export function daysBetween(a: Date, b: Date): number {
  const d1 = new Date(a);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(b);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
}

// Storage adapter: Preferences if available, else localStorage
async function prefsSet(key: string, value: string): Promise<void> {
  const anyWin = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
  if (prefs && Capacitor.getPlatform() !== 'web') {
    await prefs.set({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}

async function prefsGet(key: string): Promise<string | null> {
  const anyWin = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
  if (prefs && Capacitor.getPlatform() !== 'web') {
    const res = await prefs.get({ key });
    return res?.value ?? null;
  }
  return localStorage.getItem(key);
}

async function prefsRemove(key: string): Promise<void> {
  const anyWin = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
  if (prefs && Capacitor.getPlatform() !== 'web') {
    await prefs.remove({ key });
    return;
  }
  localStorage.removeItem(key);
}

async function prefsKeys(): Promise<string[]> {
  const anyWin = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
  if (prefs && Capacitor.getPlatform() !== 'web') {
    const res = await prefs.keys();
    return res?.keys ?? [];
  }
  return Object.keys(localStorage);
}

// Index helpers
export async function getHabitIds(): Promise<string[]> {
  const raw = await prefsGet(INDEX_KEY);
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw) as string[];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

async function saveHabitIds(ids: string[]): Promise<void> {
  await prefsSet(INDEX_KEY, JSON.stringify(ids));
  postMutated([INDEX_KEY]);
}

// CRUD for HabitDef
export async function getHabit(id: string): Promise<HabitDef | null> {
  const raw = await prefsGet(habitKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as HabitDef;
  } catch {
    return null;
  }
}

export async function listHabits(): Promise<HabitDef[]> {
  const ids = await getHabitIds();
  const out: HabitDef[] = [];
  for (const id of ids) {
    const h = await getHabit(id);
    if (h) out.push(h);
  }
  return out;
}

export async function createHabit(input: Omit<HabitDef, 'id' | 'createdAt'> & { id?: string }): Promise<HabitDef> {
  const id = input.id || (globalThis.crypto && 'randomUUID' in globalThis.crypto
    ? (globalThis.crypto as Crypto).randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const habit: HabitDef = {
    id,
    name: input.name,
    emoji: input.emoji,
    frequency: input.frequency,
    reminderTimes: [...(input.reminderTimes || [])].sort(),
    weeklyDays: input.weeklyDays ? [...input.weeklyDays] : undefined,
    createdAt: new Date().toISOString(),
  };
  const ids = await getHabitIds();
  if (!ids.includes(id)) {
    ids.push(id);
    await saveHabitIds(ids);
  }
  await prefsSet(habitKey(id), JSON.stringify(habit));
  postMutated([habitKey(id)]);
  return habit;
}

export async function updateHabit(id: string, patch: Partial<Omit<HabitDef, 'id' | 'createdAt'>>): Promise<HabitDef | null> {
  const existing = await getHabit(id);
  if (!existing) return null;
  const next: HabitDef = {
    ...existing,
    ...patch,
    reminderTimes: patch.reminderTimes ? [...patch.reminderTimes].sort() : existing.reminderTimes,
    weeklyDays: patch.hasOwnProperty('weeklyDays') ? (patch.weeklyDays ? [...patch.weeklyDays] : undefined) : existing.weeklyDays,
  };
  await prefsSet(habitKey(id), JSON.stringify(next));
  postMutated([habitKey(id)]);
  return next;
}

export async function deleteHabit(id: string): Promise<void> {
  // Remove from index
  const ids = await getHabitIds();
  await saveHabitIds(ids.filter(x => x !== id));
  // Remove habit def
  await prefsRemove(habitKey(id));
  postMutated([habitKey(id)]);
  // Remove day entries and activity
  const keys = await prefsKeys();
  const toRemove = keys.filter(k => k.startsWith(`habit:${id}:day:`) || k === activityKey(id));
  for (const k of toRemove) await prefsRemove(k);
}

export async function clearAllHabitsPersistent(): Promise<void> {
  // Remove all habit-related keys and indexes
  const keys = await prefsKeys();
  for (const k of keys) {
    if (
      k === INDEX_KEY ||
      k.startsWith('habit:') ||
      k.startsWith('notif-index:') ||
      k === 'scheduledAlarms' ||
      k === 'habit-store'
    ) {
      await prefsRemove(k);
    }
  }
}

// Onboarding helpers
export function makeHabitId(name: string): string {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 24);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${slug}-${rnd}`;
}

export async function setOnboardingSelected(ids: string[]): Promise<void> {
  await prefsSet(ONBOARDING_SELECTED, JSON.stringify(ids));
}
export async function getOnboardingSelected(): Promise<string[]> {
  try {
    const raw = await prefsGet(ONBOARDING_SELECTED);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids : [];
  } catch { return []; }
}
export async function clearOnboardingSelected(): Promise<void> {
  await prefsRemove(ONBOARDING_SELECTED);
}
export async function setOnboardingComplete(): Promise<void> {
  await prefsSet(ONBOARDING_COMPLETE, 'true');
}
export async function isOnboardingComplete(): Promise<boolean> {
  const v = await prefsGet(ONBOARDING_COMPLETE);
  return v === 'true';
}

// Day entry helpers
export async function getDayEntry(habitId: string, ymd: string): Promise<DayEntry | null> {
  const raw = await prefsGet(dayKey(habitId, ymd));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DayEntry;
  } catch {
    return null;
  }
}

export async function ensureDayEntry(habit: HabitDef, ymd: string): Promise<DayEntry> {
  const existing = await getDayEntry(habit.id, ymd);
  if (existing) {
    // Ensure it contains all current reminders (new ones default to unchecked)
    const times = new Set(habit.reminderTimes);
    const merged: DayReminderState[] = [];
    for (const t of habit.reminderTimes) {
      const found = existing.reminders.find(r => r.time === t);
      merged.push(found ? found : { time: t, done: false });
    }
    if (merged.length !== existing.reminders.length) {
      const updated: DayEntry = { ...existing, reminders: merged, updatedAt: new Date().toISOString() };
      const k = dayKey(habit.id, ymd);
      await prefsSet(k, JSON.stringify(updated));
      postMutated([k]);
      return updated;
    }
    return existing;
  }
  const entry: DayEntry = {
    habitId: habit.id,
    date: ymd,
    reminders: habit.reminderTimes.map((t) => ({ time: t, done: false })),
    updatedAt: new Date().toISOString(),
  };
  const k = dayKey(habit.id, ymd);
  await prefsSet(k, JSON.stringify(entry));
  postMutated([k]);
  return entry;
}

export async function setDayEntry(entry: DayEntry): Promise<void> {
  const k = dayKey(entry.habitId, entry.date);
  await prefsSet(k, JSON.stringify({ ...entry, updatedAt: new Date().toISOString() }));
  postMutated([k]);
}

export function isDayComplete(entry: DayEntry): boolean {
  return entry.reminders.length > 0 && entry.reminders.every(r => r.done);
}

// Activity log
export async function appendActivity(habitId: string, item: HabitActivityItem): Promise<void> {
  const raw = await prefsGet(activityKey(habitId));
  let list: HabitActivityItem[] = [];
  if (raw) {
    try { list = JSON.parse(raw) as HabitActivityItem[]; } catch { /* ignore */ }
  }
  list.unshift(item);
  // keep last 100
  list = list.slice(0, 100);
  await prefsSet(activityKey(habitId), JSON.stringify(list));
}

export async function getRecentActivity(habitId: string, limit = 5): Promise<HabitActivityItem[]> {
  const raw = await prefsGet(activityKey(habitId));
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as HabitActivityItem[];
    return list.slice(0, limit);
  } catch {
    return [];
  }
}

// Stats - using optimized version with caching
export { computeStats, clearDayEntryCache, clearHabitCache, getCacheStats } from './computeStatsOptimized';

// Reminder operations
export async function toggleReminderForToday(habit: HabitDef, time: string, done: boolean): Promise<DayEntry> {
  const todayYmd = toYMD(new Date());
  const entry = await ensureDayEntry(habit, todayYmd);
  const nextReminders: DayReminderState[] = entry.reminders.map(r => r.time === time ? { ...r, done } : r);
  const nextEntry: DayEntry = { ...entry, reminders: nextReminders, updatedAt: new Date().toISOString() };
  await setDayEntry(nextEntry);
  await appendActivity(habit.id, { ts: new Date().toISOString(), type: 'toggle', detail: `${time}:${done ? '1' : '0'}` });
  return nextEntry;
}

export async function addReminderTime(habit: HabitDef, time: string): Promise<HabitDef> {
  if (!/^\d{2}:\d{2}$/.test(time)) throw new Error('Invalid time format');
  const nextTimes = Array.from(new Set([...(habit.reminderTimes || []), time])).sort();
  const updated = await updateHabit(habit.id, { reminderTimes: nextTimes });
  if (updated) {
    // ensure today's entry includes it
    const ymd = toYMD(new Date());
    const entry = await ensureDayEntry(updated, ymd);
    if (!entry.reminders.some(r => r.time === time)) {
      entry.reminders.push({ time, done: false });
      await setDayEntry(entry);
    }
    await appendActivity(habit.id, { ts: new Date().toISOString(), type: 'added_reminder', detail: time });
    return updated;
  }
  throw new Error('Habit not found');
}

export async function deleteReminderTime(habit: HabitDef, time: string): Promise<HabitDef> {
  const nextTimes = (habit.reminderTimes || []).filter(t => t !== time);
  const updated = await updateHabit(habit.id, { reminderTimes: nextTimes });
  if (updated) {
    // update today's entry to remove
    const ymd = toYMD(new Date());
    const entry = await ensureDayEntry(updated, ymd);
    entry.reminders = entry.reminders.filter(r => r.time !== time);
    await setDayEntry(entry);
    await appendActivity(habit.id, { ts: new Date().toISOString(), type: 'deleted_reminder', detail: time });
    return updated;
  }
  throw new Error('Habit not found');
}

export async function editReminderTime(habit: HabitDef, oldTime: string, newTime: string): Promise<HabitDef> {
  if (!/^\d{2}:\d{2}$/.test(newTime)) throw new Error('Invalid time format');
  const times = (habit.reminderTimes || []).filter(t => t !== oldTime);
  if (!times.includes(newTime)) times.push(newTime);
  const updated = await updateHabit(habit.id, { reminderTimes: times.sort() });
  if (updated) {
    const ymd = toYMD(new Date());
    const entry = await ensureDayEntry(updated, ymd);
    entry.reminders = entry.reminders
      .filter(r => r.time !== oldTime)
      .concat([{ time: newTime, done: false }])
      .sort((a, b) => a.time.localeCompare(b.time));
    await setDayEntry(entry);
    await appendActivity(habit.id, { ts: new Date().toISOString(), type: 'edited_reminder', detail: `${oldTime}->${newTime}` });
    return updated;
  }
  throw new Error('Habit not found');
}
