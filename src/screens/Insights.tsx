import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Target, Award, Calendar, Zap, ArrowUpRight, ArrowDownRight, Plus, History } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { InsightCard, EmptyState } from '../components/HabitCard';
import { AppBar } from '../components/AppShell';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useHabitsStore } from '../store/HabitsStore';
import { useAppShell } from '../components/AppShell';
import { CompletionRateRing, StreakRing, TopHabitRing } from '../components/ProgressRing';
import { HabitLeaderboard } from '../components/HabitLeaderboard';
import { CompletionRateCard, StreakCard, TopHabitCard } from '../components/MetricCard';
import { CompletionCalendar } from '../components/CompletionCalendar';

export function Insights() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const { habitsById, statsById, habitDaysByKey, hydrationState, hydrateAll } = useHabitsStore();
  const { navigate } = useAppShell();

  useEffect(() => { if (hydrationState !== 'ready') void hydrateAll(); }, [hydrationState, hydrateAll]);

  const stats = useMemo(() => {
    const habits = Object.values(habitsById);
    const totalHabits = habits.length;
    const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const today = new Date();
    const ymdToday = ymd(today);
    // Helper function to get habits scheduled on a specific date
    const getScheduledHabitsOnDate = (date: Date, dateStr: string) => {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      return habits.filter(habit => {
        // Daily habits are always scheduled
        if (habit.frequency === 'daily') {
          return true;
        }
        // Weekly habits are only scheduled on selected days
        if (habit.frequency === 'weekly' && habit.weeklyDays) {
          return habit.weeklyDays.includes(dayOfWeek);
        }
        // Default to scheduled if no frequency specified (backward compatibility)
        return true;
      });
    };
    
    const scheduledToday = getScheduledHabitsOnDate(today, ymdToday);
    const completedToday = scheduledToday.filter(h => {
      const key = `habit:${h.id}:day:${ymdToday}`;
      const entry = habitDaysByKey[key];
      return entry ? entry.reminders.length > 0 && entry.reminders.every(r => r.done) : false;
    }).length;
    const bestStreak = habits.reduce((max, h) => Math.max(max, statsById[h.id]?.bestStreak ?? 0), 0);
    const windowDays = timeFilter === 'week' ? 7 : 30;

    const buildSeries = (startOffset: number) => {
      const daysBack = windowDays - 1;
      return Array.from({ length: windowDays }).map((_, idx) => {
        const date = new Date();
        date.setDate(date.getDate() - (daysBack - idx + startOffset));
        const id = ymd(date);
        const scheduledHabits = getScheduledHabitsOnDate(date, id);
        const completedCount = scheduledHabits.filter(h => {
          const key = `habit:${h.id}:day:${id}`;
          const entry = habitDaysByKey[key];
          return entry ? entry.reminders.length > 0 && entry.reminders.every(r => r.done) : false;
        }).length;
        const pct = scheduledHabits.length ? Math.round((completedCount / scheduledHabits.length) * 100) : 0;
        return { ymd: id, label: date.toLocaleDateString(undefined, { weekday: 'short' }), completed: completedCount, total: scheduledHabits.length, pct };
      });
    };
    const series = buildSeries(0);
    const prevSeries = buildSeries(windowDays);
    const avgPct = series.length ? Math.round(series.reduce((a, b) => a + b.pct, 0) / series.length) : 0;
    const prevAvgPct = prevSeries.length ? Math.round(prevSeries.reduce((a, b) => a + b.pct, 0) / prevSeries.length) : 0;
    const delta = avgPct - prevAvgPct;

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

  // Calculate completed dates for calendar
  const completedDates = useMemo(() => {
    const habits = Object.values(habitsById);
    const completed: string[] = [];
    
    // Check last 30 days for completed dates
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      // Check if all habits were completed on this day (100% completion)
      const completedHabits = habits.filter(habit => {
        const key = `habit:${habit.id}:day:${ymd}`;
        const entry = habitDaysByKey[key];
        return entry ? entry.reminders.length > 0 && entry.reminders.every(r => r.done) : false;
      });
      
      // A day is "completed" if ALL habits are done (100% completion)
      if (habits.length > 0 && completedHabits.length === habits.length) {
        completed.push(ymd);
      }
    }
    
    return completed;
  }, [habitsById, habitDaysByKey]);

  // Loading skeleton while hydrating
  if (hydrationState !== 'ready') {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <AppBar title="Insights" />
        <div className="flex-1 p-6 space-y-4 animate-pulse">
          <div className="h-8 w-40 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-28 bg-card border border-border rounded" />
            <div className="h-28 bg-card border border-border rounded" />
          </div>
          <div className="h-40 bg-card border border-border rounded" />
          <div className="h-48 bg-card border border-border rounded" />
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
    <div className="flex flex-col min-h-screen bg-background pb-24 pb-safe-area-bottom">
      <AppBar title="Insights" />

      <div className="flex-1 p-6 pb-safe-area-bottom">
        {/* Period Tabs */}
        <div className="flex gap-2 mb-2" role="tablist" aria-label="Insights period">
          <Button role="tab" aria-selected={timeFilter==='week'} variant={timeFilter === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('week')}>
            <Calendar size={16} className="mr-2" /> This Week
          </Button>
          <Button role="tab" aria-selected={timeFilter==='month'} variant={timeFilter === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setTimeFilter('month')}>
            <Calendar size={16} className="mr-2" /> This Month
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Average completion {stats.avgPct}% • {stats.delta >= 0 ? 'Up' : 'Down'} {Math.abs(stats.delta)}% vs previous {timeFilter}
        </p>

        {/* Key Metrics Section */}
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-4 px-2">Key Metrics</h2>
          <div className="space-y-4">
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

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <InsightCard title="Active Habits" value={Object.keys(habitsById).length} description="Currently tracking" />
          <InsightCard title="Completed Today" value={`${stats.completedToday}/${stats.totalHabits}`} description="Habits done" />
        </div>

        {/* Completion Calendar */}
        <section className="mb-6">
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
        </section>

        {/* Enhanced Habit Leaderboard */}
        <section className="mb-6">
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
        </section>

        {/* Insights */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">💡</span>
            <h3 className="font-medium text-primary">Insights</h3>
          </div>
          <p className="text-primary/80">
            {stats.delta >= 10
              ? `Great job! You’ve improved by ${stats.delta}% compared to last ${timeFilter}.`
              : stats.delta >= -5
                ? `Stable performance — keep your streaks going!`
                : `Let’s bounce back — down ${Math.abs(stats.delta)}% vs last ${timeFilter}.`}
          </p>
          <div className="mt-3 text-sm text-primary/80">
            {stats.mostConsistent && (
              <div>Most consistent: <span className="font-medium">{stats.mostConsistent.emoji} {stats.mostConsistent.name}</span> ({stats.mostConsistent.rate}%)</div>
            )}
            {stats.mostSkipped && (
              <div>Most skipped: <span className="font-medium">{stats.mostSkipped.emoji} {stats.mostSkipped.name}</span> ({stats.mostSkipped.rate}%)</div>
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
