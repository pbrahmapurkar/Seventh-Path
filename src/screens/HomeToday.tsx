import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { HabitCard, EmptyState } from '../components/HabitCard';
import { useAppShell } from '../components/AppShell';
import { useEffect } from 'react';
import { useHabitsStore, getTodayProgress } from '../store/HabitsStore';
import { toYMD } from '../lib/habits';

export function HomeToday() {
  const { navigate, userName } = useAppShell();
  const { habitsById, statsById, hydrateAll, hydrationState, habitDaysByKey } = useHabitsStore();

  useEffect(() => { if (hydrationState !== 'ready') void hydrateAll(); }, [hydrationState, hydrateAll]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const habitList = Object.values(habitsById);
  const completedCount = habitList.filter(h => getTodayProgress(h.id).complete).length;
  const totalCount = habitList.length;

  // Completion is updated in /habit/:id as per spec

  const handleHabitClick = (id: string) => {
    navigate(`/habit/${id}`);
  };

  const handleToggleToday = async (habitId: string) => {
    const store = useHabitsStore.getState();
    const habit = store.habitsById[habitId];
    if (!habit) return;
    const progress = getTodayProgress(habitId, store);
    if (!progress.complete) {
      await store.markAllDone(habitId);
    } else {
      // Undo: toggle each done reminder to not done
      const times = (habit.reminderTimes && habit.reminderTimes.length > 0) ? habit.reminderTimes : ['default'];
      for (const t of times) {
        // Only toggle if currently done; calling toggle will flip state
        await store.toggleTime(habitId, t);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="p-6 pt-12">
        <h1 className="text-2xl font-medium mb-2">
          {getGreeting()}{userName ? `, ${userName}` : ''}!
        </h1>
        <p className="text-muted-foreground">
          {completedCount === totalCount && totalCount > 0
            ? "🎉 All habits completed today!"
            : `${completedCount} of ${totalCount} habits completed`}
        </p>
      </div>

      {/* Progress Ring */}
      {totalCount > 0 && (
        <div className="px-6 mb-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted stroke-current"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary stroke-current"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${(completedCount / totalCount) * 100}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {Math.round((completedCount / totalCount) * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Today's Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Keep it up! You're doing great.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="flex-1 px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Today's Habits</h2>
        </div>

        {habitList.length === 0 ? (
          <EmptyState
            icon={<Plus size={48} className="text-muted-foreground" />}
            title="No habits yet"
            description="Add your first habit to get started on your journey to better living."
            action={
              <Button onClick={() => navigate('/add')}>
                <Plus size={16} className="mr-2" />
                Add your first habit
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {habitList.map((habit) => {
              const { total, done, complete } = getTodayProgress(habit.id);
              const streak = statsById[habit.id]?.currentStreak ?? 0;
              const progress = total > 0 ? Math.round((done / total) * 100) : (complete ? 100 : 0);
              const timesLabel = (habit.reminderTimes && habit.reminderTimes.length)
                ? habit.reminderTimes.join(', ')
                : undefined;
              return (
               <HabitCard
                 key={habit.id}
                 id={habit.id}
                 title={habit.name}
                 emoji={habit.emoji}
                 streak={streak}
                 completed={complete}
                 frequency={habit.frequency}
                 reminderTime={timesLabel}
                 progress={progress}
                 showCheckbox={true}
                 onToggle={handleToggleToday}
                 onClick={() => handleHabitClick(habit.id)}
               />
              );
            })}
         </div>
       )}
     </div>

      {/* Floating Add Button */}
      <button
        onClick={() => navigate('/add')}
        className="fixed bottom-24 right-6 bg-primary text-primary-foreground shadow-lg rounded-full w-14 h-14 flex items-center justify-center"
        aria-label="Add Habit"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
