import React, { useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';
import { useHabitsStore } from '../store/HabitsStore';
import { MultiTimePicker } from '../components/MultiTimePicker';
import { useNotifications } from '../providers/notificationProvider';
import { Bell, BellOff } from 'lucide-react';

const emojiOptions = [
  '💧', '🚶', '📚', '🧘', '💪', '📝', '🥗', '📞',
  '🏃', '🎵', '🖼️', '🌱', '☕', '💤', '🧼', '🏠',
  '🎯', '💡', '🎨', '🍎', '🧽', '📱', '🕯️', '🌟'
];

export function HabitEdit({ habitId }: { habitId: string }) {
  const { navigate } = useAppShell();
  const store = useHabitsStore();
  const habit = store.habitsById[habitId];

  const [title, setTitle] = useState(habit?.name || '');
  const [emoji, setEmoji] = useState(habit?.emoji || '🎯');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(habit?.frequency || 'daily');
  const [hasReminder, setHasReminder] = useState(Boolean(habit?.reminderTimes?.length));
  const [reminderTimes, setReminderTimes] = useState<string[]>(habit?.reminderTimes || ['08:00']);
  const [isSaving, setIsSaving] = useState(false);
  const [weeklyDays, setWeeklyDays] = useState<number[]>(habit?.weeklyDays || []);
  const [error, setError] = useState<string | null>(null);
  const { updateHabitReminder, cancelHabitReminders, isPermissionGranted, checkAndRequestPermission } = useNotifications();

  if (!habit) {
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
        <AppBar title="Edit Habit" showBack onBack={() => navigate('/home')} />
        <div className="flex-1 flex items-center justify-center p-6 pt-20 w-full">
          <div className="text-center">
            <p className="text-muted-foreground">Habit not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) return;

    setError(null);
    if (hasReminder) {
      if (reminderTimes.length === 0) { setError('Please select at least one time'); return; }
      if (frequency === 'weekly' && weeklyDays.length === 0) { setError('Please select at least one day'); return; }
    }
    setIsSaving(true);
    try {
      // Persist via global store; this emits habit:updated and reschedules
      await store.editHabit({
        id: habit.id,
        name: title.trim(),
        emoji,
        frequency,
        reminderTimes: hasReminder ? reminderTimes : [],
        weeklyDays: frequency === 'weekly' && hasReminder ? weeklyDays : undefined,
      });

      // Best-effort: update native notifications on platforms using LocalNotifications
      try {
        await cancelHabitReminders(habit.id);
        if (hasReminder && reminderTimes.length && isPermissionGranted) {
          for (const t of reminderTimes) {
            await updateHabitReminder(
              habit.id,
              title.trim(),
              emoji,
              t,
              frequency === 'weekly' ? 'weekly' : 'daily',
              frequency === 'weekly' ? weeklyDays : undefined
            );
          }
        }
      } catch (e) {
        console.warn('Notification update failed', e);
      }
      try { alert('Habit updated successfully'); } catch {}
      navigate(`/habit/${habit.id}`);
    } catch (e: any) {
      const msg = e?.message || 'Failed to save changes';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReminderToggle = async (enabled: boolean) => {
    if (enabled) {
      const allowed = await checkAndRequestPermission();
      if (!allowed) return;
    }
    setHasReminder(enabled);
    if (!enabled) setReminderTimes([]);
  };

  const initial = React.useMemo(() => ({
    name: habit?.name || '',
    emoji: habit?.emoji || '🎯',
    frequency: habit?.frequency || 'daily',
    times: habit?.reminderTimes || [],
    weeklyDays: habit?.weeklyDays || [],
  }), [habit]);

  const isDirty = (
    initial.name !== title.trim() ||
    initial.emoji !== emoji ||
    initial.frequency !== frequency ||
    JSON.stringify(initial.times) !== JSON.stringify(reminderTimes) ||
    JSON.stringify(initial.weeklyDays) !== JSON.stringify(weeklyDays)
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
        title="Edit Habit"
        showBack
        onBack={() => {
          if (isDirty && !isSaving) {
            const ok = window.confirm('Discard changes?');
            if (!ok) return;
          }
          navigate(`/habit/${habit.id}`);
        }}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex-1 px-6 pt-20 pb-30 overflow-y-auto">
          <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Habit name</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Choose an emoji</Label>
            <div className="grid grid-cols-8 gap-2 p-4 bg-card border border-border rounded-lg">
              {emojiOptions.map((emojiOption) => (
                <button
                  key={emojiOption}
                  onClick={() => setEmoji(emojiOption)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    emoji === emojiOption ? 'bg-primary text-white' : 'hover:bg-muted'
                  }`}
                >
                  {emojiOption}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <DayChips selected={weeklyDays} onChange={setWeeklyDays} disabled={!hasReminder} />
            </div>
          )}

          <MultiTimePicker
            enabled={hasReminder}
            onEnabledChange={handleReminderToggle}
            times={reminderTimes}
            onChange={setReminderTimes}
            defaultTime="08:00"
            disabled={isSaving}
            onAutoSave={async (times) => {
              // Auto-save reminder times immediately
              await store.editHabit({
                id: habit.id,
                name: habit.name,
                emoji: habit.emoji,
                frequency: habit.frequency,
                reminderTimes: times,
                weeklyDays: habit.weeklyDays,
              });
            }}
          />
            <div className="text-sm text-muted-foreground -mt-2">
              {hasReminder ? (
                <div className="flex items-center gap-2"><Bell size={16} /> Reminder enabled</div>
              ) : (
                <div className="flex items-center gap-2"><BellOff size={16} /> Reminder disabled</div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-safe-area-bottom pt-4 pb-6 border-t border-border bg-background">
          {error && (<div className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</div>)}
          <Button onClick={handleSave} disabled={!title.trim() || isSaving} className="w-full h-12">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DayChips({ selected, onChange, disabled }: { selected: number[]; onChange: (days: number[]) => void; disabled?: boolean }) {
  const order = [1,2,3,4,5,6,0];
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const toggle = (uiIndex: number) => {
    if (disabled) return;
    const real = order[uiIndex];
    const set = new Set(selected);
    if (set.has(real)) set.delete(real); else set.add(real);
    onChange(Array.from(set).sort((a,b)=>a-b));
  };
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((lab, i) => {
        const real = order[i];
        const isOn = selected.includes(real);
        return (
          <button
            key={lab}
            type="button"
            onClick={() => toggle(i)}
            className={`px-3 py-2 rounded-full border text-sm transition ${isOn ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {lab}
          </button>
        );
      })}
    </div>
  );
}
