import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type PendingResult } from '@capacitor/local-notifications';
import type { HabitDef } from '../habits/types';

// Migration key to ensure one-time cleanup
const MIGRATION_FLAG_KEY = 'notifications:migrated:v1';

// Preferences bridge (works on web and native)
async function setPref(key: string, value: string): Promise<void> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    if (prefs && Capacitor.getPlatform() !== 'web') {
      await prefs.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  } catch {}
}

async function getPref(key: string): Promise<string | null> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    if (prefs && Capacitor.getPlatform() !== 'web') {
      const res = await prefs.get({ key });
      return res.value ?? null;
    }
    return localStorage.getItem(key);
  } catch { return null; }
}

// Deterministic numeric id (Android requires 32-bit int)
export function toJavaIntId(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  h = Math.abs(h);
  if (h === 0) h = 1;
  return h % 2147483647;
}

// Sound name mapping per platform
export function getNativeSoundName(): string {
  const platform = Capacitor.getPlatform();
  // Android uses raw resource name without extension; repo currently ships android/app/src/main/res/raw/ting.mp3
  // iOS expects a bundled filename (if present). If not present, system default is used.
  return platform === 'ios' ? 'ting_positive.mp3' : 'ting';
}

// Create channel for reminders (Android)
export async function ensureReminderChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    await LocalNotifications.createChannel({
      id: 'habit-reminders-ting',
      name: 'Habit Reminders',
      description: 'Notifications for habit reminders',
      importance: 4,
      visibility: 1,
      sound: getNativeSoundName(),
      vibration: true,
      lights: true,
    });
  } catch {
    // ignore
  }
}

// Compute next valid dates based on daily/weekly rules + 5-minute immediate reschedule window
export function computeNextOccurrences(
  time: string,
  frequency: 'daily' | 'weekly',
  weekdays?: number[],
  count: number = 7
): Date[] {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const dates: Date[] = [];
  const withinWindow = (target: Date) => {
    const diff = target.getTime() - now.getTime();
    return diff >= 60_000 || (diff >= 0 && diff < 5 * 60_000);
  };
  console.log('[NOTIFICATIONS computeNextOccurrences] input', {
    time,
    frequency,
    weekdays,
    count,
    now,
  });

  if (frequency === 'daily' || !weekdays || weekdays.length === 0) {
    let d = new Date();
    d.setHours(hours, minutes, 0, 0);
    if (!withinWindow(d)) d.setDate(d.getDate() + 1);
    for (let i = 0; i < count; i++) dates.push(new Date(d.getTime() + i * 86400000));
  } else {
    // Weekly selection: walk forward day-by-day and select matching weekdays
    let i = 0;
    while (dates.length < count && i < 28) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(hours, minutes, 0, 0);
      const isToday = i === 0;
      if (weekdays.includes(d.getDay())) {
        if (!isToday || withinWindow(d)) dates.push(d);
      }
      i++;
    }
  }
  console.log('[NOTIFICATIONS computeNextOccurrences] output', dates);
  return dates;
}

// Build localized title/body
export function buildTitle(habit: HabitDef): string {
  const emoji = habit.emoji ? habit.emoji + ' ' : '';
  return `${emoji}${habit.name}`;
}
export function buildBody(habit: HabitDef): string {
  return `Time for your ${habit.name}!`;
}

/**
 * Check if habit is completed for a given date
 * Used to suppress notifications for already-completed habits
 */
async function isHabitCompletedForDate(habitId: string, ymd: string): Promise<boolean> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    const key = `habit:${habitId}:day:${ymd}`;
    
    let dayDataStr: string | null = null;
    
    if (prefs && Capacitor.getPlatform() !== 'web') {
      const res = await prefs.get({ key });
      dayDataStr = res.value;
    } else {
      dayDataStr = localStorage.getItem(key);
    }
    
    if (!dayDataStr) return false;
    
    const dayData = JSON.parse(dayDataStr);
    const reminders = dayData?.reminders || [];
    
    // Habit is completed if all reminders are marked as done
    return reminders.length > 0 && reminders.every((r: any) => r.done === true);
  } catch (error) {
    console.error('Error checking habit completion:', error);
    return false;
  }
}

