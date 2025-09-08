import React, { useState } from 'react';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { InsightCard, EmptyState } from '../components/HabitCard';
import { AppBar } from '../components/AppShell';

const mockInsights = {
  weeklyCompletion: 75,
  bestStreak: 12,
  totalHabits: 3,
  completedToday: 2,
  weeklyData: [
    { day: 'Mon', completed: 2, total: 3 },
    { day: 'Tue', completed: 3, total: 3 },
    { day: 'Wed', completed: 1, total: 3 },
    { day: 'Thu', completed: 3, total: 3 },
    { day: 'Fri', completed: 2, total: 3 },
    { day: 'Sat', completed: 3, total: 3 },
    { day: 'Sun', completed: 2, total: 3 },
  ],
  topHabits: [
    { name: 'Drink Water', emoji: '💧', streak: 12, completionRate: 95 },
    { name: 'Morning Walk', emoji: '🚶', streak: 8, completionRate: 80 },
    { name: 'Read 20 mins', emoji: '📚', streak: 3, completionRate: 60 },
  ],
};

export function Insights() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');

  const WeeklyChart = () => (
    <div className="flex items-end justify-between h-20 px-2">
      {mockInsights.weeklyData.map((day, index) => {
        const percentage = (day.completed / day.total) * 100;
        const height = Math.max(8, (percentage / 100) * 64);
        
        return (
          <div key={day.day} className="flex flex-col items-center gap-2">
            <div
              className="bg-primary rounded-sm w-6 transition-all"
              style={{ height: `${height}px` }}
            />
            <span className="text-xs text-muted-foreground">{day.day}</span>
          </div>
        );
      })}
    </div>
  );

  if (mockInsights.totalHabits === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-24">
        <AppBar title="Insights" />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<BarChart3 size={48} className="text-muted-foreground" />}
            title="No insights yet"
            description="Start tracking habits to see your progress and insights here."
            action={
              <Button>
                Add your first habit
              </Button>
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
          <InsightCard
            title="Completion Rate"
            value={`${mockInsights.weeklyCompletion}%`}
            description="This week"
          />
          <InsightCard
            title="Best Streak"
            value={`${mockInsights.bestStreak}`}
            description="Days in a row"
          />
          <InsightCard
            title="Active Habits"
            value={mockInsights.totalHabits}
            description="Currently tracking"
          />
          <InsightCard
            title="Completed Today"
            value={`${mockInsights.completedToday}/${mockInsights.totalHabits}`}
            description="Habits done"
          />
        </div>

        {/* Weekly Progress Chart */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Weekly Progress</h3>
            <TrendingUp size={20} className="text-primary" />
          </div>
          <WeeklyChart />
          <p className="text-sm text-muted-foreground mt-4">
            Daily completion rate this week
          </p>
        </div>

        {/* Habit Leaderboard */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-primary" />
            <h3 className="font-medium">Habit Leaderboard</h3>
          </div>
          <div className="space-y-4">
            {mockInsights.topHabits.map((habit, index) => (
              <div key={habit.name} className="flex items-center gap-3">
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
            You've completed 5 days in a row! Keep up the amazing work.
          </p>
        </div>
      </div>
    </div>
  );
}