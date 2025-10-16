/**
 * Unified completion calculation system for Seventh Path
 * 
 * This module provides a single source of truth for all completion calculations
 * across Home, History, and Insights screens. It ensures consistent percentages
 * and handles all edge cases including habit creation timestamps, weekly schedules,
 * reminder granularity, and same-day additions.
 */

import { toYMD } from './habits';
import type { HabitDef, DayEntry } from './habits/types';

// ============================================================================
// TYPES
// ============================================================================

export interface CompletionOptions {
  /** Include habits created on the same day as the target date */
  includeSameDay?: boolean;
  /** Include habits that were deleted after the target date */
  includeDeleted?: boolean;
  /** Custom habit filter function */
  filterHabits?: (habit: HabitDef) => boolean;
}

export interface HabitStatus {
  habitId: string;
  name: string;
  emoji: string;
  isScheduled: boolean;
  isCompleted: boolean;
  completedReminders: number;
  totalReminders: number;
  completionPercentage: number;
  addedToday: boolean;
  reminderDetails: Array<{
    time: string;
    done: boolean;
  }>;
}

export interface DayCompletion {
  date: string;
  scheduledHabits: HabitDef[];
  completedHabits: HabitDef[];
  pendingHabits: HabitDef[];
  totalScheduled: number;
  totalCompleted: number;
  totalPending: number;
  completionPercentage: number;
  addedToday: HabitDef[];
  allRemindersDone: boolean;
  habitStatuses: HabitStatus[];
}

export interface CompletionSeriesItem {
  date: string;
  label: string;
  completed: number;
  total: number;
  percentage: number;
  addedToday: number;
  allRemindersDone: boolean;
}

export interface CompletionSeriesOptions {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  includeWeekends?: boolean;
  filterHabits?: (habit: HabitDef) => boolean;
}

// ============================================================================
// CORE COMPLETION LOGIC
// ============================================================================

/**
 * Determines if a habit is scheduled for a specific date
 * 
 * @param habit - The habit definition
 * @param date - Target date in YYYY-MM-DD format
 * @param options - Additional options for scheduling logic
 * @returns True if the habit should be active on this date
 * 
 * @example
 * ```typescript
 * const isScheduled = isHabitScheduledForDate(habit, '2024-01-15', {
 *   includeSameDay: true
 * });
 * ```
 */
export function isHabitScheduledForDate(
  habit: HabitDef, 
  date: string, 
  options: CompletionOptions = {}
): boolean {
  const { includeSameDay = true } = options;
  
  // Check if habit was created on or before this date
  const habitCreatedDate = toYMD(new Date(habit.createdAt));
  if (habitCreatedDate > date) {
    return false;
  }
  
  // If habit was created on the same day, respect includeSameDay option
  if (habitCreatedDate === date && !includeSameDay) {
    return false;
  }
  
  // Daily habits are always scheduled
  if (habit.frequency === 'daily') {
    return true;
  }
  
  // Weekly habits are only scheduled on selected days
  if (habit.frequency === 'weekly' && habit.weeklyDays) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return habit.weeklyDays.includes(dayOfWeek);
  }
  
  // Default to scheduled if no frequency specified (backward compatibility)
  return true;
}

/**
 * Gets the completion status for a specific habit on a specific date
 * 
 * @param habit - The habit definition
 * @param date - Target date in YYYY-MM-DD format
 * @param dayEntry - The day entry from the store
 * @param options - Additional options
 * @returns Detailed habit status information
 * 
 * @example
 * ```typescript
 * const status = getHabitStatusForDate(habit, '2024-01-15', dayEntry, {
 *   includeSameDay: true
 * });
 * console.log(`${status.name}: ${status.completionPercentage}% complete`);
 * ```
 */
export function getHabitStatusForDate(
  habit: HabitDef,
  date: string,
  dayEntry: DayEntry | null,
  options: CompletionOptions = {}
): HabitStatus {
  const isScheduled = isHabitScheduledForDate(habit, date, options);
  const habitCreatedDate = toYMD(new Date(habit.createdAt));
  const addedToday = habitCreatedDate === date;
  
  if (!isScheduled || !dayEntry) {
    return {
      habitId: habit.id,
      name: habit.name,
      emoji: habit.emoji,
      isScheduled: false,
      isCompleted: false,
      completedReminders: 0,
      totalReminders: 0,
      completionPercentage: 0,
      addedToday,
      reminderDetails: []
    };
  }
  
  const totalReminders = dayEntry.reminders.length;
  const completedReminders = dayEntry.reminders.filter(r => r.done).length;
  const isCompleted = totalReminders > 0 && completedReminders === totalReminders;
  const completionPercentage = totalReminders > 0 ? Math.round((completedReminders / totalReminders) * 100) : 0;
  
  return {
    habitId: habit.id,
    name: habit.name,
    emoji: habit.emoji,
    isScheduled: true,
    isCompleted,
    completedReminders,
    totalReminders,
    completionPercentage,
    addedToday,
    reminderDetails: dayEntry.reminders.map(r => ({
      time: r.time,
      done: r.done
    }))
  };
}

