import { toYMD } from './habits';
import type { HabitDef } from './types';

export interface DayHistoryEntry {
  date: string; // YYYY-MM-DD
  habits: Array<{
    id: string;
    name: string;
    emoji: string;
    completed: boolean;
    times: string[];
    createdAt: string; // When the habit was created
  }>;
  completionRate: number;
}

/**
 * Get habits that were active on a specific date
 * A habit is considered "active" on a date if:
 * 1. It was created on or before that date, AND
 * 2. For weekly habits, the date falls on a selected weekday
 */
export function getHabitsActiveOnDate(habits: HabitDef[], targetDate: string): HabitDef[] {
  const targetDateObj = new Date(targetDate);
  const targetDayOfWeek = targetDateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  return habits.filter(habit => {
    const habitCreatedDate = toYMD(new Date(habit.createdAt));
    
    // Must be created on or before the target date
    if (habitCreatedDate > targetDate) {
      return false;
    }
    
    // Daily habits are always active
    if (habit.frequency === 'daily') {
      return true;
    }
    
    // Weekly habits are only active on selected days
    if (habit.frequency === 'weekly' && habit.weeklyDays) {
      return habit.weeklyDays.includes(targetDayOfWeek);
    }
    
    // Default to active if no frequency specified (backward compatibility)
    return true;
  });
}

/**
 * Generate rolling 7-day history window
 * Shows today and the previous 6 days
 */
export function generateRollingHistory(
  habits: HabitDef[],
  habitDaysByKey: Record<string, any>,
  maxDays: number = 7
): DayHistoryEntry[] {
  const history: DayHistoryEntry[] = [];
  
  // Generate the last 7 days (today + 6 previous days)
  for (let i = 0; i < maxDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = toYMD(date);
    
    // Get habits that were active on this date
    const activeHabits = getHabitsActiveOnDate(habits, dateStr);
    
    // Map habits to their completion status for this day
    const dayHabits = activeHabits.map(habit => {
      const dayKey = `habit:${habit.id}:day:${dateStr}`;
      const dayEntry = habitDaysByKey[dayKey];
      const completed = dayEntry ? dayEntry.complete : false;
      
      return {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        completed,
        times: habit.reminderTimes || [],
        createdAt: habit.createdAt
      };
    });

    // Calculate completion rate
    const completedCount = dayHabits.filter(h => h.completed).length;
    const completionRate = activeHabits.length > 0 ? (completedCount / activeHabits.length) * 100 : 0;

    history.push({
      date: dateStr,
      habits: dayHabits,
      completionRate
    });
  }
  
  // Return in chronological order (oldest first)
  return history.reverse();
}

/**
 * Get habit creation/deletion changes for a specific day
 * This helps track when habits were added or removed
 */
export function getHabitChangesForDay(
  habits: HabitDef[],
  targetDate: string,
  previousDate?: string
): {
  added: HabitDef[];
  removed: HabitDef[];
} {
  const activeToday = getHabitsActiveOnDate(habits, targetDate);
  
  if (!previousDate) {
    // If no previous date, all active habits are "added" today
    return {
      added: activeToday,
      removed: []
    };
  }
  
  const activeYesterday = getHabitsActiveOnDate(habits, previousDate);
  
  // Find habits that were added today (exist today but not yesterday)
  const added = activeToday.filter(habit => 
    !activeYesterday.some(prevHabit => prevHabit.id === habit.id)
  );
  
  // Find habits that were removed today (existed yesterday but not today)
  const removed = activeYesterday.filter(habit => 
    !activeToday.some(currHabit => currHabit.id === habit.id)
  );
  
  return { added, removed };
}

/**
 * Format date for display in history
 */
export function formatHistoryDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateStr === toYMD(today)) {
    return 'Today';
  } else if (dateStr === toYMD(yesterday)) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

/**
 * Get completion status color class
 */
export function getCompletionColorClass(completionRate: number, isToday: boolean): string {
  if (isToday) {
    return 'border-primary bg-primary/10 text-primary font-semibold';
  } else if (completionRate === 100) {
    return 'border-green-500 bg-green-500/20 text-green-700 dark:text-green-300';
  } else if (completionRate > 0) {
    return 'border-orange-400 bg-orange-400/20 text-orange-700 dark:text-orange-300';
  } else {
    return 'border-muted bg-muted/30 text-muted-foreground';
  }
}
