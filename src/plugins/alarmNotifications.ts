import { registerPlugin } from '@capacitor/core';

export interface ScheduleDailyOptions {
  habitId: string;
  title?: string;
  body?: string;
  time: string; // HH:mm
}

export interface ScheduleWeeklyOptions extends ScheduleDailyOptions {
  weekdays: number[]; // 0-6 Sunday-Saturday
}

export interface AlarmNotificationsPlugin {
  requestPermissions(): Promise<{ status: string }>;
  scheduleDaily(options: ScheduleDailyOptions): Promise<{ ok: boolean }>;
  scheduleWeekly(options: ScheduleWeeklyOptions): Promise<{ ok: boolean }>;
  cancelHabit(options: { habitId: string }): Promise<{ ok: boolean }>;
  cancelAll(): Promise<{ ok: boolean }>;
  showNow(options: { title: string; body?: string }): Promise<{ ok: boolean }>;
}

export const AlarmNotifications = registerPlugin<AlarmNotificationsPlugin>('AlarmNotifications');
