import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
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

  // Common emojis for habits
  const habitEmojis = [
    '🎯', '💧', '📚', '🏃', '🧘', '🍎', '💤', '📝', '🎵', '🌱',
    '⚡', '🔥', '💪', '🧠', '❤️', '🌟', '🎨', '🏠', '🚀', '🎪'
  ];

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setHabitName('');
      setEmoji('🎯');
      setFrequency('daily');
      setWeeklyDays([]);
      setEnableReminders(true);
      setReminderTimes(['09:00']);
      setError('');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-md w-[92vw] overflow-hidden">
        <div className="flex flex-col max-h-[85vh] bg-background">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
            <div className="px-6 pt-6 pb-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-center">
                  Add New Habit
                </DialogTitle>
              </DialogHeader>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="px-6 py-4 overflow-auto flex-1">
            <div className="space-y-6">
              {/* Habit Name */}
              <div className="space-y-2">
                <Label htmlFor="habit-name" className="text-sm font-medium">
                  Habit Name *
                </Label>
                <Input
                  id="habit-name"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="Enter habit name..."
                  maxLength={40}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {habitName.length}/40 characters
                </p>
              </div>

              {/* Emoji Picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Icon</Label>
                <div className="grid grid-cols-10 gap-2">
                  {habitEmojis.map((emojiOption) => (
                    <button
                      key={emojiOption}
                      onClick={() => setEmoji(emojiOption)}
                      className={`
                        w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg
                        transition-all duration-200 hover:scale-110
                        ${emoji === emojiOption 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
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
                <Label className="text-sm font-medium">Frequency</Label>
                <Select value={frequency} onValueChange={(value: 'daily' | 'weekly') => setFrequency(value)}>
                  <SelectTrigger className="w-full">
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Which days of the week?</Label>
                  <DayChips selected={weeklyDays} onChange={setWeeklyDays} />
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      Select the days when you want to practice this habit.
                    </p>
                  </div>
                </div>
              )}

              {/* Reminders */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Enable Reminders</Label>
                  <Switch
                    checked={enableReminders}
                    onCheckedChange={setEnableReminders}
                  />
                </div>
                
                {enableReminders && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Reminder Times</Label>
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
                            className="flex-1"
                          />
                          {reminderTimes.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newTimes = reminderTimes.filter((_, i) => i !== index);
                                setReminderTimes(newTimes);
                              }}
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
                          className="w-full"
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
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border">
            <div className="px-6 py-4 space-y-3">
              <Button
                onClick={handleSave}
                disabled={isLoading || !habitName.trim() || (frequency === 'weekly' && weeklyDays.length === 0)}
                className="w-full h-12 text-base font-medium"
              >
                {isLoading ? 'Creating...' : 'Create Habit'}
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// DayChips component for weekday selection
function DayChips({ selected, onChange }: { selected: number[]; onChange: (days: number[]) => void }) {
  // Show Mon..Sun order in UI, map to 0-6 (Sun=0) internally
  const order = [1,2,3,4,5,6,0];
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  
  const toggle = (uiIndex: number) => {
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
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isOn 
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
