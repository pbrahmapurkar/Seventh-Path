import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';
import { useNotifications } from '../providers/notificationProvider';
import { createHabit } from '../lib/habits';
import { useHabitsStore } from '../store/HabitsStore';
import { MultiTimePicker } from '../components/MultiTimePicker';
import { Bell, BellOff } from 'lucide-react';

const emojiOptions = [
  '💧', '🚶', '📚', '🧘', '💪', '📝', '🥗', '📞',
  '🏃', '🎵', '🖼️', '🌱', '☕', '💤', '🧼', '🏠',
  '🎯', '💡', '🎨', '🍎', '🧽', '📱', '🕯️', '🌟'
];

export function AddHabit() {
  const { navigate, registerBackHandler, handleBack } = useAppShell();
  const { hydrateAll } = useHabitsStore();
  const { 
    scheduleHabitReminder, 
    isPermissionGranted, 
    isLoading: notificationLoading 
  } = useNotifications();
  
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00']);
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = Boolean(
    title.trim() ||
    (hasReminder && reminderTimes.length > 0 && !(reminderTimes.length === 1 && reminderTimes[0] === '08:00')) ||
    emoji !== '🎯' ||
    frequency !== 'daily'
  );

  React.useEffect(() => {
    const unregister = registerBackHandler(() => {
      if (isDirty && !isSaving) {
        const confirmLeave = window.confirm('Discard changes?');
        if (confirmLeave) {
          navigate('/home');
        }
        return true; // handled
      }
      return false; // let default
    });
    return unregister;
  }, [isDirty, isSaving, navigate, registerBackHandler]);

  const handleSave = async () => {
    if (!title.trim()) return;
    if (!emoji) return;
    if (hasReminder && reminderTimes.length === 0) return;

    setIsSaving(true);
    
    try {
      // Persist habit to Preferences
      const newHabit = await createHabit({
        name: title.trim(),
        emoji,
        frequency,
        reminderTimes: hasReminder ? reminderTimes : [],
      });
      
      // Schedule notification if enabled and permission granted
      if (hasReminder && isPermissionGranted) {
        try {
          for (const t of reminderTimes) {
            await scheduleHabitReminder(
              newHabit.id,
              newHabit.name,
              emoji,
              t,
              'daily'
            );
          }
        } catch (error) {
          console.error('Failed to schedule reminder:', error);
          // Don't block habit creation if notification fails
        }
      }
      
      // Refresh in-memory store so Home reflects immediately
      try { await hydrateAll(); } catch {}

      try {
        // Simple confirmation toast/snackbar
        // Replace with your toast system if available
        // eslint-disable-next-line no-alert
        alert('Habit added successfully 🎉');
      } catch {}

      navigate('/home');
    } catch (error) {
      console.error('Error saving habit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReminderToggle = (enabled: boolean) => {
    setHasReminder(enabled);
    if (!enabled) setReminderTimes([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar
        title="Add Habit"
        showBack
        onBack={async () => {
          if (isDirty && !isSaving) {
            const ok = window.confirm('Discard changes?');
            if (!ok) return;
          }
          navigate('/home');
        }}
      />

      <div className="flex-1 p-6 pb-40">
        <div className="space-y-6">
          {/* Habit Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Habit name</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g. Drink water, Read for 20 minutes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Emoji Picker */}
          <div className="space-y-2">
            <Label>Choose an emoji</Label>
            <div className="grid grid-cols-8 gap-2 p-4 bg-card border border-border rounded-lg">
              {emojiOptions.map((emojiOption) => (
                <button
                  key={emojiOption}
                  onClick={() => setEmoji(emojiOption)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    emoji === emojiOption
                      ? 'bg-primary text-white'
                      : 'hover:bg-muted'
                  }`}
                >
                  {emojiOption}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
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

          {/* Reminder Settings: multiple times */}
          <MultiTimePicker
            enabled={hasReminder}
            onEnabledChange={handleReminderToggle}
            times={reminderTimes}
            onChange={setReminderTimes}
            defaultTime="08:00"
            disabled={isSaving || notificationLoading}
          />

          {/* Permission Warning */}
          {hasReminder && !isPermissionGranted && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={16} className="text-amber-600 dark:text-amber-400" />
                <h3 className="font-medium text-amber-900 dark:text-amber-100">Notifications Disabled</h3>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Enable notifications in settings to receive habit reminders.
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Preview</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{emoji}</span>
              <div className="flex-1">
                <p className="font-medium">{title || 'Your habit name'}</p>
                <p className="text-sm text-muted-foreground">
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  {hasReminder && reminderTimes.length > 0 && (
                    <>
                      {' • '}
                      Daily reminders at {reminderTimes.join(', ')}
                    </>
                  )}
                </p>
              </div>
              {hasReminder ? (
                <Bell size={20} className="text-green-600 dark:text-green-400" />
              ) : (
                <BellOff size={20} className="text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Save Button above bottom nav */}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-24 w-full max-w-md px-6">
        <Button
          onClick={handleSave}
          disabled={!title.trim() || isSaving || notificationLoading}
          className="w-full h-12 rounded-full"
        >
          {isSaving ? 'Saving...' : 'Save Habit'}
        </Button>
      </div>
    </div>
  );
}
