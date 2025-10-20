import React, { useMemo, useState } from 'react';
import { Edit, Trash2, Calendar, TrendingUp, Target, Clock, Flame, CheckCircle2, BarChart3, History, Settings, Bell, BellOff, Star, Zap, Award, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AppBar, useAppShell } from '../components/AppShellRouter';
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
        {/* Enhanced Habit Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-card/90 border border-border rounded-2xl mb-6 shadow-lg">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          
          <div className="relative p-8">
            {/* Main Header */}
            <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-4xl">{habit?.emoji}</span>
                </div>
                {streak > 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold mb-2 text-foreground">{habit?.title}</h1>
                <div className="flex items-center gap-4 mb-3">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Target className="w-3 h-3 mr-1" />
                    {habit ? habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1) : ''}
                  </Badge>
                  {(habit?.reminderTimes?.length > 0 || habit?.reminderTime) && (
                    <Badge variant="outline" className="px-3 py-1">
                      <Bell className="w-3 h-3 mr-1" />
                      {habit?.reminderTimes?.length > 0 ? `${habit.reminderTimes.length} reminder${habit.reminderTimes.length > 1 ? 's' : ''}` : '1 reminder'}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {habit?.reminderTimes && habit.reminderTimes.length > 0 && `Reminders at ${habit.reminderTimes.join(', ')}`}
                  {!habit?.reminderTimes?.length && habit?.reminderTime && `Reminder at ${habit.reminderTime}`}
                </p>
              </div>
            </div>
            
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{streak}</div>
                <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">Day Streak</div>
                {streak > 0 && (
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {streak === 1 ? 'Keep it up!' : streak < 7 ? 'Great start!' : streak < 30 ? 'Excellent!' : 'Amazing!'}
                  </div>
                )}
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completionRate}%</div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">Completion Rate</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {completionRate >= 80 ? 'Outstanding!' : completionRate >= 60 ? 'Great job!' : completionRate >= 40 ? 'Good progress!' : 'Keep going!'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalCompletions}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Completions</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {totalCompletions === 0 ? 'Start your journey!' : totalCompletions < 10 ? 'Building momentum!' : 'Consistency champion!'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-700 dark:text-purple-300">This Week</h3>
                      <p className="text-xs text-purple-600 dark:text-purple-400">Progress tracking</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">5/7</div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Days completed</div>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-2">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full" style={{ width: '71%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-indigo-700 dark:text-indigo-300">Created</h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">Habit start date</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">10</div>
                  <div className="text-sm text-indigo-700 dark:text-indigo-300">Days ago</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Building consistency!</div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Recent Activity */}
            <Card className="bg-gradient-to-br from-card to-card/50 border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {recentCompletions.slice(0, 5).map((completion, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-green-50/50 to-green-100/30 dark:from-green-950/10 dark:to-green-900/5 border border-green-200/50 dark:border-green-800/50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-green-700 dark:text-green-300">
                          Completed on {completion.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {completion.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                        ✓ Done
                      </Badge>
                    </div>
                  ))}
                  {recentCompletions.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-muted-foreground mb-2">No completions yet</h3>
                      <p className="text-sm text-muted-foreground">Start building your habit streak today!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            {/* Enhanced Calendar Heatmap */}
            <Card className="bg-gradient-to-br from-card to-card/50 border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  Last 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gradient-to-r from-muted/30 to-muted/10 border border-border rounded-xl p-6">
                  <CalendarHeatmap />
                  <div className="flex items-center justify-between mt-6 text-sm">
                    <span className="text-muted-foreground">Less activity</span>
                    <div className="flex gap-2">
                      <div className="w-4 h-4 rounded-sm border border-muted bg-muted/30" />
                      <div className="w-4 h-4 rounded-sm bg-primary/30" />
                      <div className="w-4 h-4 rounded-sm bg-primary/60" />
                      <div className="w-4 h-4 rounded-sm bg-primary" />
                    </div>
                    <span className="text-muted-foreground">More activity</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Completion History */}
            <Card className="bg-gradient-to-br from-card to-card/50 border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-primary" />
                  </div>
                  Completion History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentCompletions.map((completion, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-green-50/50 to-green-100/30 dark:from-green-950/10 dark:to-green-900/5 border border-green-200/50 dark:border-green-800/50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-green-700 dark:text-green-300">
                          {completion.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {completion.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                        ✓ Completed
                      </Badge>
                    </div>
                  ))}
                  {recentCompletions.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-muted-foreground mb-2">No history yet</h3>
                      <p className="text-sm text-muted-foreground">Complete your habit to see it here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Reminder Settings */}
            <Card className="bg-gradient-to-br from-card to-card/50 border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  Reminder Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 border border-border rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        (habit?.reminderTimes?.length > 0 || habit?.reminderTime) 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-muted/50'
                      }`}>
                        {(habit?.reminderTimes?.length > 0 || habit?.reminderTime) ? (
                          <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <BellOff className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          {(habit?.reminderTimes?.length > 0 || habit?.reminderTime) 
                            ? 'Reminders are enabled' 
                            : 'No reminders set'
                          }
                        </p>
                      </div>
                    </div>
                    <Badge variant={(habit?.reminderTimes?.length > 0 || habit?.reminderTime) ? "default" : "secondary"}>
                      {(habit?.reminderTimes?.length > 0 || habit?.reminderTime) ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  {(habit?.reminderTimes?.length > 0 || habit?.reminderTime) && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Reminder Times</h4>
                      <div className="flex flex-wrap gap-2">
                        {(habit?.reminderTimes || [habit?.reminderTime]).filter(Boolean).map((time, index) => (
                          <Badge key={index} variant="outline" className="px-3 py-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Habit Information */}
            <Card className="bg-gradient-to-br from-card to-card/50 border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  Habit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">Frequency</span>
                      </div>
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {habit ? habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1) : ''}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-purple-700 dark:text-purple-300">Created</span>
                      </div>
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        10 days ago
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Actions */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="h-14 text-lg border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Habit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="h-14 text-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Habit
            </Button>
          </div>
          
          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-primary font-medium">
                  {streak > 0 
                    ? `You're on a ${streak}-day streak! Keep up the amazing work! 🔥`
                    : totalCompletions > 0
                    ? `You've completed this habit ${totalCompletions} time${totalCompletions > 1 ? 's' : ''}! Every step counts! 💪`
                    : 'Ready to start your habit journey? You\'ve got this! 🌟'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
