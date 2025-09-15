import React, { useCallback, useMemo, useState } from 'react';
import { Plus, Calendar, TrendingUp, Target, Sparkles, Clock, Flame } from 'lucide-react';
import { Button } from '../components/ui/button';
import { HabitCard, EmptyState } from '../components/HabitCard';
import { useAppShell } from '../components/AppShell';
import { useEffect } from 'react';
import { useHabitsStore, getTodayProgress } from '../store/HabitsStore';
import { toYMD } from '../lib/habits';
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

  const habitList = useMemo(() => {
    const allHabits = Object.values(habitsById);
    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return allHabits.filter(habit => {
      // Daily habits always show
      if (habit.frequency === 'daily') {
        return true;
      }
      
      // Weekly habits only show on selected days
      if (habit.frequency === 'weekly' && habit.weeklyDays) {
        return habit.weeklyDays.includes(todayDayOfWeek);
      }
      
      // Default to showing if no frequency specified (backward compatibility)
      return true;
    });
  }, [habitsById]);
  const completedCount = habitList.filter(h => getTodayProgress(h.id).complete).length;
  const totalCount = habitList.length;

  // Completion is updated in /habit/:id as per spec

  const handleHabitClick = useCallback((id: string) => {
    navigate(`/habit/${id}`);
  }, [navigate]);

  const handleToggleToday = useCallback(async (habitId: string) => {
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
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 pb-safe-area-bottom">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent" />
        
        <div className="relative px-6 py-6 pt-header-safe">
          {/* Date and Greeting */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{getCurrentDate()}</p>
              <h1 className="text-2xl font-bold">
                {getGreeting()}{userName ? `, ${userName}` : ''}! 👋
              </h1>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-primary font-medium">{getMotivationalMessage()}</p>
            </div>
          </div>

          {/* Progress Summary */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {completedCount} of {totalCount} completed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((completedCount / totalCount) * 100)}% done today
                  </p>
                </div>
              </div>
              {completedCount > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((completedCount / totalCount) * 100)}%
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Progress Ring */}
      {totalCount > 0 && (
        <div className="px-6 mb-8">
          <div className="bg-gradient-to-r from-card to-card/50 border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted/30 stroke-current"
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
                    style={{
                      transition: 'stroke-dasharray 0.5s ease-in-out',
                      filter: 'drop-shadow(0 0 8px rgba(110, 168, 254, 0.3))'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {Math.round((completedCount / totalCount) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Today's Progress</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  {completedCount === totalCount 
                    ? "Outstanding work! You've completed all your habits today! 🎉"
                    : `You're making great progress! ${totalCount - completedCount} habit${totalCount - completedCount !== 1 ? 's' : ''} remaining.`}
                </p>
                
                {/* Mini Progress Bar */}
                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">{completedCount} completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    <span className="text-muted-foreground">{totalCount - completedCount} remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Habits List */}
      <div className="flex-1 px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Today's Habits</h2>
          </div>
          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} done
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
            
            {/* Motivational Tips */}
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
          <div className="space-y-4">
            {habitList.map((habit, index) => {
              const { total, done, complete } = getTodayProgress(habit.id);
              const streak = statsById[habit.id]?.currentStreak ?? 0;
              const progress = total > 0 ? Math.round((done / total) * 100) : (complete ? 100 : 0);
              const timesLabel = (habit.reminderTimes && habit.reminderTimes.length)
                ? formatTimeList(habit.reminderTimes)
                : undefined;
              const summary = buildScheduleSummary(habit.frequency, habit.weeklyDays, habit.reminderTimes);
              return (
               <div
                 key={habit.id}
                 className="transform transition-all duration-300 hover:scale-[1.02]"
                 style={{ animationDelay: `${index * 100}ms` }}
               >
                 <HabitCard
                   id={habit.id}
                   title={habit.name}
                   emoji={habit.emoji}
                   streak={streak}
                   completed={complete}
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

      {/* Material 3 FAB */}
      <FloatingActionButton
        onClick={() => setIsAddHabitOpen(true)}
        aria-label="Add Habit"
      />

      {/* Add Habit Bottom Sheet */}
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
