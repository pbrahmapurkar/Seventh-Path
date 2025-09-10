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
  const { navigate, registerBackHandler } = useAppShell();
  const store = useHabitsStore();
  const habit = store.habitsById[habitId];

  const [title, setTitle] = useState(habit?.name || '');
  const [emoji, setEmoji] = useState(habit?.emoji || '🎯');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>(habit?.frequency || 'daily');
  const [hasReminder, setHasReminder] = useState(Boolean(habit?.reminderTimes?.length));
  const [reminderTimes, setReminderTimes] = useState<string[]>(habit?.reminderTimes || ['08:00']);
  const [isSaving, setIsSaving] = useState(false);
  const { updateHabitReminder, cancelHabitReminders, isPermissionGranted } = useNotifications();

  if (!habit) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <AppBar title="Edit Habit" showBack onBack={() => navigate('/home')} />
        <div className="p-6">Habit not found.</div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      // Persist via global store; this emits habit:updated and reschedules
      await store.editHabit({
        id: habit.id,
        name: title.trim(),
        emoji,
        frequency,
        reminderTimes: hasReminder ? reminderTimes : [],
      });

      // Best-effort: update native notifications on platforms using LocalNotifications
      try {
        await cancelHabitReminders(habit.id);
        if (hasReminder && reminderTimes.length && isPermissionGranted) {
          for (const t of reminderTimes) {
            await updateHabitReminder(habit.id, title.trim(), emoji, t, 'daily');
          }
        }
      } catch (e) {
        console.warn('Notification update failed', e);
      }
      navigate(`/habit/${habit.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReminderToggle = (enabled: boolean) => {
    setHasReminder(enabled);
    if (!enabled) setReminderTimes([]);
  };

  const initial = React.useMemo(() => ({
    name: habit?.name || '',
    emoji: habit?.emoji || '🎯',
    frequency: habit?.frequency || 'daily',
    times: habit?.reminderTimes || [],
  }), [habit]);

  const isDirty = (
    initial.name !== title.trim() ||
    initial.emoji !== emoji ||
    initial.frequency !== frequency ||
    JSON.stringify(initial.times) !== JSON.stringify(reminderTimes)
  );

  React.useEffect(() => {
    const unregister = registerBackHandler(() => {
      if (isDirty && !isSaving) {
        const confirmLeave = window.confirm('Discard changes?');
        if (confirmLeave) {
          navigate(`/habit/${habit?.id}`);
        }
        return true;
      }
      return false;
    });
    return unregister;
  }, [isDirty, isSaving, navigate, habit?.id, registerBackHandler]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar title="Edit Habit" showBack onBack={() => {
        if (isDirty && !isSaving) {
          const ok = window.confirm('Discard changes?');
          if (!ok) return;
        }
        navigate(`/habit/${habit.id}`);
      }} />

      <div className="flex-1 p-6">
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

          <MultiTimePicker
            enabled={hasReminder}
            onEnabledChange={handleReminderToggle}
            times={reminderTimes}
            onChange={setReminderTimes}
            defaultTime="08:00"
            disabled={isSaving}
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

      <div className="p-6 border-t border-border">
        <Button onClick={handleSave} disabled={!title.trim() || isSaving} className="w-full h-12">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
