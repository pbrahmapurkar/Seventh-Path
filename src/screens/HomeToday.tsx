import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Calendar, Target, Sparkles, Flame, Heart, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { HabitCard } from '../components/HabitCard';
import { useAppShell } from '../components/AppShell';
import { useHabitsStore } from '../store/HabitsStore';
import { toYMD } from '../lib/habits';
import { getCompletionForDateMemoized } from '../lib/completion';
import { FloatingActionButton } from '../components/FloatingActionButton';

export function HomeToday() {
  const { navigate, userName } = useAppShell();
  const { habitsById, statsById, hydrateAll, hydrationState, habitDaysByKey, completionLog } = useHabitsStore();
  const [dismissedWelcomeBack, setDismissedWelcomeBack] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousCompletedCount, setPreviousCompletedCount] = useState(0);

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

  // Detect if user is returning after a gap (welcome-back flow)
  const daysSinceLastActivity = useMemo(() => {
    if (completionLog.length === 0) return 0;

    // Find the most recent completion
    const lastEntry = [...completionLog]
      .filter(entry => entry.action === 'completed')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (!lastEntry) return 0;

    const lastDate = new Date(lastEntry.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [completionLog]);

  const showWelcomeBack = daysSinceLastActivity >= 3 && !dismissedWelcomeBack && habitList.length > 0;

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

  // Celebrate when reaching 100% completion
  useEffect(() => {
    // Trigger celebration only when going from non-100% to 100%
    if (completedCount === totalCount && totalCount > 0 && previousCompletedCount < totalCount) {
      setShowCelebration(true);
      // Trigger haptic feedback for celebration
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 100, 50, 150]); // Celebratory pattern
        }
      } catch { }
      // Auto-dismiss after animation
      setTimeout(() => setShowCelebration(false), 3000);
    }
    setPreviousCompletedCount(completedCount);
  }, [completedCount, totalCount, previousCompletedCount]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Celebration Overlay - calm, premium design */}
      {showCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowCelebration(false)}
        >
          <div
            className="bg-gradient-to-br from-primary/95 to-emerald-600/95 text-white rounded-3xl p-8 mx-6 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center gap-5 max-w-sm"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 60px rgba(20, 216, 144, 0.3)'
            }}
          >
            {/* Success Icon with subtle glow */}
            <div
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30"
              style={{
                boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)'
              }}
            >
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-2">All Done! 🎉</div>
              <div className="text-white/80 text-base">
                You completed all your habits today!
              </div>
            </div>

            {/* Subtle emoji decoration */}
            <div className="flex gap-4 text-3xl opacity-80">
              <span>🥳</span>
              <span>✨</span>
              <span>🌟</span>
            </div>

            {/* Dismiss hint */}
            <div className="text-white/50 text-xs mt-2">
              Tap anywhere to dismiss
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgba(16,185,129,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground">{getCurrentDate()}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight truncate">
              {getGreeting()}{userName ? `, ${userName}` : ''}! 👋
            </h1>
          </div>
        </div>
        <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-2xl p-4 sm:p-5 w-full shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgba(16,185,129,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <p className="text-foreground font-medium text-sm sm:text-base leading-relaxed">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Welcome Back Banner - shows after 3+ days away */}
      {showWelcomeBack && (
        <div className="px-6 pt-6">
          <div className="bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] rounded-[1.25rem] p-5 w-full relative shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDismissedWelcomeBack(true)}
              className="absolute top-3 right-3 text-primary/60 hover:text-primary hover:bg-primary/10 w-8 h-8 rounded-full"
              aria-label="Dismiss welcome back message"
            >
              <span className="text-xl leading-none">×</span>
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[rgba(16,185,129,0.15)] rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground mb-1">
                  Welcome back{userName ? `, ${userName}` : ''}! 🌱
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  It's been {daysSinceLastActivity} days. No pressure — just start with one habit today.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-28 sm:pb-24">
        {totalCount > 0 && (
          <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 w-full shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[rgba(16,185,129,0.1)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-lg sm:text-xl text-foreground">
                    {completedCount} of {totalCount} completed
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {Math.round((completedCount / totalCount) * 100)}% done today
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {/* Circular Progress Indicator */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    {/* Background circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="6"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(completedCount / totalCount) * 175.93} 175.93`}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  {/* Percentage text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm sm:text-base font-bold text-primary">
                      {Math.round((completedCount / totalCount) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6 sm:mb-8 w-full">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Today's Habits</h2>
          </div>
          {totalCount > 0 && (
            <div className="text-xs sm:text-sm text-muted-foreground font-medium bg-muted/50 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                {completedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>

        {habitList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center">
                <Plus className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Ready to start your journey?</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-sm leading-relaxed">
              Create your first habit and begin building the life you want, one day at a time.
            </p>
            <Button
              onClick={() => navigate('/add')}
              className="w-full max-w-xs font-bold text-base group"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Add Your First Habit
            </Button>

            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary">Pro Tip</span>
              </div>
              <p className="text-xs sm:text-sm text-primary/80">
                Start with just one small habit. Consistency beats intensity every time!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 w-full">
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
                  className="transform transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] w-full"
                  style={{ animationDelay: `${index * 50}ms` }}
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

      {/* FAB only shown when habits exist - avoids competing with empty state CTA */}
      {habitList.length > 0 && (
        <FloatingActionButton
          onClick={() => navigate('/add')}
          aria-label="Add Habit"
        />
      )}
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
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
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
  const order = [1, 2, 3, 4, 5, 6, 0];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const selected = order
    .map((real, i) => ({ label: labels[i], real }))
    .filter(({ real }) => days.includes(real))
    .map(({ label }) => label)
    .join(', ');
  const daysText = selected || '—';
  return timeText ? `Weekly • ${daysText} • ${timeText}` : `Weekly • ${daysText}`;
}
