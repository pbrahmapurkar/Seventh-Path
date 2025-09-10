import { Capacitor } from '@capacitor/core';
import type { HabitDef } from '../habits/types';
import { toYMD } from '../habits';
import { AlarmNotifications } from '../../plugins/alarmNotifications';
import { notificationService } from '../../services/notifications';

// Deterministic ID: habitId|date|time (YYYY-MM-DD|HH:mm)
export function makeNotifId(habitId: string, date: string, time: string): string {
  return `${habitId}|${date}|${time}`;
}

type WebTimer = { id: string; handle: number };
const webTimers = new Map<string, WebTimer>();
const WEB_INDEX_PREFIX = 'notif-index:'; // notif-index:<habitId> -> string[] ids
const SCHEDULED_ALARMS_KEY = 'scheduledAlarms'; // map habitId|time -> numeric id

function saveIndex(habitId: string, ids: string[]) {
  try { localStorage.setItem(`${WEB_INDEX_PREFIX}${habitId}`, JSON.stringify(ids)); } catch {}
}

function loadIndex(habitId: string): string[] {
  try {
    const raw = localStorage.getItem(`${WEB_INDEX_PREFIX}${habitId}`);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

function addToIndex(habitId: string, id: string) {
  const cur = loadIndex(habitId);
  if (!cur.includes(id)) {
    cur.push(id);
    saveIndex(habitId, cur);
  }
}

function removeFromIndex(habitId: string, id: string) {
  const cur = loadIndex(habitId).filter(x => x !== id);
  saveIndex(habitId, cur);
}

function scheduleWebOne(habit: HabitDef, date: Date, time: string) {
  const ymd = toYMD(date);
  const [hh, mm] = time.split(':').map(Number);
  const when = new Date(date);
  when.setHours(hh, mm, 0, 0);
  const now = new Date();
  if (when <= now) return; // don't schedule in the past
  const delay = when.getTime() - now.getTime();
  const id = makeNotifId(habit.id, ymd, time);
  const handle = window.setTimeout(async () => {
    // Fallback web notification via notificationService
    try {
      await notificationService.sendTestNotification(`${habit.emoji} ${habit.name}`, `Reminder for ${habit.name} at ${time}`);
    } catch {}
    // auto-remove from timers after firing
    webTimers.delete(id);
    removeFromIndex(habit.id, id);
  }, delay);
  webTimers.set(id, { id, handle });
  addToIndex(habit.id, id);
}

export async function scheduleNext7Days(habit: HabitDef): Promise<void> {
  const isNative = Capacitor.getPlatform() !== 'web';
  if (isNative) {
    // Best-effort: schedule daily repeating alarms for each time
    for (const t of habit.reminderTimes) {
      try { await AlarmNotifications.scheduleDaily({ habitId: habit.id, title: `${habit.emoji} ${habit.name}` , body: `${habit.name} at ${t}`, time: t }); } catch {}
    }
    return;
  }
  // Web: schedule one-off timers for next 7 days
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    for (const t of habit.reminderTimes) scheduleWebOne(habit, d, t);
  }
  // Maintain scheduledAlarms mapping per time
  try {
    const map = await getScheduledMap();
    for (const t of habit.reminderTimes) {
      const key = `${habit.id}|${t}`;
      if (!(key in map)) {
        map[key] = hashToInt(key);
      }
    }
    await setScheduledMap(map);
  } catch {}
}

export async function cancelAllForHabit(habitId: string): Promise<void> {
  const isNative = Capacitor.getPlatform() !== 'web';
  if (isNative) {
    try { await AlarmNotifications.cancelHabit({ habitId }); } catch {}
  }
  // Web: clear timers
  const ids = loadIndex(habitId);
  for (const id of ids) {
    const t = webTimers.get(id);
    if (t) {
      clearTimeout(t.handle);
      webTimers.delete(id);
    }
  }
  saveIndex(habitId, []);
  // Remove from mapping
  try {
    const map = await getScheduledMap();
    Object.keys(map).forEach(k => { if (k.startsWith(`${habitId}|`)) delete map[k]; });
    await setScheduledMap(map);
  } catch {}
}

export async function cancelTodayAtTime(habitId: string, time: string): Promise<void> {
  const isNative = Capacitor.getPlatform() !== 'web';
  const today = toYMD(new Date());
  const id = makeNotifId(habitId, today, time);
  if (isNative) {
    // Best-effort; plugin API doesn't support per-instance cancel. No-op to avoid canceling future ones.
    return;
  }
  const t = webTimers.get(id);
  if (t) {
    clearTimeout(t.handle);
    webTimers.delete(id);
  }
  removeFromIndex(habitId, id);
  // mapping remains for future schedule; don't remove
}

export async function rescheduleForHabit(habit: HabitDef): Promise<void> {
  await cancelAllForHabit(habit.id);
  await scheduleNext7Days(habit);
}

// scheduledAlarms helpers
async function getScheduledMap(): Promise<Record<string, number>> {
  try {
    const raw = localStorage.getItem(SCHEDULED_ALARMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
async function setScheduledMap(map: Record<string, number>): Promise<void> {
  try { localStorage.setItem(SCHEDULED_ALARMS_KEY, JSON.stringify(map)); } catch {}
}
function hashToInt(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