/**
 * Gets comprehensive completion data for a specific date
 * 
 * @param date - Target date in YYYY-MM-DD format
 * @param habits - All habits from the store
 * @param habitDaysByKey - Day entries from the store
 * @param options - Additional options
 * @returns Complete day completion information
 * 
 * @example
 * ```typescript
 * const completion = getCompletionForDate('2024-01-15', habits, habitDaysByKey, {
 *   includeSameDay: true
 * });
 * console.log(`Day completion: ${completion.completionPercentage}%`);
 * ```
 */
export function getCompletionForDate(
  date: string,
  habits: HabitDef[],
  habitDaysByKey: Record<string, DayEntry>,
  options: CompletionOptions = {}
): DayCompletion {
  const { filterHabits } = options;
  
  // Filter habits if custom filter provided
  const filteredHabits = filterHabits ? habits.filter(filterHabits) : habits;
  
  // Get habits scheduled for this date
  const scheduledHabits = filteredHabits.filter(habit => 
    isHabitScheduledForDate(habit, date, options)
  );
  
  // Get habit statuses for this date
  const habitStatuses = scheduledHabits.map(habit => {
    const dayKey = `habit:${habit.id}:day:${date}`;
    const dayEntry = habitDaysByKey[dayKey];
    return getHabitStatusForDate(habit, date, dayEntry, options);
  });
  
  // Separate completed and pending habits
  const completedHabits = scheduledHabits.filter(habit => {
    const status = habitStatuses.find(s => s.habitId === habit.id);
    return status?.isCompleted ?? false;
  });
  
  const pendingHabits = scheduledHabits.filter(habit => {
    const status = habitStatuses.find(s => s.habitId === habit.id);
    return status?.isScheduled && !status?.isCompleted;
  });
  
  // Calculate totals
  const totalScheduled = scheduledHabits.length;
  const totalCompleted = completedHabits.length;
  const totalPending = pendingHabits.length;
  
  // Calculate completion percentage
  const completionPercentage = totalScheduled > 0 
    ? Math.round((totalCompleted / totalScheduled) * 100) 
    : 0;
  
  // Get habits added today
  const addedToday = scheduledHabits.filter(habit => {
    const status = habitStatuses.find(s => s.habitId === habit.id);
    return status?.addedToday ?? false;
  });
  
  // Check if all reminders are done
  const allRemindersDone = habitStatuses.every(status => 
    !status.isScheduled || status.isCompleted
  );
  
  return {
    date,
    scheduledHabits,
    completedHabits,
    pendingHabits,
    totalScheduled,
    totalCompleted,
    totalPending,
    completionPercentage,
    addedToday,
    allRemindersDone,
    habitStatuses
  };
}

/**
 * Gets a series of completion data for a date range
 * 
 * @param options - Date range and filtering options
 * @param habits - All habits from the store
 * @param habitDaysByKey - Day entries from the store
 * @returns Ordered array of daily completion stats
 * 
 * @example
 * ```typescript
 * const series = getCompletionSeries({
 *   start: '2024-01-01',
 *   end: '2024-01-07'
 * }, habits, habitDaysByKey);
 * 
 * series.forEach(day => {
 *   console.log(`${day.date}: ${day.percentage}% complete`);
 * });
 * ```
 */
export function getCompletionSeries(
  options: CompletionSeriesOptions,
  habits: HabitDef[],
  habitDaysByKey: Record<string, DayEntry>
): CompletionSeriesItem[] {
  const { start, end, includeWeekends = true, filterHabits } = options;
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  const series: CompletionSeriesItem[] = [];
  
  // Generate date range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = toYMD(d);
    
    // Skip weekends if not included
    if (!includeWeekends) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        continue;
      }
    }
    
    // Get completion for this date
    const completion = getCompletionForDate(dateStr, habits, habitDaysByKey, {
      includeSameDay: true,
      filterHabits
    });
    
    // Create series item
    const seriesItem: CompletionSeriesItem = {
      date: dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      completed: completion.totalCompleted,
      total: completion.totalScheduled,
      percentage: completion.completionPercentage,
      addedToday: completion.addedToday.length,
      allRemindersDone: completion.allRemindersDone
    };
    
    series.push(seriesItem);
  }
  
  return series;
}

