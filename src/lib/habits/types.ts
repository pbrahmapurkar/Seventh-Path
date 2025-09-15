// Types for Habits and per-day tracking

export type Frequency = 'daily' | 'weekly';

export interface HabitDef {
  id: string;
  name: string;
  emoji: string; // e.g. "💧"
  frequency: Frequency; // Daily/Weekly habit
  reminderTimes: string[]; // e.g. ["08:00", "14:00", "21:00"]
  // For weekly frequency, selected weekdays (0-6, Sunday=0)
  weeklyDays?: number[];
  createdAt: string; // ISO date string
}

export interface DayReminderState {
  time: string; // HH:mm
  done: boolean;
}

export interface DayEntry {
  habitId: string;
  date: string; // YYYY-MM-DD
  reminders: DayReminderState[]; // snapshot for the day
  // optional activity metadata
  updatedAt?: string; // ISO
}

export interface HabitActivityItem {
  ts: string; // ISO timestamp
  type: 'completed' | 'toggle' | 'added_reminder' | 'edited_reminder' | 'deleted_reminder';
  detail?: string; // freeform (e.g., time value)
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  completionRate: number; // 0-100
  totalCompletedDays: number;
  weeklyProgress: { date: string; complete: boolean }[]; // last 7 days
}
