import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useHabitsStore } from '../store/HabitsStore';
import { useAppShell } from './AppShell';
import { createHabit } from '../lib/habits';
import { useNotifications } from '../providers/notificationProvider';

interface AddHabitBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddHabitBottomSheet({ isOpen, onClose }: AddHabitBottomSheetProps) {
  const { addHabit } = useHabitsStore();
  const { navigate } = useAppShell();
  const { scheduleHabitReminder, isPermissionGranted } = useNotifications();

  const [habitName, setHabitName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderTimes, setReminderTimes] = useState<string[]>(['09:00']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Common emojis for habits
  const habitEmojis = [
    '🎯', '💧', '📚', '🏃', '🧘', '🍎', '💤', '📝', '🎵', '🌱',
    '⚡', '🔥', '💪', '🧠', '❤️', '🌟', '🎨', '🏠', '🚀', '🎪'
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setHabitName('');
      setEmoji('🎯');
      setFrequency('daily');
      setWeeklyDays([]);
      setEnableReminders(true);
      setReminderTimes(['09:00']);
      setError('');
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!habitName.trim()) {
      setError('Habit name is required');
      return;
    }

    if (habitName.length > 40) {
      setError('Habit name must be 40 characters or less');
      return;
    }

    if (frequency === 'weekly' && weeklyDays.length === 0) {
      setError('Please select at least one day for weekly habits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Persist habit to Preferences
      const newHabit = await createHabit({
        name: habitName.trim(),
        emoji,
        frequency,
        reminderTimes: enableReminders ? reminderTimes : [],
        weeklyDays: frequency === 'weekly' ? weeklyDays : undefined,
      });

      // Schedule notification if enabled and permission granted
      if (enableReminders && isPermissionGranted) {
        try {
          for (const t of reminderTimes) {
            await scheduleHabitReminder(
              newHabit.id,
              newHabit.name,
              emoji,
              t,
              frequency === 'weekly' ? 'weekly' : 'daily',
              frequency === 'weekly' ? weeklyDays : undefined
            );
          }
        } catch (error) {
          console.error('Failed to schedule reminder:', error);
          // Don't block habit creation if notification fails
        }
      }

      // Add habit to store immediately for instant UI update
      await addHabit(newHabit);

      // Show success feedback
      console.log('Habit created successfully:', newHabit.name);

      // Close the modal first
      onClose();

      // Small delay to ensure modal closes before navigation
      setTimeout(() => {
        // Navigate to home to see the new habit
        navigate('/home');
      }, 100);
    } catch (err) {
      setError('Failed to create habit. Please try again.');
      console.error('Error creating habit:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`sp-modal-backdrop ${isOpen ? 'sp-modal-backdrop--visible' : ''}`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`sp-bottom-sheet w-full max-w-md mx-auto h-[85vh] flex flex-col ${isOpen ? 'sp-bottom-sheet--visible' : ''
          }`}
      >
        {/* Handle */}
        <div className="sp-bottom-sheet__handle" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add New Habit</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-24">
          <div className="space-y-6">
            {/* Habit Name */}
            <div className="space-y-2">
              <Label htmlFor="habit-name" className="text-sm font-medium text-slate-300">
                Habit Name *
              </Label>
              <Input
                id="habit-name"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Enter habit name..."
                maxLength={40}
                className="w-full bg-[#0A0E14] border-slate-800 focus:border-emerald-500/50"
              />
              <p className="text-xs text-slate-500 text-right">
                {habitName.length}/40
              </p>
            </div>

            {/* Emoji Picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Icon</Label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {habitEmojis.map((emojiOption) => (
                  <button
                    key={emojiOption}
                    onClick={() => setEmoji(emojiOption)}
                    className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-xl
                        transition-all duration-200
                        ${emoji === emojiOption
                        ? 'bg-emerald-500/20 border border-emerald-500/50 scale-110'
                        : 'bg-[#0A0E14] border border-slate-800 hover:border-slate-600'
                      }
                      `}
                  >
                    {emojiOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Frequency</Label>
              <Select value={frequency} onValueChange={(value: 'daily' | 'weekly') => setFrequency(value)}>
                <SelectTrigger className="w-full bg-[#0A0E14] border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (Everyday)</SelectItem>
                  <SelectItem value="weekly">Weekly (Specific Days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weekly Days Selection */}
            {frequency === 'weekly' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-300">Which days?</Label>
                <DayChips selected={weeklyDays} onChange={setWeeklyDays} />
              </div>
            )}

            {/* Reminders */}
            <div className="space-y-4 pt-2 border-t border-slate-800/50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-300">Enable Reminders</Label>
                <Switch
                  checked={enableReminders}
                  onCheckedChange={setEnableReminders}
                />
              </div>

              {enableReminders && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-sm font-medium text-slate-300">Reminder Times</Label>
                  <div className="space-y-2">
                    {reminderTimes.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => {
                            const newTimes = [...reminderTimes];
                            newTimes[index] = e.target.value;
                            setReminderTimes(newTimes);
                          }}
                          className="flex-1 bg-[#0A0E14] border-slate-800"
                        />
                        {reminderTimes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newTimes = reminderTimes.filter((_, i) => i !== index);
                              setReminderTimes(newTimes);
                            }}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {reminderTimes.length < 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReminderTimes([...reminderTimes, '09:00'])}
                        className="w-full border-dashed border-slate-700 hover:border-emerald-500/50 hover:text-emerald-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reminder Time
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#151C24] border-t border-slate-800/50">
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleSave}
              disabled={isLoading || !habitName.trim() || (frequency === 'weekly' && weeklyDays.length === 0)}
              className="w-full h-[52px] bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-base font-medium"
            >
              {isLoading ? 'Creating...' : 'Create Habit'}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full h-[48px] text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// DayChips component for weekday selection
function DayChips({ selected, onChange }: { selected: number[]; onChange: (days: number[]) => void }) {
  // Show Mon..Sun order in UI, map to 0-6 (Sun=0) internally
  const order = [1, 2, 3, 4, 5, 6, 0];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggle = (uiIndex: number) => {
    const real = order[uiIndex];
    const set = new Set(selected);
    if (set.has(real)) set.delete(real); else set.add(real);
    onChange(Array.from(set).sort((a, b) => a - b));
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
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isOn
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            aria-label={`${lab === 'Mon' ? 'Monday' : lab === 'Tue' ? 'Tuesday' : lab === 'Wed' ? 'Wednesday' : lab === 'Thu' ? 'Thursday' : lab === 'Fri' ? 'Friday' : lab === 'Sat' ? 'Saturday' : 'Sunday'}`}
          >
            {lab}
          </button>
        );
      })}
    </div>
  );
}
