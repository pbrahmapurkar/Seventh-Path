/**
 * Comprehensive tests for the unified completion system
 * 
 * These tests ensure that all completion calculations are consistent
 * across Home, History, and Insights screens, and handle all edge cases
 * including same-day habit creation, weekly schedules, and partial reminders.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isHabitScheduledForDate,
  getHabitStatusForDate,
  getCompletionForDate,
  getCompletionSeries,
  getCompletionSummary,
  clearCompletionCaches,
  type HabitDef,
  type DayEntry,
  type CompletionOptions
} from './completion';

// Mock data for testing
const createMockHabit = (overrides: Partial<HabitDef> = {}): HabitDef => ({
  id: 'test-habit-1',
  name: 'Test Habit',
  emoji: '🧪',
  frequency: 'daily',
  reminderTimes: ['08:00', '14:00', '21:00'],
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides
});

const createMockDayEntry = (overrides: Partial<DayEntry> = {}): DayEntry => ({
  habitId: 'test-habit-1',
  date: '2024-01-15',
  reminders: [
    { time: '08:00', done: true },
    { time: '14:00', done: false },
    { time: '21:00', done: true }
  ],
  updatedAt: '2024-01-15T10:00:00.000Z',
  ...overrides
});

describe('isHabitScheduledForDate', () => {
  it('should schedule daily habits for any date after creation', () => {
    const habit = createMockHabit({ frequency: 'daily' });
    const date = '2024-01-15';
    
    expect(isHabitScheduledForDate(habit, date)).toBe(true);
  });

  it('should not schedule habits before creation date', () => {
    const habit = createMockHabit({ 
      frequency: 'daily',
      createdAt: '2024-01-20T00:00:00.000Z'
    });
    const date = '2024-01-15';
    
    expect(isHabitScheduledForDate(habit, date)).toBe(false);
  });

  it('should schedule habits on creation date by default', () => {
    const habit = createMockHabit({ 
      frequency: 'daily',
      createdAt: '2024-01-15T00:00:00.000Z'
    });
    const date = '2024-01-15';
    
    expect(isHabitScheduledForDate(habit, date)).toBe(true);
  });

  it('should not schedule habits on creation date when includeSameDay is false', () => {
    const habit = createMockHabit({ 
      frequency: 'daily',
      createdAt: '2024-01-15T00:00:00.000Z'
    });
    const date = '2024-01-15';
    const options: CompletionOptions = { includeSameDay: false };
    
    expect(isHabitScheduledForDate(habit, date, options)).toBe(false);
  });

  it('should schedule weekly habits only on selected days', () => {
    const habit = createMockHabit({ 
      frequency: 'weekly',
      weeklyDays: [1, 3, 5] // Monday, Wednesday, Friday
    });
    
    // Monday (1)
    expect(isHabitScheduledForDate(habit, '2024-01-15')).toBe(true);
    // Tuesday (2)
    expect(isHabitScheduledForDate(habit, '2024-01-16')).toBe(false);
    // Wednesday (3)
    expect(isHabitScheduledForDate(habit, '2024-01-17')).toBe(true);
  });

  it('should handle edge case of no weekly days specified', () => {
    const habit = createMockHabit({ 
      frequency: 'weekly',
      weeklyDays: undefined
    });
    
    expect(isHabitScheduledForDate(habit, '2024-01-15')).toBe(true);
  });
});

describe('getHabitStatusForDate', () => {
  it('should return correct status for completed habit', () => {
    const habit = createMockHabit();
    const dayEntry = createMockDayEntry({
      reminders: [
        { time: '08:00', done: true },
        { time: '14:00', done: true },
        { time: '21:00', done: true }
      ]
    });
    
    const status = getHabitStatusForDate(habit, '2024-01-15', dayEntry);
    
    expect(status.isScheduled).toBe(true);
    expect(status.isCompleted).toBe(true);
    expect(status.completedReminders).toBe(3);
    expect(status.totalReminders).toBe(3);
    expect(status.completionPercentage).toBe(100);
  });

  it('should return correct status for partially completed habit', () => {
    const habit = createMockHabit();
    const dayEntry = createMockDayEntry({
      reminders: [
        { time: '08:00', done: true },
        { time: '14:00', done: false },
        { time: '21:00', done: true }
      ]
    });
    
    const status = getHabitStatusForDate(habit, '2024-01-15', dayEntry);
    
    expect(status.isScheduled).toBe(true);
    expect(status.isCompleted).toBe(false);
    expect(status.completedReminders).toBe(2);
    expect(status.totalReminders).toBe(3);
    expect(status.completionPercentage).toBe(67);
  });

  it('should return correct status for unscheduled habit', () => {
    const habit = createMockHabit({ 
      frequency: 'weekly',
      weeklyDays: [1, 3, 5] // Monday, Wednesday, Friday
    });
    const dayEntry = createMockDayEntry();
    
    // Tuesday (2) - not scheduled
    const status = getHabitStatusForDate(habit, '2024-01-16', dayEntry);
    
    expect(status.isScheduled).toBe(false);
    expect(status.isCompleted).toBe(false);
    expect(status.completedReminders).toBe(0);
    expect(status.totalReminders).toBe(0);
    expect(status.completionPercentage).toBe(0);
  });

  it('should return correct status for habit with no day entry', () => {
    const habit = createMockHabit();
    
    const status = getHabitStatusForDate(habit, '2024-01-15', null);
    
    expect(status.isScheduled).toBe(true);
    expect(status.isCompleted).toBe(false);
    expect(status.completedReminders).toBe(0);
    expect(status.totalReminders).toBe(0);
    expect(status.completionPercentage).toBe(0);
  });

  it('should detect habits added today', () => {
    const habit = createMockHabit({ 
      createdAt: '2024-01-15T00:00:00.000Z'
    });
    const dayEntry = createMockDayEntry();
    
    const status = getHabitStatusForDate(habit, '2024-01-15', dayEntry);
    
    expect(status.addedToday).toBe(true);
  });
});

describe('getCompletionForDate', () => {
  const habits: HabitDef[] = [
    createMockHabit({ id: 'habit-1', name: 'Morning Exercise', frequency: 'daily' }),
    createMockHabit({ id: 'habit-2', name: 'Weekly Reading', frequency: 'weekly', weeklyDays: [1, 3, 5] }),
    createMockHabit({ id: 'habit-3', name: 'Daily Meditation', frequency: 'daily' })
  ];

  const habitDaysByKey: Record<string, DayEntry> = {
    'habit:habit-1:day:2024-01-15': createMockDayEntry({
      habitId: 'habit-1',
      reminders: [
        { time: '08:00', done: true },
        { time: '14:00', done: true }
      ]
    }),
    'habit:habit-2:day:2024-01-15': createMockDayEntry({
      habitId: 'habit-2',
      reminders: [
        { time: '19:00', done: true }
      ]
    }),
    'habit:habit-3:day:2024-01-15': createMockDayEntry({
      habitId: 'habit-3',
      reminders: [
        { time: '07:00', done: false }
      ]
    })
  };

  it('should calculate completion correctly for a single date', () => {
    const completion = getCompletionForDate('2024-01-15', habits, habitDaysByKey);
    
    expect(completion.date).toBe('2024-01-15');
    expect(completion.totalScheduled).toBe(2); // Only daily habits on Monday
    expect(completion.totalCompleted).toBe(1); // Only habit-1 is completed
    expect(completion.totalPending).toBe(1); // habit-3 is pending
    expect(completion.completionPercentage).toBe(50);
  });

  it('should handle empty habits array', () => {
    const completion = getCompletionForDate('2024-01-15', [], habitDaysByKey);
    
    expect(completion.totalScheduled).toBe(0);
    expect(completion.totalCompleted).toBe(0);
    expect(completion.totalPending).toBe(0);
    expect(completion.completionPercentage).toBe(0);
  });

  it('should respect custom habit filter', () => {
    const completion = getCompletionForDate('2024-01-15', habits, habitDaysByKey, {
      filterHabits: (habit) => habit.frequency === 'daily'
    });
    
    expect(completion.totalScheduled).toBe(2); // Only daily habits
    expect(completion.habitStatuses).toHaveLength(2);
  });

  it('should detect habits added today', () => {
    const habitsWithNew = [
      ...habits,
      createMockHabit({ 
        id: 'habit-4', 
        name: 'New Habit',
        createdAt: '2024-01-15T00:00:00.000Z'
      })
    ];
    
    const completion = getCompletionForDate('2024-01-15', habitsWithNew, habitDaysByKey);
    
    expect(completion.addedToday).toHaveLength(1);
    expect(completion.addedToday[0].name).toBe('New Habit');
  });
});

describe('getCompletionSeries', () => {
  const habits: HabitDef[] = [
    createMockHabit({ id: 'habit-1', frequency: 'daily' }),
    createMockHabit({ id: 'habit-2', frequency: 'weekly', weeklyDays: [1, 3, 5] })
  ];

  const habitDaysByKey: Record<string, DayEntry> = {
    'habit:habit-1:day:2024-01-15': createMockDayEntry({
      habitId: 'habit-1',
      date: '2024-01-15',
      reminders: [{ time: '08:00', done: true }]
    }),
    'habit:habit-1:day:2024-01-16': createMockDayEntry({
      habitId: 'habit-1',
      date: '2024-01-16',
      reminders: [{ time: '08:00', done: false }]
    }),
    'habit:habit-2:day:2024-01-15': createMockDayEntry({
      habitId: 'habit-2',
      date: '2024-01-15',
      reminders: [{ time: '19:00', done: true }]
    })
  };

  it('should generate completion series for date range', () => {
    const series = getCompletionSeries({
      start: '2024-01-15',
      end: '2024-01-17'
    }, habits, habitDaysByKey);
    
    expect(series).toHaveLength(3);
    expect(series[0].date).toBe('2024-01-15');
    expect(series[1].date).toBe('2024-01-16');
    expect(series[2].date).toBe('2024-01-17');
  });

  it('should calculate percentages correctly in series', () => {
    const series = getCompletionSeries({
      start: '2024-01-15',
      end: '2024-01-16'
    }, habits, habitDaysByKey);
    
    // 2024-01-15: 2 habits scheduled, 2 completed = 100%
    expect(series[0].percentage).toBe(100);
    // 2024-01-16: 1 habit scheduled, 0 completed = 0%
    expect(series[1].percentage).toBe(0);
  });

  it('should exclude weekends when includeWeekends is false', () => {
    const series = getCompletionSeries({
      start: '2024-01-15', // Monday
      end: '2024-01-21'    // Sunday
    }, habits, habitDaysByKey, {
      includeWeekends: false
    });
    
    // Should only include weekdays (Monday-Friday)
    expect(series).toHaveLength(5);
  });
});

describe('getCompletionSummary', () => {
  const habits: HabitDef[] = [
    createMockHabit({ id: 'habit-1', frequency: 'daily' }),
    createMockHabit({ id: 'habit-2', frequency: 'daily' })
  ];

  const habitDaysByKey: Record<string, DayEntry> = {
    'habit:habit-1:day:2024-01-15': createMockDayEntry({
      habitId: 'habit-1',
      date: '2024-01-15',
      reminders: [{ time: '08:00', done: true }]
    }),
    'habit:habit-1:day:2024-01-16': createMockDayEntry({
      habitId: 'habit-1',
      date: '2024-01-16',
      reminders: [{ time: '08:00', done: true }]
    }),
    'habit:habit-2:day:2024-01-15': createMockDayEntry({
      habitId: 'habit-2',
      date: '2024-01-15',
      reminders: [{ time: '08:00', done: false }]
    })
  };

  it('should calculate summary statistics correctly', () => {
    const summary = getCompletionSummary({
      start: '2024-01-15',
      end: '2024-01-16'
    }, habits, habitDaysByKey);
    
    expect(summary.totalDays).toBe(2);
    expect(summary.averageCompletion).toBe(50); // (100 + 0) / 2
    expect(summary.perfectDays).toBe(1); // Only 2024-01-15
    expect(summary.bestStreak).toBe(1); // Only one perfect day in a row
  });
});

describe('Memoization', () => {
  beforeEach(() => {
    clearCompletionCaches();
  });

  afterEach(() => {
    clearCompletionCaches();
  });

  it('should cache results for identical inputs', () => {
    const habits = [createMockHabit()];
    const habitDaysByKey = {};
    
    // First call
    const result1 = getCompletionForDate('2024-01-15', habits, habitDaysByKey);
    
    // Second call with same inputs
    const result2 = getCompletionForDate('2024-01-15', habits, habitDaysByKey);
    
    expect(result1).toBe(result2); // Should be the same object reference
  });

  it('should return different results for different inputs', () => {
    const habits = [createMockHabit()];
    const habitDaysByKey = {};
    
    const result1 = getCompletionForDate('2024-01-15', habits, habitDaysByKey);
    const result2 = getCompletionForDate('2024-01-16', habits, habitDaysByKey);
    
    expect(result1).not.toBe(result2);
  });

  it('should clear caches when clearCompletionCaches is called', () => {
    const habits = [createMockHabit()];
    const habitDaysByKey = {};
    
    // First call
    const result1 = getCompletionForDate('2024-01-15', habits, habitDaysByKey);
    
    // Clear caches
    clearCompletionCaches();
    
    // Second call should create new object
    const result2 = getCompletionForDate('2024-01-15', habits, habitDaysByKey);
    
    expect(result1).not.toBe(result2);
  });
});

describe('Edge Cases', () => {
  it('should handle habits with no reminder times', () => {
    const habit = createMockHabit({ reminderTimes: [] });
    const dayEntry = createMockDayEntry({
      reminders: [{ time: 'default', done: true }]
    });
    
    const status = getHabitStatusForDate(habit, '2024-01-15', dayEntry);
    
    expect(status.isScheduled).toBe(true);
    expect(status.isCompleted).toBe(true);
    expect(status.completionPercentage).toBe(100);
  });

  it('should handle habits with empty day entries', () => {
    const habit = createMockHabit();
    const dayEntry = createMockDayEntry({
      reminders: []
    });
    
    const status = getHabitStatusForDate(habit, '2024-01-15', dayEntry);
    
    expect(status.isScheduled).toBe(true);
    expect(status.isCompleted).toBe(false);
    expect(status.completionPercentage).toBe(0);
  });

  it('should handle invalid date strings gracefully', () => {
    const habit = createMockHabit();
    
    // This should not throw an error
    expect(() => {
      isHabitScheduledForDate(habit, 'invalid-date');
    }).not.toThrow();
  });

  it('should handle habits created in the future', () => {
    const habit = createMockHabit({
      createdAt: '2024-12-31T00:00:00.000Z'
    });
    const date = '2024-01-15';
    
    expect(isHabitScheduledForDate(habit, date)).toBe(false);
  });
});

describe('Performance', () => {
  it('should handle large numbers of habits efficiently', () => {
    const habits = Array.from({ length: 1000 }, (_, i) => 
      createMockHabit({ id: `habit-${i}`, name: `Habit ${i}` })
    );
    const habitDaysByKey = {};
    
    const start = performance.now();
    const completion = getCompletionForDate('2024-01-15', habits, habitDaysByKey);
    const end = performance.now();
    
    expect(completion.totalScheduled).toBe(1000);
    expect(end - start).toBeLessThan(100); // Should complete in under 100ms
  });

  it('should handle large date ranges efficiently', () => {
    const habits = [createMockHabit()];
    const habitDaysByKey = {};
    
    const start = performance.now();
    const series = getCompletionSeries({
      start: '2024-01-01',
      end: '2024-12-31'
    }, habits, habitDaysByKey);
    const end = performance.now();
    
    expect(series).toHaveLength(366); // 2024 is a leap year
    expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
  });
});






