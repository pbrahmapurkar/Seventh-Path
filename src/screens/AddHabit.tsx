import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';
import { useNotifications } from '../providers/notificationProvider';
import { useHabitStore } from '../lib/habitStore';
import { ReminderTimePicker } from '../components/ReminderTimePicker';
import { Bell, BellOff } from 'lucide-react';

const emojiOptions = [
  '💧', '🚶', '📚', '🧘', '💪', '📝', '🥗', '📞',
  '🏃', '🎵', '🖼️', '🌱', '☕', '💤', '🧼', '🏠',
  '🎯', '💡', '🎨', '🍎', '🧽', '📱', '🕯️', '🌟'
];

export function AddHabit() {
  const { navigate } = useAppShell();
  const { addHabit } = useHabitStore();
  const { 
    scheduleHabitReminder, 
    isPermissionGranted, 
    isLoading: notificationLoading 
  } = useNotifications();
  
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly'>('daily');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    
    try {
      // Add habit to store
      const habitData = {
        title: title.trim(),
        emoji,
        frequency,
        reminderTime: hasReminder ? reminderTime : undefined,
      };
      
      addHabit(habitData);
      
      // Schedule notification if enabled and permission granted
      if (hasReminder && isPermissionGranted) {
        try {
          await scheduleHabitReminder(
            Date.now().toString(), // This would be the actual habit ID from the store
            title.trim(),
            emoji,
            reminderTime,
            reminderFrequency,
            reminderFrequency === 'weekly' ? weekdays : undefined
          );
        } catch (error) {
          console.error('Failed to schedule reminder:', error);
          // Don't block habit creation if notification fails
        }
      }
      
      navigate('/home');
    } catch (error) {
      console.error('Error saving habit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReminderToggle = (enabled: boolean) => {
    setHasReminder(enabled);
    if (!enabled) {
      setReminderTime('09:00');
      setReminderFrequency('daily');
      setWeekdays([]);
    }
  };

  const handleReminderTimeChange = (time: string | null) => {
    if (time) {
      setReminderTime(time);
    }
  };

  const handleReminderFrequencyChange = (freq: 'daily' | 'weekly') => {
    setReminderFrequency(freq);
    if (freq === 'daily') {
      setWeekdays([]);
    }
  };

  const handleWeekdaysChange = (days: number[]) => {
    setWeekdays(days);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar
        title="Add Habit"
        showBack
        onBack={() => navigate('/home')}
      />

      <div className="flex-1 p-6">
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

          {/* Reminder Settings */}
          <ReminderTimePicker
            value={hasReminder ? reminderTime : null}
            onChange={handleReminderTimeChange}
            frequency={reminderFrequency}
            onFrequencyChange={handleReminderFrequencyChange}
            weekdays={weekdays}
            onWeekdaysChange={handleWeekdaysChange}
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
                  {hasReminder && reminderTime && (
                    <>
                      {' • '}
                      {reminderFrequency === 'daily' ? 'Daily' : 'Weekly'} reminder at {reminderTime}
                      {reminderFrequency === 'weekly' && weekdays.length > 0 && (
                        <span className="ml-1">
                          ({weekdays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')})
                        </span>
                      )}
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

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={!title.trim() || isSaving || notificationLoading}
          className="w-full h-12"
        >
          {isSaving ? 'Saving...' : 'Save Habit'}
        </Button>
      </div>
    </div>
  );
}