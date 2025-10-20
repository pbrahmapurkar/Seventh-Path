/**
 * HabitsStore Test Suite
 * Tests store hydration, error handling, and data persistence
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useHabitsStore } from '../../store/HabitsStore';
import { createHabit } from '../../lib/habits';
import { getPreference, setPreference } from '../../lib/storage/preferences';

// Mock the preferences module
vi.mock('../../lib/storage/preferences', () => ({
  getPreference: vi.fn(),
  setPreference: vi.fn(),
}));

// Mock the habits module
vi.mock('../../lib/habits', () => ({
  createHabit: vi.fn(),
  listHabits: vi.fn(),
  getHabit: vi.fn(),
  ensureDayEntry: vi.fn(),
  getDayEntry: vi.fn(),
  computeStats: vi.fn(),
}));

// Mock the sync bus
vi.mock('../../lib/syncBus', () => ({
  start: vi.fn(),
  postMutated: vi.fn(),
}));

// Mock the event bus
vi.mock('../../lib/eventBus', () => ({
  emit: vi.fn(),
}));

// Mock the completion module
vi.mock('../../lib/completion', () => ({
  clearCompletionCaches: vi.fn(),
}));

// Mock the notifications module
vi.mock('../../lib/notifications', () => ({
  cancelTodayAtTime: vi.fn(),
  rescheduleForHabit: vi.fn(),
}));

describe('HabitsStore', () => {
  beforeEach(() => {
    // Reset store state
    useHabitsStore.getState().factoryReset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Hydration', () => {
    it('should hydrate successfully with valid data', async () => {
      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Morning Exercise',
          emoji: '🏃‍♂️',
          frequency: 'daily' as const,
          reminderTimes: ['08:00'],
          createdAt: new Date().toISOString(),
        },
      ];

      const mockStats = {
        currentStreak: 5,
        bestStreak: 10,
        completionRate: 80,
        totalCompletedDays: 20,
        weeklyProgress: [],
      };

      const mockDayEntry = {
        habitId: 'habit-1',
        date: '2024-01-01',
        reminders: [{ time: '08:00', done: true }],
        updatedAt: new Date().toISOString(),
      };

      // Mock the habits module
      const { listHabits, ensureDayEntry, getDayEntry, computeStats } = await import('../../lib/habits');
      vi.mocked(listHabits).mockResolvedValue(mockHabits);
      vi.mocked(ensureDayEntry).mockResolvedValue(mockDayEntry);
      vi.mocked(getDayEntry).mockResolvedValue(mockDayEntry);
      vi.mocked(computeStats).mockResolvedValue(mockStats);

      // Mock preferences
      vi.mocked(getPreference).mockResolvedValue([]);

      // Hydrate the store
      await useHabitsStore.getState().hydrateAll();

      // Verify state
      const state = useHabitsStore.getState();
      expect(state.hydrationState).toBe('ready');
      expect(state._hasHydrated).toBe(true);
      expect(Object.keys(state.habitsById)).toHaveLength(1);
      expect(state.habitsById['habit-1']).toEqual(mockHabits[0]);
      expect(state.statsById['habit-1']).toEqual(mockStats);
    });

    it('should handle hydration failure gracefully', async () => {
      // Mock listHabits to throw an error
      const { listHabits } = await import('../../lib/habits');
      vi.mocked(listHabits).mockRejectedValue(new Error('Storage error'));

      // Mock preferences to return empty array
      vi.mocked(getPreference).mockResolvedValue([]);

      // Hydrate the store
      await useHabitsStore.getState().hydrateAll();

      // Verify state is reset on failure
      const state = useHabitsStore.getState();
      expect(state.hydrationState).toBe('idle');
      expect(state._hasHydrated).toBe(false);
    });

    it('should handle corrupted JSON data gracefully', async () => {
      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Morning Exercise',
          emoji: '🏃‍♂️',
          frequency: 'daily' as const,
          reminderTimes: ['08:00'],
          createdAt: new Date().toISOString(),
        },
      ];

      // Mock the habits module
      const { listHabits, ensureDayEntry, getDayEntry, computeStats } = await import('../../lib/habits');
      vi.mocked(listHabits).mockResolvedValue(mockHabits);
      vi.mocked(ensureDayEntry).mockResolvedValue(null);
      vi.mocked(getDayEntry).mockResolvedValue(null);
      vi.mocked(computeStats).mockResolvedValue({
        currentStreak: 0,
        bestStreak: 0,
        completionRate: 0,
        totalCompletedDays: 0,
        weeklyProgress: [],
      });

      // Mock preferences to return corrupted data
      vi.mocked(getPreference).mockResolvedValue('invalid json');

      // Hydrate the store
      await useHabitsStore.getState().hydrateAll();

      // Verify state is still valid
      const state = useHabitsStore.getState();
      expect(state.hydrationState).toBe('ready');
      expect(state._hasHydrated).toBe(true);
      expect(Object.keys(state.habitsById)).toHaveLength(1);
    });

    it('should retry hydration after failure', async () => {
      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Morning Exercise',
          emoji: '🏃‍♂️',
          frequency: 'daily' as const,
          reminderTimes: ['08:00'],
          createdAt: new Date().toISOString(),
        },
      ];

      // Mock the habits module
      const { listHabits, ensureDayEntry, getDayEntry, computeStats } = await import('../../lib/habits');
      vi.mocked(listHabits).mockResolvedValue(mockHabits);
      vi.mocked(ensureDayEntry).mockResolvedValue(null);
      vi.mocked(getDayEntry).mockResolvedValue(null);
      vi.mocked(computeStats).mockResolvedValue({
        currentStreak: 0,
        bestStreak: 0,
        completionRate: 0,
        totalCompletedDays: 0,
        weeklyProgress: [],
      });

      // Mock preferences
      vi.mocked(getPreference).mockResolvedValue([]);

      // First hydration attempt
      await useHabitsStore.getState().hydrateAll();
      expect(useHabitsStore.getState().hydrationState).toBe('ready');

      // Force retry
      await useHabitsStore.getState().hydrateAll(true);
      expect(useHabitsStore.getState().hydrationState).toBe('ready');
    });
  });

  describe('Habit Management', () => {
    it('should add a habit successfully', async () => {
      const mockHabit = {
        id: 'habit-1',
        name: 'Morning Exercise',
        emoji: '🏃‍♂️',
        frequency: 'daily' as const,
        reminderTimes: ['08:00'],
        createdAt: new Date().toISOString(),
      };

      const mockStats = {
        currentStreak: 0,
        bestStreak: 0,
        completionRate: 0,
        totalCompletedDays: 0,
        weeklyProgress: [],
      };

      // Mock the habits module
      const { ensureDayEntry, computeStats } = await import('../../lib/habits');
      vi.mocked(ensureDayEntry).mockResolvedValue({
        habitId: 'habit-1',
        date: '2024-01-01',
        reminders: [{ time: '08:00', done: false }],
        updatedAt: new Date().toISOString(),
      });
      vi.mocked(computeStats).mockResolvedValue(mockStats);

      // Add habit
      await useHabitsStore.getState().addHabit(mockHabit);

      // Verify state
      const state = useHabitsStore.getState();
      expect(state.habitsById['habit-1']).toEqual(mockHabit);
      expect(state.statsById['habit-1']).toEqual(mockStats);
    });

    it('should delete a habit successfully', async () => {
      const mockHabit = {
        id: 'habit-1',
        name: 'Morning Exercise',
        emoji: '🏃‍♂️',
        frequency: 'daily' as const,
        reminderTimes: ['08:00'],
        createdAt: new Date().toISOString(),
      };

      // Mock the habits module
      const { deleteHabit } = await import('../../lib/habits');
      vi.mocked(deleteHabit).mockResolvedValue();

      // Add habit first
      await useHabitsStore.getState().addHabit(mockHabit);
      expect(useHabitsStore.getState().habitsById['habit-1']).toBeDefined();

      // Delete habit
      await useHabitsStore.getState().deleteHabit('habit-1');

      // Verify state
      const state = useHabitsStore.getState();
      expect(state.habitsById['habit-1']).toBeUndefined();
      expect(state.statsById['habit-1']).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      // Mock preferences to throw error
      vi.mocked(getPreference).mockRejectedValue(new Error('Storage error'));

      // Hydrate should not throw
      await expect(useHabitsStore.getState().hydrateAll()).resolves.not.toThrow();

      // State should be reset
      const state = useHabitsStore.getState();
      expect(state.hydrationState).toBe('idle');
      expect(state._hasHydrated).toBe(false);
    });

    it('should handle corrupted data gracefully', async () => {
      const mockHabits = [
        {
          id: 'habit-1',
          name: 'Morning Exercise',
          emoji: '🏃‍♂️',
          frequency: 'daily' as const,
          reminderTimes: ['08:00'],
          createdAt: new Date().toISOString(),
        },
      ];

      // Mock the habits module
      const { listHabits, ensureDayEntry, getDayEntry, computeStats } = await import('../../lib/habits');
      vi.mocked(listHabits).mockResolvedValue(mockHabits);
      vi.mocked(ensureDayEntry).mockRejectedValue(new Error('Corrupted data'));
      vi.mocked(getDayEntry).mockRejectedValue(new Error('Corrupted data'));
      vi.mocked(computeStats).mockResolvedValue({
        currentStreak: 0,
        bestStreak: 0,
        completionRate: 0,
        totalCompletedDays: 0,
        weeklyProgress: [],
      });

      // Mock preferences
      vi.mocked(getPreference).mockResolvedValue([]);

      // Hydrate should not throw
      await expect(useHabitsStore.getState().hydrateAll()).resolves.not.toThrow();

      // State should still be valid
      const state = useHabitsStore.getState();
      expect(state.hydrationState).toBe('ready');
      expect(state._hasHydrated).toBe(true);
    });
  });
});
