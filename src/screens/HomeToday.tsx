import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { HabitCard, EmptyState } from '../components/HabitCard';
import { useAppShell } from '../components/AppShell';

// Mock habit store for now - we'll replace with real store later
const mockHabits = [
  {
    id: '1',
    title: 'Drink Water',
    emoji: '💧',
    streak: 5,
    completed: true,
  },
  {
    id: '2',
    title: 'Morning Walk',
    emoji: '🚶',
    streak: 3,
    completed: false,
  },
  {
    id: '3',
    title: 'Read 20 mins',
    emoji: '📚',
    streak: 0,
    completed: false,
  },
];

export function HomeToday() {
  const { navigate, userName } = useAppShell();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const completedCount = mockHabits.filter(h => h.completed).length;
  const totalCount = mockHabits.length;

  const handleToggleHabit = (id: string) => {
    // This will be connected to the habit store
    console.log('Toggle habit:', id);
  };

  const handleHabitClick = (id: string) => {
    navigate(`/habit/${id}`);
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/add')}
            className="text-primary"
          >
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        </div>

        {mockHabits.length === 0 ? (
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
            {mockHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                title={habit.title}
                emoji={habit.emoji}
                streak={habit.streak}
                completed={habit.completed}
                onToggle={handleToggleHabit}
                onClick={() => handleHabitClick(habit.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}