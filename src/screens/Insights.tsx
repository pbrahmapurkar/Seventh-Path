import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { InsightCard, EmptyState } from '../components/HabitCard';
import { AppBar } from '../components/AppShell';
import { useHabitsStore } from '../store/HabitsStore';
import { useAppShell } from '../components/AppShell';

export function Insights() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');
  const { habitsById, statsById, habitDaysByKey, hydrationState, hydrateAll } = useHabitsStore();
  const { navigate } = useAppShell();

  useEffect(() => { if (hydrationState !== 'ready') void hydrateAll(); }, [hydrationState, hydrateAll]);

  const stats = useMemo(() => {
    const habits = Object.values(habitsById);
    const totalHabits = habits.length;
    const today = new Date();
    const ymdToday = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const completedToday = habits.filter(h => {
      const key = `habit:${h.id}:day:${ymdToday}`;
      const entry = habitDaysByKey[key];
      return entry ? entry.reminders.length > 0 && entry.reminders.every(r => r.done) : false;
    }).length;
    const bestStreak = habits.reduce((max, h) => Math.max(max, statsById[h.id]?.bestStreak ?? 0), 0);
    const windowDays = timeFilter === 'week' ? 7 : 30;
    const completionRates = habits.map(h => statsById[h.id]?.completionRate ?? 0);
    const completionRate = completionRates.length
      ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length)
      : 0;

    // Build data for last N days: count habits completed per day
    const daysBack = windowDays - 1;
    const series = Array.from({ length: windowDays }).map((_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (daysBack - idx));
      const ymd = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      const completedCount = habits.filter(h => {
        const key = `habit:${h.id}:day:${ymd}`;
        const entry = habitDaysByKey[key];
        return entry ? entry.reminders.length > 0 && entry.reminders.every(r => r.done) : false;
      }).length;
      return { day: date.toLocaleDateString(undefined, { weekday: 'short' }), completed: completedCount, total: totalHabits };
    });

    // Leaderboard by streak then completion rate
    const topHabits = habits
      .map(h => ({
        id: h.id,
        name: h.name,
        emoji: h.emoji,
        streak: statsById[h.id]?.currentStreak ?? 0,
        completionRate: statsById[h.id]?.completionRate ?? 0,
      }))
      .sort((a, b) => (b.streak - a.streak) || (b.completionRate - a.completionRate))
      .slice(0, 5);

    return { totalHabits, completedToday, bestStreak, completionRate, series, topHabits };
  }, [habitsById, statsById, habitDaysByKey, timeFilter]);

  const ProgressChart = () => (
    <div className="px-2 overflow-x-auto">
      <div className="flex items-end gap-2 h-24 min-w-full">
        {stats.series.map((day, index) => {
          const percentage = day.total ? (day.completed / day.total) * 100 : 0;
          const height = Math.max(8, (percentage / 100) * 80);
          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="bg-primary rounded-sm w-4" style={{ height }} />
              <span className="text-[10px] text-muted-foreground">{day.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

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
              <Button onClick={() => navigate('/add')}>Add Habit</Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <AppBar title="Insights" />

      <div className="flex-1 p-6">
        {/* Filter Chips */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={timeFilter === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('week')}
          >
            This Week
          </Button>
          <Button
            variant={timeFilter === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('month')}
          >
            This Month
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <InsightCard title="Completion Rate" value={`${stats.completionRate}%`} description={timeFilter === 'week' ? 'This week' : 'This month'} />
          <InsightCard
            title="Best Streak"
            value={`${stats.bestStreak}`}
            description="Days in a row"
          />
          <InsightCard
            title="Active Habits"
            value={stats.totalHabits}
            description="Currently tracking"
          />
          <InsightCard
            title="Completed Today"
            value={`${stats.completedToday}/${stats.totalHabits}`}
            description="Habits done"
          />
        </div>

        {/* Weekly Progress Chart */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Weekly Progress</h3>
            <TrendingUp size={20} className="text-primary" />
          </div>
          <ProgressChart />
          <p className="text-sm text-muted-foreground mt-4">
            Daily completion rate this {timeFilter === 'week' ? 'week' : 'month'}
          </p>
        </div>

        {/* Habit Leaderboard */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-primary" />
            <h3 className="font-medium">Habit Leaderboard</h3>
          </div>
          <div className="space-y-4">
            {stats.topHabits.map((habit, index) => (
              <div key={habit.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xl">{habit.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{habit.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {habit.streak} day streak • {habit.completionRate}% completion
                  </p>
                </div>
                <Badge variant="secondary">
                  {habit.completionRate}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏆</span>
            <h3 className="font-medium text-primary">Recent Achievement</h3>
          </div>
          <p className="text-primary/80">
            {stats.bestStreak >= 3
              ? `You've completed ${stats.bestStreak} days in a row! 🎉 Keep it up.`
              : 'Keep going! Build your streak by completing habits daily.'}
          </p>
        </div>
      </div>
    </div>
  );
}