// Schedule N upcoming one-off notifications for a reminder
// Will skip notifications for dates where habit is already completed
export async function scheduleReminderInstances(
  habit: HabitDef,
  time: string,
  frequency: 'daily' | 'weekly',
  weekdays?: number[]
): Promise<number[]> {
  await ensureReminderChannel();
  const dates = computeNextOccurrences(time, frequency, weekdays, 7);
  const title = buildTitle(habit);
  const body = buildBody(habit);
  const sound = getNativeSoundName();
  const scheduled: { id: number; title: string; body: string; schedule: { at: Date }; channelId: string; sound?: string; extra: any; actionTypeId?: string }[] = [];
  const ids: number[] = [];
  
  for (const at of dates) {
    const ymd = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`;
    
    // Check if habit is already completed for this date
    const isCompleted = await isHabitCompletedForDate(habit.id, ymd);
    
    if (isCompleted) {
      console.log(`[NOTIFICATIONS] Skipping notification for ${habit.name} on ${ymd} - already completed`);
      continue;
    }
    
    const key = `${habit.id}|${ymd}|${time}`;
    const id = toJavaIntId(key);
    ids.push(id);
    // Fire 1 minute earlier than selected time; clamp to now if needed
    const earlyAt = new Date(at.getTime() - 60_000);
    const now = new Date();
    const atToUse = earlyAt.getTime() < now.getTime() ? new Date(now.getTime() + 500) : earlyAt;
    scheduled.push({
      id,
      title,
      body,
      schedule: { at: atToUse },
      channelId: 'habit-reminders-ting',
      sound,
      smallIcon: 'notification_icon',
      extra: { habitId: habit.id, reminderTime: time, type: 'habit-reminder' },
      actionTypeId: 'HABIT_REM',
    });
  }
  if (scheduled.length) {
    console.log('[NOTIFICATIONS scheduleReminderInstances]', {
      habitId: habit.id,
      time,
      frequency,
      weekdays,
      count: scheduled.length,
      notifications: scheduled.map((n) => ({
        id: n.id,
        at: n.schedule.at,
        channelId: n.channelId,
        extra: n.extra,
      })),
    });
    await LocalNotifications.schedule({ notifications: scheduled });
  }
  return ids;
}

// Cancel all pending notifications for a given habit id
export async function cancelAllForHabit(habitId: string): Promise<void> {
  const pending: PendingResult = await LocalNotifications.getPending();
  const ids = pending.notifications
    .filter((n) => (n?.extra as any)?.habitId === habitId || String(n?.id).includes(habitId))
    .map((n) => n.id)
    .filter((id): id is number => typeof id === 'number');
  if (ids.length) await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
}

// Cancel a single today instance at a specific time (best-effort)
export async function cancelTodayAtTime(habitId: string, time: string): Promise<void> {
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const key = `${habitId}|${ymd}|${time}`;
  const id = toJavaIntId(key);
  try { await LocalNotifications.cancel({ notifications: [{ id }] }); } catch {}
}

// Reschedule a habit by clearing prior and scheduling fresh instances
export async function rescheduleHabit(habit: HabitDef, frequency: 'daily' | 'weekly' = 'daily', weekdays?: number[]): Promise<void> {
  await cancelAllForHabit(habit.id);
  for (const t of habit.reminderTimes || []) {
    await scheduleReminderInstances(habit, t, frequency, weekdays);
  }
}

// Cancel all pending notifications across the app (old and new)
export async function cancelAllPendingNotifications(): Promise<void> {
  try {
    const pending: PendingResult = await LocalNotifications.getPending();
    const ids = pending.notifications.map((n) => n.id).filter((id): id is number => typeof id === 'number');
    if (ids.length) await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
  } catch {}
  // Try legacy plugin if present
  try {
    const { AlarmNotifications } = await import('../../plugins/alarmNotifications');
    await AlarmNotifications.cancelAll();
  } catch {}
  // Clear local indices used by older web schedulers
  try { localStorage.removeItem('scheduled-notifications'); } catch {}
  try {
    const keys: string[] = Object.keys(localStorage);
    for (const k of keys) if (k.startsWith('notif-index:')) localStorage.removeItem(k);
    localStorage.removeItem('scheduledAlarms');
  } catch {}
}

// One-time migration: cancel old schedules and mark migrated
export async function runMigrationOnce(): Promise<void> {
  const flag = await getPref(MIGRATION_FLAG_KEY);
  if (flag === '1') return;
  await cancelAllPendingNotifications();
  await setPref(MIGRATION_FLAG_KEY, '1');
}

// Simple helpers
export async function getPendingCount(): Promise<number> {
  try {
    const pending: PendingResult = await LocalNotifications.getPending();
    return pending.notifications.length;
  } catch { return 0; }
}

export async function requestPermissions(): Promise<'granted' | 'denied' | 'prompt'> {
  try {
    const res = await LocalNotifications.requestPermissions();
    const d = res.display as any;
    if (d === 'granted') return 'granted';
    if (d === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'denied';
  }
}

export async function checkPermissions(): Promise<'granted' | 'denied' | 'prompt'> {
  try {
    const res = await LocalNotifications.checkPermissions();
    const d = res.display as any;
    if (d === 'granted') return 'granted';
    if (d === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'prompt';
  }
}

export async function openSystemSettings(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appMod = require('@capacitor/app');
    const AppCap = appMod?.App;
    if (AppCap && AppCap.openSettings) await AppCap.openSettings();
  } catch {}
}