// ============================================================================
// MEMOIZATION HELPERS
// ============================================================================

/**
 * Memoized version of getCompletionForDate for performance optimization
 * 
 * @param date - Target date in YYYY-MM-DD format
 * @param habits - All habits from the store
 * @param habitDaysByKey - Day entries from the store
 * @param options - Additional options
 * @returns Memoized completion data
 */
export function getCompletionForDateMemoized(
  date: string,
  habits: HabitDef[],
  habitDaysByKey: Record<string, DayEntry>,
  options: CompletionOptions = {}
): DayCompletion {
  // Create a cache key based on inputs
  const cacheKey = `${date}-${habits.length}-${Object.keys(habitDaysByKey).length}-${JSON.stringify(options)}`;
  
  // Simple in-memory cache (in production, consider using a more sophisticated caching solution)
  if (!getCompletionForDateMemoized.cache) {
    getCompletionForDateMemoized.cache = new Map();
  }
  
  if (getCompletionForDateMemoized.cache.has(cacheKey)) {
    return getCompletionForDateMemoized.cache.get(cacheKey);
  }
  
  const result = getCompletionForDate(date, habits, habitDaysByKey, options);
  getCompletionForDateMemoized.cache.set(cacheKey, result);
  
  // Clear cache if it gets too large (simple LRU-like behavior)
  if (getCompletionForDateMemoized.cache.size > 100) {
    getCompletionForDateMemoized.cache.clear();
  }
  
  return result;
}

// Add cache property to the function
(getCompletionForDateMemoized as any).cache = new Map<string, DayCompletion>();

/**
 * Memoized version of getCompletionSeries for performance optimization
 * 
 * @param options - Date range and filtering options
 * @param habits - All habits from the store
 * @param habitDaysByKey - Day entries from the store
 * @returns Memoized completion series
 */
export function getCompletionSeriesMemoized(
  options: CompletionSeriesOptions,
  habits: HabitDef[],
  habitDaysByKey: Record<string, DayEntry>
): CompletionSeriesItem[] {
  const cacheKey = `${options.start}-${options.end}-${habits.length}-${Object.keys(habitDaysByKey).length}-${JSON.stringify(options)}`;
  
  if (!getCompletionSeriesMemoized.cache) {
    getCompletionSeriesMemoized.cache = new Map();
  }
  
  if (getCompletionSeriesMemoized.cache.has(cacheKey)) {
    return getCompletionSeriesMemoized.cache.get(cacheKey);
  }
  
  const result = getCompletionSeries(options, habits, habitDaysByKey);
  getCompletionSeriesMemoized.cache.set(cacheKey, result);
  
  if (getCompletionSeriesMemoized.cache.size > 50) {
    getCompletionSeriesMemoized.cache.clear();
  }
  
  return result;
}

// Add cache property to the function
(getCompletionSeriesMemoized as any).cache = new Map<string, CompletionSeriesItem[]>();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clears all memoization caches
 * Useful for testing or when you want to force recalculation
 */
export function clearCompletionCaches(): void {
  if (getCompletionForDateMemoized.cache) {
    getCompletionForDateMemoized.cache.clear();
  }
  if (getCompletionSeriesMemoized.cache) {
    getCompletionSeriesMemoized.cache.clear();
  }
}

/**
 * Gets a summary of completion statistics for a date range
 * 
 * @param options - Date range and filtering options
 * @param habits - All habits from the store
 * @param habitDaysByKey - Day entries from the store
 * @returns Summary statistics
 */
export function getCompletionSummary(
  options: CompletionSeriesOptions,
  habits: HabitDef[],
  habitDaysByKey: Record<string, DayEntry>
): {
  totalDays: number;
  averageCompletion: number;
  perfectDays: number;
  totalHabitsAdded: number;
  bestStreak: number;
} {
  const series = getCompletionSeries(options, habits, habitDaysByKey);
  
  const totalDays = series.length;
  const averageCompletion = totalDays > 0 
    ? Math.round(series.reduce((sum, day) => sum + day.percentage, 0) / totalDays)
    : 0;
  
  const perfectDays = series.filter(day => day.percentage === 100).length;
  const totalHabitsAdded = series.reduce((sum, day) => sum + day.addedToday, 0);
  
  // Calculate best streak
  let bestStreak = 0;
  let currentStreak = 0;
  
  for (const day of series) {
    if (day.percentage === 100) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return {
    totalDays,
    averageCompletion,
    perfectDays,
    totalHabitsAdded,
    bestStreak
  };
}

