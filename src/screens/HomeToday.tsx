import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Calendar, Target, Sparkles, Flame } from 'lucide-react';
import { Button } from '../components/ui/button';
import { HabitCard } from '../components/HabitCard';
import { useAppShell } from '../components/AppShellRouter';
import { useHabitsStore } from '../store/HabitsStore';
import { toYMD } from '../lib/habits';
import { getCompletionForDateMemoized } from '../lib/completion';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { AddHabitBottomSheet } from '../components/AddHabitBottomSheet';

export function HomeToday() {
  const { navigate, userName } = useAppShell();
  const { habitsById, statsById, hydrateAll, hydrationState, habitDaysByKey } = useHabitsStore();
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  useEffect(() => { if (hydrationState !== 'ready') void hydrateAll(); }, [hydrationState, hydrateAll]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    if (completedCount === totalCount && totalCount > 0) {
      return "🎉 Amazing! You've completed all your habits today!";
    }
    
    if (completionRate >= 75) {
      return "🔥 You're on fire! Keep up the great work!";
    }
    
    if (completionRate >= 50) {
      return "💪 You're making great progress today!";
    }
    
    if (completionRate > 0) {
      return "🌟 Every step counts! You're doing great!";
    }
    
    if (hour < 12) {
      return "🌅 Ready to start your day with some great habits?";
    } else if (hour < 18) {
      return "☀️ How's your day going? Time to check in on your habits!";
    } else {
      return "🌙 Evening check-in! How did your habits go today?";
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get unified completion data for today
  const todayCompletion = useMemo(() => {
    const today = toYMD(new Date());
    const allHabits = Object.values(habitsById);
    return getCompletionForDateMemoized(today, allHabits, habitDaysByKey, {
      includeSameDay: true
    });
  }, [habitsById, habitDaysByKey]);

  const habitList = todayCompletion.scheduledHabits;
  const completedCount = todayCompletion.totalCompleted;
  const totalCount = todayCompletion.totalScheduled;

  // Completion is updated in /habit/:id as per spec

  const handleHabitClick = useCallback((id: string) => {
    navigate(`/habit/${id}`);
  }, [navigate]);

  const handleToggleToday = useCallback(async (habitId: string) => {
    const store = useHabitsStore.getState();
    const habit = store.habitsById[habitId];
    if (!habit) return;
    
    // Check if habit is completed using unified completion system
    const habitStatus = todayCompletion.habitStatuses.find(s => s.habitId === habitId);
    const isCompleted = habitStatus?.isCompleted ?? false;
    
    if (!isCompleted) {
      await store.markAllDone(habitId);
    } else {
      // Undo: toggle each done reminder to not done
      const times = (habit.reminderTimes && habit.reminderTimes.length > 0) ? habit.reminderTimes : ['default'];
      for (const t of times) {
        // Only toggle if currently done; calling toggle will flip state
        await store.toggleTime(habitId, t);
      }
    }
  }, [todayCompletion.habitStatuses]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border shadow-sm px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{getCurrentDate()}</p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {getGreeting()}{userName ? `, ${userName}` : ''}! 👋
            </h1>
          </div>
        </div>
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 w-full">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-primary font-medium text-base leading-relaxed">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>
      </div>

        <div className="px-6 pt-6 pb-24">
          {totalCount > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-8 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-foreground">
                      {completedCount} of {totalCount} completed
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {Math.round((completedCount / totalCount) * 100)}% done today
                    </p>
                  </div>
                </div>
                {completedCount > 0 && (
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {Math.round((completedCount / totalCount) * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8 w-full">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Today's Habits</h2>
            </div>
            {totalCount > 0 && (
              <div className="text-sm text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-full">
                <span className="text-sm text-muted-foreground font-medium">
                  {completedCount}/{totalCount} done
                </span>
              </div>
            )}
          </div>

          {habitList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center">
                  <Plus className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Ready to start your journey?</h3>
              <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
                Create your first habit and begin building the life you want, one day at a time.
              </p>
              <Button
                onClick={() => navigate('/add')}
                className="px-8 py-3 text-lg font-medium group"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                Add your first habit
              </Button>

              <div className="mt-8 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Pro Tip</span>
                </div>
                <p className="text-sm text-primary/80">
                  Start with just one small habit. Consistency beats intensity every time!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              {habitList.map((habit, index) => {
                const habitStatus = todayCompletion.habitStatuses.find(s => s.habitId === habit.id);
                const streak = statsById[habit.id]?.currentStreak ?? 0;
                const progress = habitStatus?.completionPercentage ?? 0;
                const timesLabel = (habit.reminderTimes && habit.reminderTimes.length)
                  ? formatTimeList(habit.reminderTimes)
                  : undefined;
                const summary = buildScheduleSummary(habit.frequency, habit.weeklyDays, habit.reminderTimes);
                return (
                  <div
                    key={habit.id}
                    className="transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <HabitCard
                      id={habit.id}
                      title={habit.name}
                      emoji={habit.emoji}
                      streak={streak}
                      completed={habitStatus?.isCompleted ?? false}
                      frequency={habit.frequency}
                      reminderTime={timesLabel}
                      scheduleSummary={summary}
                      progress={progress}
                      showCheckbox={true}
                      onToggle={handleToggleToday}
                      onClick={() => handleHabitClick(habit.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      <FloatingActionButton
        onClick={() => setIsAddHabitOpen(true)}
        aria-label="Add Habit"
      />

      <AddHabitBottomSheet
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
      />
    </div>
  );
}

// Helpers to format schedule summary for cards
function formatTimeList(times: string[]): string {
  return times.map(formatTime).join(', ');
}
function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = ((h % 12) || 12);
  return `${hr}:${String(m).padStart(2,'0')} ${ampm}`;
}
function buildScheduleSummary(
  frequency?: 'daily' | 'weekly',
  weeklyDays?: number[],
  times?: string[]
): string | undefined {
  if (!frequency) return undefined;
  const hasTimes = times && times.length > 0;
  const timeText = hasTimes ? formatTimeList(times!) : undefined;
  if (frequency === 'daily') {
    return timeText ? `Daily • Reminders at ${timeText}` : 'Daily';
  }
  // weekly
  const days = Array.isArray(weeklyDays) ? weeklyDays : [];
  if (days.length === 7) {
    // treat as daily
    return timeText ? `Daily • Reminders at ${timeText}` : 'Daily';
  }
  const order = [1,2,3,4,5,6,0];
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const selected = order
    .map((real, i) => ({ label: labels[i], real }))
    .filter(({ real }) => days.includes(real))
    .map(({ label }) => label)
    .join(', ');
  const daysText = selected || '—';
  return timeText ? `Weekly • ${daysText} • ${timeText}` : `Weekly • ${daysText}`;
}
