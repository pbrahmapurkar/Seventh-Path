import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DayEntry, HabitActivityItem, HabitDef, HabitStats } from '../../lib/habits/types';
import { getRecentActivity, isDayComplete, toYMD } from '../../lib/habits';
import { useHabitsStore } from '../../store/HabitsStore';

export function useHabitDetails(habitId: string) {
  const store = useHabitsStore();
  // Live bindings to store state
  const habit = store.habitsById[habitId] || null;
  const todayKey = `habit:${habitId}:day:${toYMD(new Date())}`;
  const todayEntry = (store.habitDaysByKey as any)[todayKey] || null;
  const stats = store.statsById[habitId] || null;
  const [activity, setActivity] = useState<HabitActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (store.hydrationState !== 'ready') await store.hydrateAll();
      setActivity(await getRecentActivity(habitId, 5));
    } catch (e: any) {
      setError(e?.message || 'Failed to load habit');
    } finally {
      setLoading(false);
    }
  }, [habitId]);

  useEffect(() => { refresh(); }, [refresh]);

  const completedToday = useMemo(() => todayEntry ? isDayComplete(todayEntry) : false, [todayEntry]);

  const toggleReminder = useCallback(async (time: string, done: boolean) => {
    if (!habit) return;
    // Optimistic: store action updates state synchronously
    await store.toggleTime(habit.id, time);
  }, [habit, store]);

  const addReminder = useCallback(async (time: string) => {
    if (!habit) return;
    await store.addReminder(habit.id, time);
  }, [habit, store]);

  const removeReminder = useCallback(async (time: string) => {
    if (!habit) return;
    await store.removeReminder(habit.id, time);
  }, [habit, store]);

  const updateReminderTime = useCallback(async (oldTime: string, newTime: string) => {
    if (!habit) return;
    await store.editReminder(habit.id, oldTime, newTime);
  }, [habit, store]);

  const markCompletedToday = useCallback(async () => {
    if (!habit) return;
    await store.markAllDone(habit.id);
  }, [habit, store]);

  const removeHabit = useCallback(async () => {
    if (!habit) return;
    await store.deleteHabit(habit.id);
  }, [habit, store]);

  return {
    habit, todayEntry, stats, activity, loading, error,
    completedToday,
    refresh,
    toggleReminder,
    addReminder,
    removeReminder,
    updateReminderTime,
    markCompletedToday,
    removeHabit,
  };
}
