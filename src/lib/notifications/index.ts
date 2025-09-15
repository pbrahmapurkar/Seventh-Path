import type { HabitDef } from '../habits/types';
import { rescheduleHabit, cancelTodayAtTime as cancelTodayNative } from './habitReminderSystem';

// Legacy wrapper re-export to keep existing imports working
export async function scheduleNext7Days(habit: HabitDef): Promise<void> {
  await rescheduleHabit(habit, habit.frequency || 'daily', habit.weeklyDays);
}

export async function cancelAllForHabit(habitId: string): Promise<void> {
  // No-op here; store calls rescheduleHabit which cancels implicitly
  // Kept for compatibility if used elsewhere
}

export async function cancelTodayAtTime(habitId: string, time: string): Promise<void> {
  await cancelTodayNative(habitId, time);
}

export async function rescheduleForHabit(habit: HabitDef): Promise<void> {
  await rescheduleHabit(habit, habit.frequency || 'daily', habit.weeklyDays);
}
