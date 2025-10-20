import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Target, Award, Calendar, Zap, ArrowUpRight, ArrowDownRight, Plus, History } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { InsightCard, EmptyState } from '../components/HabitCard';
import { AppBar, useAppShell } from '../components/AppShellRouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useHabitsStore } from '../store/HabitsStore';
import { CompletionRateRing, StreakRing, TopHabitRing } from '../components/ProgressRing';
import { HabitLeaderboard } from '../components/HabitLeaderboard';
import { CompletionRateCard, StreakCard, TopHabitCard } from '../components/MetricCard';
import { CompletionCalendar } from '../components/CompletionCalendar';
import { Skeleton, SkeletonCard, SkeletonStats, SkeletonTabs } from '../components/ui/skeleton';
import { 
  getCompletionForDateMemoized,
  getCompletionSeriesMemoized,
  getCompletionSummary,
  type DayCompletion,
  type CompletionSeriesItem
} from '../lib/completion';
import { toYMD } from '../lib/habits';

export function Insights() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const { habitsById, statsById, habitDaysByKey, hydrationState, hydrateAll } = useHabitsStore();
  const { navigate } = useAppShell();

  useEffect(() => { if (hydrationState !== 'ready') void hydrateAll(); }, [hydrationState, hydrateAll]);

  const stats = useMemo(() => {
    const habits = Object.values(habitsById);
    const totalHabits = habits.length;
    const today = toYMD(new Date());
    
    // Get today's completion using unified system
    const todayCompletion = getCompletionForDateMemoized(today, habits, habitDaysByKey, {
      includeSameDay: true
    });
    
    const completedToday = todayCompletion.totalCompleted;
    const bestStreak = habits.reduce((max, h) => Math.max(max, statsById[h.id]?.bestStreak ?? 0), 0);
    const windowDays = timeFilter === 'week' ? 7 : 30;

    // Get completion series for current period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (windowDays - 1));
    
    const series = getCompletionSeriesMemoized({
      start: toYMD(startDate),
      end: toYMD(endDate),
      includeWeekends: true
    }, habits, habitDaysByKey);

    // Get completion series for previous period
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - (windowDays - 1));
    
    const prevSeries = getCompletionSeriesMemoized({
      start: toYMD(prevStartDate),
      end: toYMD(prevEndDate),
      includeWeekends: true
    }, habits, habitDaysByKey);

    // Calculate averages and delta
    const avgPct = series.length ? Math.round(series.reduce((a, b) => a + b.percentage, 0) / series.length) : 0;
    const prevAvgPct = prevSeries.length ? Math.round(prevSeries.reduce((a, b) => a + b.percentage, 0) / prevSeries.length) : 0;
    const delta = avgPct - prevAvgPct;

    // Get top habits
    const topHabits = habits
      .map(h => ({ id: h.id, name: h.name, emoji: h.emoji, streak: statsById[h.id]?.currentStreak ?? 0, completionRate: statsById[h.id]?.completionRate ?? 0 }))
      .sort((a, b) => (b.streak - a.streak) || (b.completionRate - a.completionRate))
      .slice(0, 5);

    const consistency = habits.map(h => ({ id: h.id, name: h.name, emoji: h.emoji, rate: statsById[h.id]?.completionRate ?? 0 }));
    const mostConsistent = [...consistency].sort((a, b) => b.rate - a.rate)[0];
    const mostSkipped = [...consistency].sort((a, b) => a.rate - b.rate)[0];

    return { totalHabits, completedToday, bestStreak, avgPct, delta, series, prevSeries, topHabits, mostConsistent, mostSkipped };
  }, [habitsById, statsById, habitDaysByKey, timeFilter]);

  const [dayDetail, setDayDetail] = useState<{ ymd: string; label: string; pct: number } | null>(null);

  // Calculate completed dates for calendar using unified completion system
  const completedDates = useMemo(() => {
    const habits = Object.values(habitsById);
    const completed: string[] = [];
    
    // Check last 30 days for completed dates
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const ymd = toYMD(date);
      
      // Check if all habits were completed on this day (100% completion)
      const dayCompletion = getCompletionForDateMemoized(ymd, habits, habitDaysByKey, {
        includeSameDay: true
      });
      
      // A day is "completed" if ALL scheduled habits are done (100% completion)
      if (dayCompletion.totalScheduled > 0 && dayCompletion.completionPercentage === 100) {
        completed.push(ymd);
      }
    }
    
    return completed;
  }, [habitsById, habitDaysByKey]);

  // Loading skeleton while hydrating
  if (hydrationState !== 'ready') {
    return (
      <div className="flex flex-col min-h-screen bg-background w-full">
        <AppBar title="Insights" />
        <div className="flex-1 px-6 py-6 pt-20 pb-24 w-full overflow-x-hidden">
          <SkeletonTabs />
        </div>
      </div>
    );
  }

  if (stats.totalHabits === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <AppBar title="Insights" />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<BarChart3 size={48} className="text-muted-foreground" />}
            title="No habits have been added yet"
            description="Start by creating your first habit!"
            action={
              <Button onClick={() => navigate('/add')}><Plus size={16} className="mr-2" />Add Habit</Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col min-h-screen bg-background w-full"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <AppBar title="Insights" />

      <div className="flex-1 px-6 py-6 pt-20 pb-24 w-full overflow-x-hidden overflow-y-auto">
        {/* Period Tabs - Enhanced */}
        <div className="flex gap-3 mb-6 w-full" role="tablist" aria-label="Insights period">
          <Button 
            role="tab" 
            aria-selected={timeFilter==='week'} 
            variant={timeFilter === 'week' ? 'default' : 'outline'} 
            size="lg" 
            onClick={() => setTimeFilter('week')}
            className="flex-1 rounded-2xl font-semibold"
          >
            <Calendar size={18} className="mr-2" /> This Week
          </Button>
          <Button 
            role="tab" 
            aria-selected={timeFilter==='month'} 
            variant={timeFilter === 'month' ? 'default' : 'outline'} 
            size="lg" 
            onClick={() => setTimeFilter('month')}
            className="flex-1 rounded-2xl font-semibold"
          >
            <Calendar size={18} className="mr-2" /> This Month
          </Button>
        </div>
        
        {/* Summary Stats - Enhanced */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-8 w-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Performance Summary</h2>
              <p className="text-sm text-muted-foreground font-medium">Your progress this {timeFilter}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{stats.avgPct}%</div>
              <div className="text-sm text-muted-foreground font-medium">Average Completion</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 flex items-center justify-center gap-1 ${stats.delta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {stats.delta >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                {Math.abs(stats.delta)}%
              </div>
              <div className="text-sm text-muted-foreground font-medium">vs Previous {timeFilter}</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Section - Enhanced */}
        <section className="mb-8 w-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Key Metrics</h2>
          </div>
          <div className="space-y-6 w-full">
            <CompletionRateCard 
              rate={stats.avgPct}
              trend={stats.delta >= 0 ? 'up' : 'down'}
              trendValue={stats.delta >= 0 ? `+${stats.delta}% vs prev` : `${stats.delta}% vs prev`}
            />
            <StreakCard 
              streak={stats.bestStreak}
            />
            {stats.topHabits.length > 0 && (
              <TopHabitCard 
                habitName={stats.topHabits[0].name}
                completionRate={stats.topHabits[0].completionRate}
              />
            )}
          </div>
        </section>

        {/* Quick stats - Enhanced */}
        <div className="grid grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Active Habits</h3>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">{Object.keys(habitsById).length}</div>
            <div className="text-sm text-muted-foreground font-medium">Currently tracking</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground">Completed Today</h3>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">{stats.completedToday}/{stats.totalHabits}</div>
            <div className="text-sm text-muted-foreground font-medium">Habits done</div>
          </div>
        </div>

        {/* Completion Calendar - Enhanced */}
        <section className="mb-8 w-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Completion Calendar</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <CompletionCalendar 
              view={timeFilter}
              completedDates={completedDates}
              onDateClick={(date) => {
                const dateObj = new Date(date);
                const label = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                const habits = Object.values(habitsById);
                const completed = habits.filter(habit => {
                  const key = `habit:${habit.id}:day:${date}`;
                  const entry = habitDaysByKey[key];
                  return entry ? entry.reminders.length > 0 && entry.reminders.every(r => r.done) : false;
                }).length;
                const pct = habits.length ? Math.round((completed / habits.length) * 100) : 0;
                const isFullyCompleted = habits.length > 0 && completed === habits.length;
                setDayDetail({ 
                  ymd: date, 
                  label, 
                  pct,
                  isFullyCompleted 
                } as any);
              }}
            />
          </div>
        </section>

        {/* Enhanced Habit Leaderboard */}
        <section className="mb-8 w-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Top Habits</h2>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <HabitLeaderboard 
              habits={stats.topHabits.map((habit, index) => ({
                id: habit.id,
                name: habit.name,
                emoji: habit.emoji,
                completionRate: habit.completionRate,
                currentStreak: habit.streak,
                rank: index + 1,
                trend: habit.completionRate >= 80 ? 'up' : habit.completionRate <= 40 ? 'down' : 'stable',
                onClick: () => navigate(`/habit/${habit.id}`)
              }))}
              maxItems={5}
            />
          </div>
        </section>

        {/* Insights - Enhanced */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 w-full shadow-sm mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary">Personal Insights</h3>
              <p className="text-sm text-muted-foreground font-medium">Your habit performance analysis</p>
            </div>
          </div>
          <p className="text-primary/90 font-medium text-base leading-relaxed mb-4">
            {stats.delta >= 10
              ? `Great job! You've improved by ${stats.delta}% compared to last ${timeFilter}.`
              : stats.delta >= -5
                ? `Stable performance — keep your streaks going!`
                : `Let's bounce back — down ${Math.abs(stats.delta)}% vs last ${timeFilter}.`}
          </p>
          <div className="space-y-2 text-sm text-primary/80">
            {stats.mostConsistent && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Most consistent:</span>
                <span className="font-medium">{stats.mostConsistent.emoji} {stats.mostConsistent.name}</span>
                <span className="text-primary/60">({stats.mostConsistent.rate}%)</span>
              </div>
            )}
            {stats.mostSkipped && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Most skipped:</span>
                <span className="font-medium">{stats.mostSkipped.emoji} {stats.mostSkipped.name}</span>
                <span className="text-primary/60">({stats.mostSkipped.rate}%)</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Day detail dialog */}
      <Dialog open={!!dayDetail} onOpenChange={(o) => !o && setDayDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Day Details — {dayDetail?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="font-medium">Completion: {dayDetail?.pct}%</div>
            {dayDetail && (
              <div className="text-muted-foreground">
                {(() => {
                  const ymd = dayDetail.ymd;
                  const habits = Object.values(habitsById);
                  const total = habits.length;
                  const completed = habits.filter(h => {
                    const key = `habit:${h.id}:day:${ymd}`;
                    const entry = habitDaysByKey[key];
                    return entry ? entry.reminders.length > 0 && entry.reminders.every(r => r.done) : false;
                  }).length;
                  return `${completed} of ${total} habits completed`;
                })()}
              </div>
            )}
            {dayDetail && dayDetail.pct === 100 && (
              <div className="text-green-600 font-medium">
                ✅ All habits completed! (100%)
              </div>
            )}
            <div className="text-muted-foreground">
              Date: {dayDetail?.ymd}
            </div>
            <p className="text-muted-foreground">Tap another date to view a different day.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
