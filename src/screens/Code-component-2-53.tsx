import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';

const emojiOptions = [
  '💧', '🚶', '📚', '🧘', '💪', '📝', '🥗', '📞',
  '🏃', '🎵', '🖼️', '🌱', '☕', '💤', '🧼', '🏠',
  '🎯', '💡', '🎨', '🍎', '🧽', '📱', '🕯️', '🌟'
];

export function AddHabit() {
  const { navigate } = useAppShell();
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [frequency, setFrequency] = useState('daily');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  const handleSave = () => {
    if (!title.trim()) return;

    // This will be connected to the habit store
    console.log('Save habit:', { title, emoji, frequency, hasReminder, reminderTime });
    navigate('/home');
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

          {/* Reminder Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Set reminder</Label>
              <p className="text-sm text-muted-foreground">
                Get notified to complete your habit
              </p>
            </div>
            <Switch
              checked={hasReminder}
              onCheckedChange={setHasReminder}
            />
          </div>

          {/* Reminder Time */}
          {hasReminder && (
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Reminder time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="h-12"
              />
            </div>
          )}

          {/* Preview */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">Preview</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="font-medium">{title || 'Your habit name'}</p>
                <p className="text-sm text-muted-foreground">
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  {hasReminder && ` • Reminder at ${reminderTime}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={!title.trim()}
          className="w-full h-12"
        >
          Save Habit
        </Button>
      </div>
    </div>
  );
}