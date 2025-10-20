import React, { useMemo, useState } from 'react';
import { useHabitDetails } from './hooks';
import { useAppShell, AppBar, BottomNav } from '../../components/AppShellRouter';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Skeleton, SkeletonCard, SkeletonStats, SkeletonTabs } from '../../components/ui/skeleton';
import { Edit, Trash2, Plus, Clock, Check, Home, BarChart3, Settings, History, CheckCircle2, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerTab } from './TimerTab';
// removed Snooze action; no LocalNotifications import needed here

function formatSinceDays(iso: string): number {
  const created = new Date(iso);
  const now = new Date();
  const ms = now.getTime() - created.getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

function TimeInput({ onSubmit, initial }: { onSubmit: (t: string) => void; initial?: string }) {
  const [t, setT] = useState(initial || '08:00');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleTimeChange = (newTime: string) => {
    setT(newTime);
    onSubmit(newTime);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        className="border rounded px-2 py-1 text-sm bg-background"
        value={t}
        onChange={(e) => handleTimeChange(e.target.value)}
      />
      {showConfirmation && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="flex items-center gap-1 text-green-600 text-xs"
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>Saved</span>
        </motion.div>
      )}
    </div>
  );
}

export function HabitDetails({ habitId }: { habitId: string }) {
  const { navigate, currentRoute } = useAppShell();
  const {
    habit, todayEntry, stats, activity, loading, error,
    completedToday,
    toggleReminder, addReminder, removeReminder, updateReminderTime,
    markCompletedToday, removeHabit
  } = useHabitDetails(habitId);
  const [activeTab, setActiveTab] = useState('overview');
  const [adding, setAdding] = useState(false);
  const [editingTime, setEditingTime] = useState<string | null>(null);

  const canCompleteToday = useMemo(() => Boolean(todayEntry && todayEntry.reminders.length > 0 && !completedToday), [todayEntry, completedToday]);

  if (loading) return (
    <div 
      className="flex flex-col min-h-screen bg-background w-full"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <AppBar title="Habit Details" showBack onBack={() => navigate('/home')} />
      <div className="flex-1 px-6 py-6 pt-20 pb-24 w-full overflow-x-hidden overflow-y-auto">
        <SkeletonCard className="mb-8" />
        <SkeletonCard className="mb-8" />
        <SkeletonTabs />
      </div>
    </div>
  );
  if (error || !habit) return (
    <div 
      className="flex flex-col min-h-screen bg-background w-full p-6"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {error || 'Habit not found'}
    </div>
  );

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
      <AppBar
        title="Habit Details"
        showBack
        onBack={() => navigate('/home')}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(`/habit/${habitId}/edit`)} className="hover:bg-muted/50 active:scale-95 transition-all duration-200">
            <Edit size={18} />
          </Button>
        }
      />

      <div className="flex-1 px-6 py-6 pt-20 pb-24 w-full overflow-x-hidden overflow-y-auto">
        {/* Header Card - Enhanced */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8 mb-8 w-full shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">{habit.emoji}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{habit.name}</h1>
              <p className="text-muted-foreground font-medium text-lg">
                {habit.frequency === 'daily' ? 'Daily' : 'Weekly'} Habit
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="text-center bg-primary/5 rounded-2xl p-4">
              <div className="text-3xl font-bold text-primary mb-1">{stats?.currentStreak ?? 0}</div>
              <div className="text-sm text-muted-foreground font-medium">🔥 Current streak</div>
            </div>
            <div className="text-center bg-primary/5 rounded-2xl p-4">
              <div className="text-3xl font-bold text-primary mb-1">{stats?.bestStreak ?? 0}</div>
              <div className="text-sm text-muted-foreground font-medium">🏆 Best streak</div>
            </div>
            <div className="text-center bg-primary/5 rounded-2xl p-4">
              <div className="text-3xl font-bold text-primary mb-1">{stats?.completionRate ?? 0}%</div>
              <div className="text-sm text-muted-foreground font-medium">% Completion</div>
            </div>
            <div className="text-center bg-primary/5 rounded-2xl p-4">
              <div className="text-3xl font-bold text-primary mb-1">{stats?.totalCompletedDays ?? 0}</div>
              <div className="text-sm text-muted-foreground font-medium">Total completions</div>
            </div>
          </div>
        </div>

        {/* Reminder Checklist (today) - Enhanced */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 w-full shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Today's Reminders</h3>
            </div>
            {!completedToday && (
              <Button size="sm" variant="secondary" onClick={() => setAdding(v => !v)} className="rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all duration-200">
                <Plus size={16} className="mr-2" /> Add
              </Button>
            )}
          </div>

          {adding && (
            <div className="mb-6">
              <TimeInput onSubmit={async (t) => { await addReminder(t); setAdding(false); }} />
            </div>
          )}

          <div className="space-y-3">
            {todayEntry && todayEntry.reminders.length > 0 ? (
              todayEntry.reminders.map((r) => (
                <div key={r.time} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card/50 hover:bg-card transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <button
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${r.done ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'border-border hover:border-primary/50'}`}
                      onClick={() => toggleReminder(r.time, !r.done)}
                      aria-label={r.done ? 'Uncheck' : 'Check'}
                    >
                      {r.done && <Check size={16} />}
                    </button>
                    <div className="flex items-center gap-3 text-base">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="font-semibold">{r.time}</span>
                      {editingTime === r.time ? (
                        <TimeInput initial={r.time} onSubmit={async (t) => { await updateReminderTime(r.time, t); setEditingTime(null); }} />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!r.done && (
                      <Button size="sm" variant="outline" onClick={() => setEditingTime(editingTime === r.time ? null : r.time)} className="rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all duration-200">Edit</Button>
                    )}
                    {!r.done && (
                      <Button size="sm" variant="outline" onClick={() => removeReminder(r.time)} className="rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all duration-200">Delete</Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No reminders set for today.</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            {completedToday ? (
              <Button className="w-full h-14 text-lg font-bold rounded-2xl" disabled>✅ Completed Today</Button>
            ) : (
              <Button className="w-full h-14 text-lg font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all duration-200" onClick={markCompletedToday} disabled={!canCompleteToday}>Mark Completed Today</Button>
            )}
          </div>
        </div>

        {/* Tabs - Enhanced */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${habit.timerConfig?.enabled ? 'grid-cols-3' : 'grid-cols-2'} bg-muted/30 rounded-2xl p-1`}>
            <TabsTrigger value="overview" className="rounded-xl font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
            {habit.timerConfig?.enabled && (
              <TabsTrigger value="timer" className="rounded-xl font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Timer className="w-4 h-4 mr-2" />
                Timer
              </TabsTrigger>
            )}
            <TabsTrigger value="history" className="rounded-xl font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-8 w-full">
            {/* This Week - Enhanced */}
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-lg font-bold text-foreground">This Week</div>
                </div>
                <div className="text-3xl font-bold text-primary mb-1">
                  {stats?.weeklyProgress.filter(d => d.complete).length ?? 0}/7
                </div>
                <div className="text-sm text-muted-foreground font-medium">Days completed</div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-lg font-bold text-foreground">Created</div>
                </div>
                <div className="text-3xl font-bold text-primary mb-1">{formatSinceDays(habit.createdAt)}</div>
                <div className="text-sm text-muted-foreground font-medium">Days ago</div>
              </div>
            </div>

            {/* Recent Activity - Enhanced */}
            <div className="bg-card border border-border rounded-2xl p-6 w-full shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {activity.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">No recent activity yet.</p>
                  </div>
                ) : activity.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-card/50 hover:bg-card transition-all duration-200">
                    <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-base font-medium flex-1">
                      {new Date(a.ts).toLocaleString()} — {a.type.replace('_', ' ')} {a.detail ? `(${a.detail})` : ''}
                    </span>
                    <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 rounded-full">Log</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Timer Tab - NEW */}
          {habit.timerConfig?.enabled && (
            <TabsContent value="timer" className="mt-8 w-full">
              <TimerTab 
                habit={habit}
                onHabitComplete={async () => {
                  // Refresh the habit details after auto-completion
                  window.location.reload();
                }}
              />
            </TabsContent>
          )}

          <TabsContent value="history" className="space-y-8 mt-8 w-full">
            <div className="bg-card border border-border rounded-2xl p-6 w-full shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Last 14 Days</h3>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {stats?.weeklyProgress && (
                  [...Array(14)].map((_, i) => {
                    const d = new Date(); d.setDate(d.getDate() - (13 - i));
                    const ymd = d.toISOString().slice(0,10);
                    const found = stats.weeklyProgress.find(w => w.date === ymd);
                    const complete = found?.complete ?? false;
                    return (
                      <div key={i} className={`h-10 rounded-2xl border-2 transition-all duration-200 hover:scale-110 ${complete ? 'bg-primary border-primary shadow-lg' : 'border-muted bg-muted/30 hover:border-primary/50'}`} title={ymd} />
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Danger Zone - Enhanced */}
        <div className="mt-8 pt-6 border-t border-border w-full">
          <Button variant="destructive" className="w-full h-14 text-lg font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all duration-200" onClick={async () => {
            if (confirm('Delete this habit and all its data?')) {
              await removeHabit();
              navigate('/home');
            }
          }}>
            <Trash2 size={18} className="mr-2" /> Delete Habit
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentRoute={currentRoute} onNavigate={navigate} />
    </div>
  );
}
