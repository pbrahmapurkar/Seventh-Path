import React, { useMemo, useState } from 'react';
import { History, Calendar, TrendingUp, Target, CheckCircle2, Clock, Flame, Plus, BarChart3 } from 'lucide-react';
import { useAppShell, AppBar } from '../components/AppShell';
import { useHabitsStore } from '../store/HabitsStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toYMD } from '../lib/habits';
import { 
  generateRollingHistory, 
  formatHistoryDate, 
  getCompletionColorClass,
  getHabitChangesForDay,
  type DayHistoryEntry 
} from '../lib/historyUtils';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { AddHabitBottomSheet } from '../components/AddHabitBottomSheet';

export function HistoryScreen() {
  const { navigate } = useAppShell();
  const { habitsById, habitDaysByKey, statsById } = useHabitsStore();
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  // Get all habits
  const habits = Object.values(habitsById);
  
  // Get rolling 7-day history (today + 6 previous days)
  const rollingHistory = useMemo(() => {
    return generateRollingHistory(habits, habitDaysByKey, 7);
  }, [habits, habitDaysByKey]);

  // Get weekly stats from the rolling history
  const getWeeklyStats = useMemo(() => {
    const last7Days = rollingHistory;
    const totalDays = last7Days.length;
    const completedDays = last7Days.filter(day => day.completionRate === 100).length;
    const averageCompletion = last7Days.reduce((sum, day) => sum + day.completionRate, 0) / totalDays;
    
    return {
      totalDays,
      completedDays,
      averageCompletion: Math.round(averageCompletion),
      totalHabits: habits.length
    };
  }, [rollingHistory, habits.length]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24 pb-safe-area-bottom">
      <AppBar title="History" />

      <div className="flex-1 px-6 py-6">
        {/* Weekly Overview */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              Weekly Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getWeeklyStats.completedDays}</div>
                <div className="text-sm text-muted-foreground">Perfect Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getWeeklyStats.averageCompletion}%</div>
                <div className="text-sm text-muted-foreground">Avg Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{getWeeklyStats.totalHabits}</div>
                <div className="text-sm text-muted-foreground">Total Habits</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Tabs */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  Last 7 Days (Rolling Window)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {rollingHistory.map((day, index) => {
                    const isToday = day.date === toYMD(new Date());
                    const colorClass = getCompletionColorClass(day.completionRate, isToday);
                    
                    return (
                      <div
                        key={day.date}
                        className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1 text-xs ${colorClass}`}
                        title={`${formatHistoryDate(day.date)} - ${day.completionRate.toFixed(0)}% complete (${day.habits.length} habits)`}
                      >
                        <div className="font-medium">
                          {new Date(day.date).getDate()}
                        </div>
                        <div className="text-[10px]">
                          {day.completionRate.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border-2 border-primary bg-primary/10"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/20"></div>
                    <span>Perfect Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border-2 border-orange-400 bg-orange-400/20"></div>
                    <span>Partial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border-2 border-muted bg-muted/30"></div>
                    <span>No Activity</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
              {rollingHistory.slice().reverse().map((day, index) => {
                const previousDay = index < rollingHistory.length - 1 ? rollingHistory[rollingHistory.length - 2 - index] : null;
                const changes = getHabitChangesForDay(habits, day.date, previousDay?.date);
                
                return (
                  <Card key={day.date} className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{formatHistoryDate(day.date)}</h3>
                            <p className="text-sm text-muted-foreground">
                              {day.habits.filter(h => h.completed).length} of {day.habits.length} habits completed
                            </p>
                            {/* Show habit changes */}
                            {(changes.added.length > 0 || changes.removed.length > 0) && (
                              <div className="flex gap-2 mt-1">
                                {changes.added.length > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                    +{changes.added.length} added
                                  </Badge>
                                )}
                                {changes.removed.length > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                    -{changes.removed.length} removed
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={day.completionRate === 100 ? "default" : day.completionRate > 0 ? "secondary" : "outline"}
                          className={day.completionRate === 100 ? "bg-green-500" : ""}
                        >
                          {day.completionRate.toFixed(0)}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {day.habits.map((habit) => {
                          const isNew = changes.added.some(h => h.id === habit.id);
                          const isRemoved = changes.removed.some(h => h.id === habit.id);
                          
                          return (
                            <div
                              key={habit.id}
                              className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                                habit.completed 
                                  ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' 
                                  : 'bg-muted/30'
                              } ${isNew ? 'ring-2 ring-green-300 dark:ring-green-700' : ''}`}
                            >
                              <div className="text-lg">{habit.emoji}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate flex items-center gap-1">
                                  {habit.name}
                                  {isNew && (
                                    <Badge variant="outline" className="text-xs px-1 py-0 h-4 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700">
                                      NEW
                                    </Badge>
                                  )}
                                </div>
                                {habit.completed && (
                                  <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Completed
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
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
