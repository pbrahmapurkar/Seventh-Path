import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, CheckCircle2, CircleDashed, Edit3, X } from 'lucide-react';
import { AppBar } from '../components/AppShell';
import { useHabitsStore } from '../store/HabitsStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';

import { toYMD } from '../lib/habits';
import {
  getCompletionForDate,
  getCompletionSeriesMemoized,
  type CompletionSeriesItem
} from '../lib/completion';
import { formatHistoryDate, getHabitChangesForDay } from '../lib/historyUtils';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { AddHabitBottomSheet } from '../components/AddHabitBottomSheet';

import { format, subDays } from 'date-fns';

export function HistoryScreen() {
  const { habitsById, habitDaysByKey, toggleTime, toggleCompletionForDate } = useHabitsStore(state => ({
    habitsById: state.habitsById,
    habitDaysByKey: state.habitDaysByKey,
    toggleTime: state.toggleTime,
    toggleCompletionForDate: state.toggleCompletionForDate
  }));
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [showTodayCheckmark, setShowTodayCheckmark] = useState(false);

  // Get all habits
  const habits = Object.values(habitsById);

  // Get rolling 7-day history using unified completion system
  const rollingHistory = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6); // 7 days total

    return getCompletionSeriesMemoized({
      start: toYMD(startDate),
      end: toYMD(today),
      includeWeekends: true
    }, habits, habitDaysByKey);
  }, [habits, habitDaysByKey]);

  const todayYMD = toYMD(new Date());
  const todayDate = new Date();
  const yesterdayKey = format(subDays(todayDate, 1), 'yyyy-MM-dd');
  const dayBeforeKey = format(subDays(todayDate, 2), 'yyyy-MM-dd');
  console.log(`EDITABLE DATES: Yesterday -> ${yesterdayKey}, Day Before -> ${dayBeforeKey}`);

  const editablePastDates = useMemo(() => {
    const dates = new Set<string>();
    for (let offset = 1; offset <= 2; offset += 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - offset);
      dates.add(toYMD(d));
    }
    return dates;
  }, [todayYMD]);

  const isDateEditable = (date: string): boolean => {
    return date === todayYMD || editablePastDates.has(date);
  };

  // Handle habit toggle for retroactive editing
  const handleHabitToggle = async (habitId: string, date: string) => {
    console.log('🔄 Toggling habit:', { habitId, date });
    const habit = habitsById[habitId];
    if (!habit) {
      console.log('❌ Habit not found:', habitId);
      return;
    }

    // Get fresh state from store
    const store = useHabitsStore.getState();
    const freshHabitDaysByKey = store.habitDaysByKey;

    // Get current completion status with fresh data
    const completion = getCompletionForDate(date, [habit], freshHabitDaysByKey, {
      includeSameDay: true
    });
    const habitStatus = completion.habitStatuses.find(s => s.habitId === habitId);
    const isCompleted = habitStatus?.isCompleted ?? false;

    console.log('📊 Current status:', {
      habitName: habit.name,
      isCompleted,
      totalReminders: habitStatus?.totalReminders,
      completedReminders: habitStatus?.completedReminders
    });

    if (date !== todayYMD && editablePastDates.has(date)) {
      await store.toggleCompletionForDate(habitId, date);
    } else if (!isCompleted) {
      console.log('✅ Marking as completed');
      await store.markAllDone(habitId, date);
    } else {
      console.log('❌ Marking as not completed');
      const times = habit.reminderTimes && habit.reminderTimes.length > 0 ? habit.reminderTimes : ['default'];
      for (const time of times) {
        await toggleTime(habitId, time, date);
      }
    }

    // Check if Today reached 100% completion and trigger checkmark animation
    const today = toYMD(new Date());
    if (date === today) {
      // Get updated completion for today with fresh state
      const updatedStore = useHabitsStore.getState();
      const todayCompletion = getCompletionForDate(today, habits, updatedStore.habitDaysByKey, {
        includeSameDay: true
      });

      if (todayCompletion.percentage === 100) {
        setShowTodayCheckmark(true);
        // Hide checkmark after animation
        setTimeout(() => setShowTodayCheckmark(false), 2000);
      }
    }

    console.log('✅ Toggle completed');
  };

  // Get habits for editing a specific date using unified completion system
  const getHabitsForDate = (date: string) => {
    // Get fresh state from store
    const store = useHabitsStore.getState();
    const freshHabitDaysByKey = store.habitDaysByKey;

    const completion = getCompletionForDate(date, habits, freshHabitDaysByKey, {
      includeSameDay: true
    });

    const habitsForDate = completion.habitStatuses.map(status => ({
      id: status.habitId,
      name: status.name,
      emoji: status.emoji,
      completed: status.isCompleted,
      times: status.reminderDetails.map(r => r.time)
    }));

    console.log('📅 Habits for date:', { date, habits: habitsForDate });

    return habitsForDate;
  };

  // Filter rolling history to show only meaningful days
  const getMeaningfulDays = (history: CompletionSeriesItem[]) => {
    const today = toYMD(new Date());

    return history.filter(day => {
      const isToday = day.date === today;
      const hasScheduledHabits = day.total > 0;
      const hasCompletionActivity = day.percentage > 0;

      // Always include Today for orientation, even if no habits
      if (isToday) {
        return true;
      }

      // Include days that have scheduled habits OR completion activity
      return hasScheduledHabits || hasCompletionActivity;
    });
  };

  // Get filtered meaningful days for list view
  const meaningfulDays = useMemo(() => {
    return getMeaningfulDays(rollingHistory);
  }, [rollingHistory]);

  // Get weekly stats from the rolling history
  const getWeeklyStats = useMemo(() => {
    const last7Days = rollingHistory;
    const totalDays = last7Days.length;
    const completedDays = last7Days.filter(day => day.percentage === 100).length;
    const averageCompletion = last7Days.reduce((sum, day) => sum + day.percentage, 0) / totalDays;

    // Calculate current streak (consecutive 100% days from today backwards)
    let currentStreak = 0;
    const reversedDays = [...last7Days].reverse();
    for (const day of reversedDays) {
      if (day.percentage === 100) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalDays,
      completedDays,
      averageCompletion: Math.round(averageCompletion),
      totalHabits: habits.length,
      currentStreak
    };
  }, [rollingHistory, habits.length]);

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
      <AppBar title="History" />

      <div className="flex-1 px-6 py-6 pt-20 pb-24 w-full overflow-x-hidden overflow-y-auto">
        {/* Weekly Overview - Enhanced */}
        <Card className="mb-8 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-[1.25rem] shadow-[0_8px_24px_rgba(0,0,0,0.15)] w-full">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[rgba(16,185,129,0.1)] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Weekly Overview</h2>
                <p className="text-sm text-muted-foreground font-medium">Your progress this week</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-6">
              {/* Progress Ring */}
              <div className="relative w-20 h-20 flex-shrink-0">
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
                    strokeDasharray={`${getWeeklyStats.averageCompletion}, 100`}
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
                      {getWeeklyStats.averageCompletion}%
                    </div>
                    <div className="text-xs text-muted-foreground">Avg</div>
                  </div>
                </div>
              </div>

              {/* Stats - Enhanced with Streak */}
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div className="text-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-3">
                  <div className="text-2xl font-bold text-primary mb-0.5">🔥 {getWeeklyStats.currentStreak}</div>
                  <div className="text-xs text-muted-foreground font-medium">Streak</div>
                </div>
                <div className="text-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-3">
                  <div className="text-2xl font-bold text-primary mb-0.5">{getWeeklyStats.completedDays}</div>
                  <div className="text-xs text-muted-foreground font-medium">Perfect</div>
                </div>
                <div className="text-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl p-3">
                  <div className="text-2xl font-bold text-primary mb-0.5">{getWeeklyStats.totalHabits}</div>
                  <div className="text-xs text-muted-foreground font-medium">Habits</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Tabs - Enhanced */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 rounded-2xl p-1">
            <TabsTrigger value="calendar" className="rounded-xl font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Calendar View</TabsTrigger>
            <TabsTrigger value="list" className="rounded-xl font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-8">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Last 7 Days</h3>
                    <p className="text-sm text-muted-foreground font-medium">Rolling window view</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Day of Week Labels */}
                <div className="grid grid-cols-7 gap-3 mb-3 w-full">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-3 w-full">
                  {rollingHistory.map((day) => {
                    const isToday = day.date === toYMD(new Date());
                    const completionRate = day.percentage;
                    const isEditable = isDateEditable(day.date);
                    const isLocked = !isEditable;

                    // Enhanced color coding with 3 states
                    let chipClass = '';
                    let bgClass = '';
                    let borderClass = '';
                    let textClass = '';
                    let iconClass = '';

                    if (isLocked) {
                      // Locked dates - greyed out
                      chipClass = 'cursor-not-allowed opacity-60';
                      bgClass = 'bg-muted/20';
                      borderClass = 'border-muted/50';
                      textClass = 'text-muted-foreground/60';
                      iconClass = 'opacity-40';
                    } else if (isToday) {
                      // Today gets special treatment - unlocked and active
                      chipClass = 'ring-2 ring-primary shadow-lg scale-105 hover:scale-110 active:scale-95';
                      bgClass = 'bg-primary/15';
                      borderClass = 'border-primary';
                      textClass = 'text-primary font-bold';
                      iconClass = 'text-primary';
                    } else if (completionRate === 100) {
                      // Perfect day - green
                      bgClass = 'bg-green-500/20';
                      borderClass = 'border-green-500';
                      textClass = 'text-green-700 dark:text-green-300';
                    } else if (completionRate > 0) {
                      // Partial completion - orange
                      bgClass = 'bg-orange-400/20';
                      borderClass = 'border-orange-400';
                      textClass = 'text-orange-700 dark:text-orange-300';
                    } else {
                      // No activity - neutral
                      bgClass = 'bg-muted/30';
                      borderClass = 'border-muted';
                      textClass = 'text-muted-foreground';
                    }

                    return (
                      <div
                        key={day.date}
                        className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-xs transition-all duration-300 relative ${isLocked ? '' : 'hover:scale-105 cursor-pointer active:scale-95'
                          } ${chipClass} ${bgClass} ${borderClass} ${textClass}`}
                        title={
                          isLocked
                            ? `${formatHistoryDate(day.date)} - ${completionRate}% complete (locked)`
                            : `${formatHistoryDate(day.date)} - ${completionRate}% complete (${day.total} habits)${isEditable ? ' - Tap to edit' : ''}`
                        }
                        role={isLocked ? "img" : "button"}
                        tabIndex={isLocked ? -1 : 0}
                        aria-label={
                          isLocked
                            ? `${formatHistoryDate(day.date)} - ${completionRate}% complete, locked`
                            : `${formatHistoryDate(day.date)} - ${completionRate}% complete, ${day.total} habits${isEditable ? ', editable' : ''}`
                        }
                        aria-disabled={isLocked}
                        onClick={() => {
                          if (isEditable) {
                            setEditingDate(day.date);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (isEditable && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            setEditingDate(day.date);
                          }
                        }}
                      >
                        <div className="font-medium flex items-center gap-1">
                          {new Date(day.date).getDate()}
                          {/* Removed lock icon - subtle opacity is enough */}
                          {isEditable && <Edit3 className="w-2 h-2" />}
                        </div>
                        <div className="text-[10px]">
                          {completionRate}%
                        </div>

                        {/* Checkmark animation for Today when 100% */}
                        {isToday && showTodayCheckmark && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-lg"
                          >
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Compact Legend */}
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5" title="Today (Editable)">
                    <div className="w-2.5 h-2.5 rounded border-2 border-primary bg-primary/15 ring-1 ring-primary"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Perfect Day (100%)">
                    <div className="w-2.5 h-2.5 rounded border-2 border-green-500 bg-green-500/20"></div>
                    <span>100%</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Partial Completion (1-99%)">
                    <div className="w-2.5 h-2.5 rounded border-2 border-orange-400 bg-orange-400/20"></div>
                    <span>Partial</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="No Activity (0%)">
                    <div className="w-2.5 h-2.5 rounded border-2 border-muted bg-muted/30"></div>
                    <span>0%</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Locked past days">
                    <div className="w-2.5 h-2.5 rounded border-2 border-muted/50 bg-muted/20 opacity-60"></div>
                    <span>Locked</span>
                  </div>
                  <span className="text-muted-foreground/60 ml-auto">Tap to edit</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="mt-8">
            {meaningfulDays.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">No meaningful days to display</h3>
                <p className="text-sm font-medium">Start adding habits to see your history here.</p>
              </div>
            ) : (
              <div className="space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                {meaningfulDays.slice().reverse().map((day, index) => {
                  const previousDay = index < meaningfulDays.length - 1 ? meaningfulDays[meaningfulDays.length - 2 - index] : null;
                  const changes = getHabitChangesForDay(habits, day.date, previousDay?.date);
                  const isToday = day.date === toYMD(new Date());
                  const completionRate = day.percentage;
                  const completedCount = day.completed;

                  return (
                    <Card
                      key={day.date}
                      className={`transition-all duration-300 hover:shadow-lg active:scale-[0.98] rounded-2xl ${isToday
                        ? 'ring-2 ring-primary/50 shadow-lg bg-gradient-to-r from-primary/5 to-transparent border-primary/30'
                        : 'hover:shadow-md'
                        }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isToday
                              ? 'bg-primary/20 ring-2 ring-primary/30'
                              : 'bg-primary/10'
                              }`}>
                              <Calendar className={`w-4 h-4 ${isToday ? 'text-primary' : 'text-primary'}`} />
                            </div>
                            <div>
                              <h3 className={`font-medium ${isToday ? 'text-primary' : ''}`}>
                                {formatHistoryDate(day.date)}
                                {isToday && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">TODAY</span>}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {completedCount} of {day.total} habits completed
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
                            variant={completionRate === 100 ? "default" : completionRate > 0 ? "secondary" : "outline"}
                            className={completionRate === 100 ? "bg-green-500" : ""}
                          >
                            {completionRate}%
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{completionRate}%</span>
                          </div>
                          <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ease-out ${completionRate === 100
                                ? 'bg-gradient-to-r from-green-500 to-green-400'
                                : completionRate > 0
                                  ? 'bg-gradient-to-r from-orange-400 to-orange-300'
                                  : 'bg-muted'
                                }`}
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {getHabitsForDate(day.date).map((habit) => {
                            const isNew = changes.added.some(h => h.id === habit.id);
                            const isPastEditable = editablePastDates.has(day.date) && !isToday;
                            const dayKey = `habit:${habit.id}:day:${day.date}`;
                            const habitDayEntry = habitDaysByKey[dayKey];
                            const totalReminders = habitDayEntry?.reminders.length ?? 0;
                            const completedReminders = habitDayEntry ? habitDayEntry.reminders.filter(r => r.done).length : 0;
                            const isCompleted = totalReminders > 0 && completedReminders === totalReminders;
                            console.log(`RENDER CHECK => Date: ${day.date}, Habit: ${habit.id}, Completed: ${isCompleted}`);
                            const baseClasses = `flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 ${isCompleted
                              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                              : 'bg-muted/30 border-border'
                              } ${isNew ? 'ring-2 ring-green-300 dark:ring-green-700' : ''}`;

                            const content = (
                              <>
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
                                  {isCompleted && (
                                    <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Completed
                                    </div>
                                  )}
                                </div>
                                <div className="shrink-0 flex items-center justify-center">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                  ) : (
                                    <CircleDashed className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              </>
                            );

                            if (isPastEditable) {
                              return (
                                <button
                                  key={habit.id}
                                  type="button"
                                  onClick={async () => {
                                    console.log(`CLICKED: Habit ID: ${habit.id}, Date: ${day.date}`);
                                    await toggleCompletionForDate(habit.id, day.date);
                                  }}
                                  className={`${baseClasses} cursor-pointer hover:ring-2 hover:ring-primary/50 focus:ring-2 focus:ring-primary focus:outline-none`}
                                  aria-pressed={isCompleted}
                                  aria-label={`Toggle ${habit.name} completion for ${formatHistoryDate(day.date)}`}
                                >
                                  {content}
                                </button>
                              );
                            }

                            return (
                              <div
                                key={habit.id}
                                className={`${baseClasses} opacity-70`}
                                aria-hidden="true"
                              >
                                {content}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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

      {/* Habit Editor Bottom Sheet - Enhanced */}
      {editingDate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end animate-in fade-in duration-200">
          <div className="bg-background rounded-t-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {formatHistoryDate(editingDate)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Toggle habits you completed
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingDate(null)}
                aria-label="Close editor"
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {getHabitsForDate(editingDate).map((habit) => {
                const dayKey = `habit:${habit.id}:day:${editingDate}`;
                const habitDayEntry = habitDaysByKey[dayKey];
                const totalReminders = habitDayEntry?.reminders.length ?? 0;
                const completedReminders = habitDayEntry ? habitDayEntry.reminders.filter(r => r.done).length : 0;
                const isCompleted = totalReminders > 0 && completedReminders === totalReminders;
                console.log(`RENDER CHECK => Sheet Date: ${editingDate}, Habit: ${habit.id}, Completed: ${isCompleted}`);
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{habit.emoji}</div>
                      <div>
                        <div className="font-medium">{habit.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {habit.times.length > 1 ? `${habit.times.length} reminders` : 'Single reminder'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {isCompleted ? 'Completed' : 'Not completed'}
                      </span>
                      <Switch
                        checked={isCompleted}
                        onCheckedChange={() => handleHabitToggle(habit.id, editingDate)}
                        aria-label={`Toggle ${habit.name} completion`}
                      />
                    </div>
                  </div>
                );
              })}

              {getHabitsForDate(editingDate).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No habits scheduled for this day</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-background border-t border-border p-4">
              <Button
                onClick={() => setEditingDate(null)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
