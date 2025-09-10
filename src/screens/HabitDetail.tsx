import React, { useMemo, useState } from 'react';
import { Edit, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';
import { useHabitStore } from '../lib/habitStore';

export function HabitDetail({ habitId }: { habitId: string }) {
  const { navigate } = useAppShell();
  const { habits, deleteHabit, getHabitStreak, getCompletionPercentage } = useHabitStore();
  const [activeTab, setActiveTab] = useState('overview');

  const habit = habits.find((h) => h.id === habitId) || habits[0];
  const streak = habit ? getHabitStreak(habit.id) : 0;
  const completionRate = habit ? (habit.frequency === 'daily' ? getCompletionPercentage(habit.id, 7) : getCompletionPercentage(habit.id, 7)) : 0;
  const totalCompletions = habit ? habit.completions.length : 0;
  const recentCompletions = useMemo(() => (habit ? habit.completions.slice().sort((a, b) => b.getTime() - a.getTime()) : []), [habit]);

  const handleEdit = () => {
    navigate(`/habit/${habitId}/edit`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habitId);
      navigate('/home');
    }
  };

  const CalendarHeatmap = () => {
    const today = new Date();
    const days = [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const isCompleted = recentCompletions.some(
        completion => completion.toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        completed: isCompleted,
        isToday: date.toDateString() === today.toDateString(),
      });
    }

    return (
      <div className="grid grid-cols-10 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`w-6 h-6 rounded-sm border ${
              day.completed
                ? 'bg-primary border-primary'
                : day.isToday
                ? 'border-primary bg-primary/10'
                : 'border-muted bg-muted/30'
            }`}
            title={day.date.toLocaleDateString()}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar
        title="Habit Details"
        showBack
        onBack={() => navigate('/home')}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
          >
            <Edit size={16} />
          </Button>
        }
      />

      <div className="flex-1 p-6">
        {/* Habit Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{habit?.emoji}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-medium">{habit?.title}</h1>
              <p className="text-muted-foreground">
                {habit ? habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1) : ''}
                {habit?.reminderTimes && habit.reminderTimes.length > 0 && ` • Reminders at ${habit.reminderTimes.join(', ')}`}
                {!habit?.reminderTimes?.length && habit?.reminderTime && ` • Reminder at ${habit.reminderTime}`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-medium text-primary">{streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-primary">{completionRate}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-primary">{totalCompletions}</div>
              <div className="text-sm text-muted-foreground">Total Completions</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-primary" />
                  <span className="text-sm font-medium">This Week</span>
                </div>
                <div className="text-xl font-medium">5/7</div>
                <div className="text-sm text-muted-foreground">Days completed</div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <div className="text-xl font-medium">10</div>
                <div className="text-sm text-muted-foreground">Days ago</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-medium mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentCompletions.slice(0, 5).map((completion, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">
                      Completed on {completion.toLocaleDateString()}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      ✓ Done
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            {/* Calendar Heatmap */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-medium mb-4">Last 30 Days</h3>
              <CalendarHeatmap />
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm border border-muted bg-muted/30" />
                  <div className="w-3 h-3 rounded-sm bg-primary/30" />
                  <div className="w-3 h-3 rounded-sm bg-primary/60" />
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Completion History */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-medium mb-4">Completion History</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentCompletions.map((completion, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{completion.toLocaleDateString()}</span>
                    <Badge variant="secondary" className="text-xs">
                      ✓ Completed
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-border">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="w-full"
          >
            <Trash2 size={16} className="mr-2" />
            Delete Habit
          </Button>
        </div>
      </div>
    </div>
  );
}
