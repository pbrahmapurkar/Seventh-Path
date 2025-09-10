import React, { useMemo, useState } from 'react';
import { useHabitDetails } from './hooks';
import { useAppShell, AppBar } from '../../components/AppShell';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Edit, Trash2, Plus, Clock, Check } from 'lucide-react';
import { notificationService } from '../../services/notifications';

function formatSinceDays(iso: string): number {
  const created = new Date(iso);
  const now = new Date();
  const ms = now.getTime() - created.getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

function TimeInput({ onSubmit, initial }: { onSubmit: (t: string) => void; initial?: string }) {
  const [t, setT] = useState(initial || '08:00');
  return (
    <div className="flex items-center gap-2">
      <input
        type="time"
        className="border rounded px-2 py-1 text-sm bg-background"
        value={t}
        onChange={(e) => setT(e.target.value)}
      />
      <Button size="sm" onClick={() => onSubmit(t)}>Save</Button>
    </div>
  );
}

export function HabitDetails({ habitId }: { habitId: string }) {
  const { navigate } = useAppShell();
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
    <div className="p-6">Loading…</div>
  );
  if (error || !habit) return (
    <div className="p-6">{error || 'Habit not found'}</div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar
        title="Habit Details"
        showBack
        onBack={() => navigate('/home')}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(`/habit/${habitId}/edit`)}>
            <Edit size={16} />
          </Button>
        }
      />

      <div className="flex-1 p-6">
        {/* Header Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{habit.emoji}</span>
            <div className="flex-1">
              <h1 className="text-2xl font-medium">{habit.name}</h1>
              <p className="text-muted-foreground">
                {habit.frequency === 'daily' ? 'Daily' : 'Weekly'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-medium text-primary">{stats?.currentStreak ?? 0}</div>
              <div className="text-sm text-muted-foreground">🔥 Current streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-primary">{stats?.bestStreak ?? 0}</div>
              <div className="text-sm text-muted-foreground">🏆 Best streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-primary">{stats?.completionRate ?? 0}%</div>
              <div className="text-sm text-muted-foreground">% Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-primary">{stats?.totalCompletedDays ?? 0}</div>
              <div className="text-sm text-muted-foreground">Total completions</div>
            </div>
          </div>
        </div>

        {/* Reminder Checklist (today) */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Today's Reminders</h3>
            {!completedToday && (
              <Button size="sm" variant="secondary" onClick={() => setAdding(v => !v)}>
                <Plus size={14} className="mr-1" /> Add
              </Button>
            )}
          </div>

          {adding && (
            <div className="mb-4">
              <TimeInput onSubmit={async (t) => { await addReminder(t); setAdding(false); }} />
            </div>
          )}

          <div className="space-y-2">
            {todayEntry && todayEntry.reminders.length > 0 ? (
              todayEntry.reminders.map((r) => (
                <div key={r.time} className="flex items-center justify-between p-3 rounded border border-border">
                  <div className="flex items-center gap-3">
                    <button
                      className={`w-6 h-6 rounded border flex items-center justify-center ${r.done ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
                      onClick={() => toggleReminder(r.time, !r.done)}
                      aria-label={r.done ? 'Uncheck' : 'Check'}
                    >
                      {r.done && <Check size={14} />}
                    </button>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-muted-foreground" />
                      <span>{r.time}</span>
                      {editingTime === r.time ? (
                        <TimeInput initial={r.time} onSubmit={async (t) => { await updateReminderTime(r.time, t); setEditingTime(null); }} />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!r.done && (
                      <Button size="sm" variant="outline" onClick={() => setEditingTime(editingTime === r.time ? null : r.time)}>Edit</Button>
                    )}
                    {!r.done && (
                      <Button size="sm" variant="outline" onClick={() => removeReminder(r.time)}>Delete</Button>
                    )}
                    {!r.done && (
                      <Button size="sm" variant="secondary" onClick={() => {
                        // Snooze: schedule a one-off 10 minutes later (web-only best-effort via notificationService)
                        const fireAt = new Date(Date.now() + 10 * 60 * 1000);
                        notificationService.sendTestNotification(`${habit.emoji} ${habit.name}`, `Snoozed to ${fireAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
                      }}>Snooze 10m</Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No reminders set for today.</p>
            )}
          </div>

          <div className="mt-4">
            {completedToday ? (
              <Button className="w-full" disabled>✅ Completed Today</Button>
            ) : (
              <Button className="w-full" onClick={markCompletedToday} disabled={!canCompleteToday}>Mark Completed Today</Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* This Week */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">This Week</div>
                <div className="text-xl font-medium">
                  {stats?.weeklyProgress.filter(d => d.complete).length ?? 0}/7
                </div>
                <div className="text-sm text-muted-foreground">Days completed</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Created</div>
                <div className="text-xl font-medium">{formatSinceDays(habit.createdAt)}</div>
                <div className="text-sm text-muted-foreground">Days ago</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-medium mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                ) : activity.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">
                      {new Date(a.ts).toLocaleString()} — {a.type.replace('_', ' ')} {a.detail ? `(${a.detail})` : ''}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-xs">Log</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-medium mb-4">Last 14 Days</h3>
              <div className="grid grid-cols-7 gap-2">
                {stats?.weeklyProgress && (
                  [...Array(14)].map((_, i) => {
                    const d = new Date(); d.setDate(d.getDate() - (13 - i));
                    const ymd = d.toISOString().slice(0,10);
                    const found = stats.weeklyProgress.find(w => w.date === ymd);
                    const complete = found?.complete ?? false;
                    return (
                      <div key={i} className={`h-8 rounded border ${complete ? 'bg-primary border-primary' : 'border-muted bg-muted/30'}`} title={ymd} />
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t border-border">
          <Button variant="destructive" className="w-full" onClick={async () => {
            if (confirm('Delete this habit and all its data?')) {
              await removeHabit();
              navigate('/home');
            }
          }}>
            <Trash2 size={16} className="mr-2" /> Delete Habit
          </Button>
        </div>
      </div>
    </div>
  );
}
