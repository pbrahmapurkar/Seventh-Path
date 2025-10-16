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
import { TimerConfiguration } from '../components/Timer';
import type { TimerConfig } from '../types/timer';
import { Bell, BellOff, Plus, Target, Sparkles, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

const emojiOptions = [
  { emoji: '💧', label: 'Water' },
  { emoji: '🚶', label: 'Walk' },
  { emoji: '📚', label: 'Read' },
  { emoji: '🧘', label: 'Meditate' },
  { emoji: '💪', label: 'Exercise' },
  { emoji: '📝', label: 'Journal' },
  { emoji: '🥗', label: 'Eat Healthy' },
  { emoji: '📞', label: 'Call Family' },
  { emoji: '🏃', label: 'Run' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🖼️', label: 'Art' },
  { emoji: '🌱', label: 'Garden' },
  { emoji: '☕', label: 'Coffee' },
  { emoji: '💤', label: 'Sleep' },
  { emoji: '🧼', label: 'Clean' },
  { emoji: '🏠', label: 'Home' },
  { emoji: '🎯', label: 'Focus' },
  { emoji: '💡', label: 'Learn' },
  { emoji: '🎨', label: 'Create' },
  { emoji: '🍎', label: 'Fruit' },
  { emoji: '🧽', label: 'Organize' },
  { emoji: '📱', label: 'Digital' },
  { emoji: '🕯️', label: 'Relax' },
  { emoji: '🌟', label: 'Gratitude' }
];

export function AddHabit() {
  const { navigate } = useAppShell();
  const { addHabit } = useHabitsStore();
  const { 
    scheduleHabitReminder, 
    isPermissionGranted, 
    isLoading: notificationLoading,
    checkAndRequestPermission,
  } = useNotifications();
  
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00']);
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]); // 0-6 Sun-Sat
  const [timerConfig, setTimerConfig] = useState<TimerConfig>({
    enabled: false,
    mode: 'countdown',
    defaultDuration: 1800, // 30 minutes default
    autoCompleteHabit: true
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = Boolean(
    title.trim() ||
    (hasReminder && reminderTimes.length > 0 && !(reminderTimes.length === 1 && reminderTimes[0] === '08:00')) ||
    emoji !== '🎯' ||
    frequency !== 'daily' ||
    timerConfig.enabled
  );

  const handleSave = async () => {
    if (!title.trim()) return;
    if (!emoji) return;
    setError(null);
    
    // Validate weekly habits
    if (frequency === 'weekly' && weeklyDays.length === 0) {
      setError('Please select at least one day for weekly habits');
      return;
    }
    
    if (hasReminder) {
      if (reminderTimes.length === 0) { 
        setError('Please select at least one time'); 
        return; 
      }
    }

    setIsSaving(true);
    
    try {
      // Persist habit to Preferences
      const newHabit = await createHabit({
        name: title.trim(),
        emoji,
        frequency,
        reminderTimes: hasReminder ? reminderTimes : [],
        weeklyDays: frequency === 'weekly' ? weeklyDays : undefined,
        timerConfig: timerConfig.enabled ? timerConfig : undefined,
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
              frequency === 'weekly' ? 'weekly' : 'daily',
              frequency === 'weekly' ? weeklyDays : undefined
            );
          }
        } catch (error) {
          console.error('Failed to schedule reminder:', error);
          // Don't block habit creation if notification fails
        }
      }
      
      // Refresh in-memory store so Home reflects immediately
      await addHabit(newHabit);

      // Show success feedback
      console.log('Habit created successfully:', newHabit.name);
      console.log('Navigating to home page...');

      // Small delay to ensure all operations complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to home to see the new habit
      navigate('/home');
      console.log('Navigation called');
    } catch (error) {
      console.error('Error saving habit:', error);
      setError('Failed to create habit. Please try again.');
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

      {/* Enhanced Form Content */}
      <div className="flex-1 px-6 py-6 pt-20 pb-24 w-full overflow-y-auto">
        <div className="space-y-8 w-full">
          {/* Habit Title Section */}
          <div className="bg-gradient-to-r from-card to-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Habit Details</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-medium">What's your habit?</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. Drink 8 glasses of water, Read for 20 minutes, Take a 10-minute walk"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-14 text-lg border-2 focus:border-primary transition-colors"
                  autoFocus
                />
                <p className="text-sm text-muted-foreground">
                  Be specific! The more detailed, the easier it is to track.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Emoji Picker */}
          <div className="bg-gradient-to-r from-card to-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Choose an Icon</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pick an emoji that represents your habit. This will help you quickly identify it in your daily list.
              </p>
              
              <div className="grid grid-cols-6 gap-3">
                {emojiOptions.map((option, index) => (
                  <button
                    key={option.emoji}
                    onClick={() => setEmoji(option.emoji)}
                    className={`group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                      emoji === option.emoji
                        ? 'border-primary bg-primary/10 scale-105 shadow-lg'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50 hover:scale-102'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-2 transition-all ${
                      emoji === option.emoji ? 'bg-primary/20' : 'bg-muted/50'
                    }`}>
                      {option.emoji}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">{option.label}</span>
                    
                    {emoji === option.emoji && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Reminder Settings - Moved Above Schedule */}
          <MultiTimePicker
            enabled={hasReminder}
            onEnabledChange={handleReminderToggle}
            times={reminderTimes}
            onChange={setReminderTimes}
            defaultTime="08:00"
            disabled={isSaving || notificationLoading}
          />

          {/* Frequency & Schedule Section */}
          <div className="bg-gradient-to-r from-card to-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Schedule & Frequency</h2>
            </div>
            
            <div className="space-y-6">
              {/* Enhanced Frequency Selection */}
              <div className="space-y-2">
                <Label className="text-base font-medium">How often do you want to do this habit?</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className={`h-16 text-lg border-2 focus:border-primary transition-all duration-300 hover:border-primary/50 bg-background ${
                    frequency === 'daily' 
                      ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20' 
                      : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                        frequency === 'daily' 
                          ? 'bg-green-100 dark:bg-green-900/30 scale-105' 
                          : 'bg-blue-100 dark:bg-blue-900/30 scale-105'
                      }`}>
                        <span className="text-2xl">
                          {frequency === 'daily' ? '📅' : '🗓️'}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold text-lg ${
                          frequency === 'daily' 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-blue-700 dark:text-blue-300'
                        }`}>
                          {frequency === 'daily' ? 'Daily (Everyday)' : 'Weekly (Specific Days)'}
                        </div>
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border-2 border-border rounded-xl shadow-xl bg-background">
                    <SelectItem value="daily" className="text-lg py-4 px-4 hover:bg-green-50 dark:hover:bg-green-950/20 focus:bg-green-50 dark:focus:bg-green-950/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl">📅</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-green-700 dark:text-green-300">Daily (Everyday)</div>
                          <div className="text-sm text-muted-foreground">Perfect for building consistent daily routines</div>
                        </div>
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="weekly" className="text-lg py-4 px-4 hover:bg-blue-50 dark:hover:bg-blue-950/20 focus:bg-blue-50 dark:focus:bg-blue-950/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl">🗓️</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-blue-700 dark:text-blue-300">Weekly (Specific Days)</div>
                          <div className="text-sm text-muted-foreground">Great for habits that don't need to be done every day</div>
                        </div>
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-primary font-medium">
                      {frequency === 'daily' 
                        ? '💡 Daily habits are easier to stick to and build momentum faster'
                        : '💡 Weekly habits give you flexibility while still maintaining consistency'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Days Selection */}
              {frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">Which days of the week?</Label>
                  <DayChips selected={weeklyDays} onChange={setWeeklyDays} disabled={!hasReminder} />
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Select the days when you want to practice this habit. You can always adjust this later.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Permission Warning */}
          {hasReminder && !isPermissionGranted && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-amber-900 dark:text-amber-100">Notifications Disabled</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Enable notifications in settings to receive habit reminders.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Preview */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Preview</h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-all ${
                  hasReminder ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'
                }`}>
                  {emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {title || 'Your habit name'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {buildPreviewSummary(frequency, hasReminder ? weeklyDays : [], hasReminder ? reminderTimes : [])}
                  </p>
                  <div className="flex items-center gap-2">
                    {hasReminder ? (
                      <>
                        <Bell className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">Reminders enabled</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">No reminders</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Save Button - Positioned after Preview */}
        <div className="sticky bottom-0 left-0 right-0 z-50 mt-8">
          <div className="bg-gradient-to-r from-background to-background/95 backdrop-blur-sm border-t border-border pt-4 pb-6">
            <div className="px-6">
              <Button
                onClick={handleSave}
                disabled={!title.trim() || isSaving || notificationLoading}
                className="w-full h-14 text-lg font-semibold rounded-2xl group shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {isSaving ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating your habit...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create Habit</span>
                    <CheckCircle2 className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}
              </Button>
              
              {!title.trim() && (
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Enter a habit name to continue
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Enhanced Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border border-red-200 dark:border-red-800 rounded-2xl p-6 mt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-red-900 dark:text-red-100">Please fix the following:</h3>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers for weekly UI
function formatWeeklyDays(days: number[]): string {
  if (!days || days.length === 0) return '—';
  const order = [1,2,3,4,5,6,0];
  const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const selected = order
    .map((real, i) => ({ label: labels[i], real }))
    .filter(({ real }) => days.includes(real))
    .map(({ label }) => label)
    .join(', ');
  return selected;
}
function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = ((h % 12) || 12);
  return `${hr}:${String(m).padStart(2,'0')} ${ampm}`;
}
function formatTimeList(times: string[]): string {
  return times.map(formatTime).join(', ');
}
function buildPreviewSummary(
  frequency: 'daily' | 'weekly',
  weeklyDays: number[],
  times: string[]
): string {
  if (frequency === 'daily') {
    return times.length ? `Daily • Reminders at ${formatTimeList(times)}` : 'Daily';
  }
  if (weeklyDays.length === 7) {
    return times.length ? `Daily • Reminders at ${formatTimeList(times)}` : 'Daily';
  }
  const daysText = formatWeeklyDays(weeklyDays);
  return times.length ? `Weekly • ${daysText} • ${formatTimeList(times)}` : `Weekly • ${daysText}`;
}

function DayChips({ selected, onChange, disabled }: { selected: number[]; onChange: (days: number[]) => void; disabled?: boolean }) {
  // Show Mon..Sun order in UI, map to 0-6 (Sun=0) internally
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
    <div className="flex flex-wrap gap-3">
      {labels.map((lab, i) => {
        const real = order[i];
        const isOn = selected.includes(real);
        return (
          <button
            key={lab}
            type="button"
            onClick={() => toggle(i)}
            className={`group relative px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 ${
              isOn 
                ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' 
                : 'border-border text-foreground hover:border-primary/50 hover:bg-muted/50 hover:scale-102'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {lab}
            {isOn && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-3 h-3 text-primary" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
