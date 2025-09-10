import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useAppShell } from '../components/AppShell';
import { useNotifications } from '../providers/notificationProvider';
import { NotificationPermissionBanner } from '../components/ReminderTimePicker';
import { getOnboardingSelected, getHabit, setOnboardingComplete } from '../lib/habits';
import { useHabitsStore } from '../store/HabitsStore';
import { Bell, BellOff, CheckCircle, AlertCircle, Plus, Clock } from 'lucide-react';

export function OnboardingReminder() {
  const { navigate, setIsOnboarded } = useAppShell();
  const { 
    requestPermission, 
    isPermissionGranted, 
    isLoading, 
    error,
    sendTestNotification,
    scheduleHabitReminder
  } = useNotifications();
  // Selected habit IDs from the previous step
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const store = useHabitsStore();
  
  const [enableReminders, setEnableReminders] = useState(true);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['09:00']);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
  const [customTime, setCustomTime] = useState('09:00');

  React.useEffect(() => {
    (async () => {
      try {
        const ids = await getOnboardingSelected();
        setSelectedIds(ids);
      } catch { setSelectedIds([]); }
    })();
  }, []);

  const handleFinish = async () => {
    try {
      // If reminders are enabled but permission not granted, request it
      let granted = isPermissionGranted;
      if (enableReminders && !granted) {
        const perm = await requestPermission();
        setHasRequestedPermission(true);
        granted = perm.granted;
      }

      // Default to 09:00 if none selected
      const timesToSave = enableReminders && selectedTimes.length === 0 ? ['09:00'] : selectedTimes;

      // Persist reminder preferences
      try {
        localStorage.setItem('notificationsEnabled', enableReminders ? 'true' : 'false');
        localStorage.setItem('reminderTimes', JSON.stringify(timesToSave));
      } catch {}

      // Persist to each selected habit via store (emits events + reschedules)
      for (const id of selectedIds) {
        if (enableReminders) {
          await store.editHabit({ id, reminderTimes: timesToSave });
        } else {
          await store.editHabit({ id, reminderTimes: [] });
        }
      }

      if (enableReminders && granted) {
        await sendTestNotification('🎉 Notifications Ready!', `You\'ll receive ${timesToSave.length} daily reminder${timesToSave.length>1?'s':''}.`);
      }

      await setOnboardingComplete();
      setIsOnboarded(true);
      navigate('/home');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      // Still proceed even if notification setup fails
      await setOnboardingComplete();
      setIsOnboarded(true);
      navigate('/home');
    }
  };

  const handleRequestPermission = async () => {
    try {
      await requestPermission();
      setHasRequestedPermission(true);
      
      // Send test notification
      if (isPermissionGranted) {
        await sendTestNotification(
          '🔔 Notifications Enabled!',
          'You\'ll now receive gentle reminders for your habits.'
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const timeSlots = [
    { value: '07:00', label: '7:00 AM', description: 'Early morning' },
    { value: '09:00', label: '9:00 AM', description: 'Morning' },
    { value: '12:00', label: '12:00 PM', description: 'Lunch time' },
    { value: '18:00', label: '6:00 PM', description: 'Evening' },
    { value: '21:00', label: '9:00 PM', description: 'Night' },
  ];

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const addCustomTime = () => {
    if (!customTime) return;
    if (!selectedTimes.includes(customTime)) {
      setSelectedTimes((prev) => [...prev, customTime].sort());
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Content */}
      <div className="flex-1 p-6 pt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-4">Set your reminder time</h1>
          <p className="text-muted-foreground">
            Choose when you'd like to be reminded about your habits each day.
          </p>
        </div>

        {/* Enable/Disable Reminders */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3">
              {enableReminders ? (
                <Bell size={24} className="text-primary" />
              ) : (
                <BellOff size={24} className="text-muted-foreground" />
              )}
              <div>
                <h3 className="font-medium">Enable daily reminders</h3>
                <p className="text-sm text-muted-foreground">
                  Get gentle notifications to stay on track
                </p>
              </div>
            </div>
            <Switch
              checked={enableReminders}
              onCheckedChange={setEnableReminders}
            />
          </div>
        </div>

        {/* Permission Banner */}
        {enableReminders && !isPermissionGranted && (
          <div className="mb-6">
            <NotificationPermissionBanner
              onRequestPermission={handleRequestPermission}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Time Selection (multiple) */}
        {enableReminders && (
          <div className="space-y-4 mb-8">
            <Label className="text-base font-medium">Select reminder times</Label>
            <div className="grid gap-3">
              {timeSlots.map((slot) => {
                const isSelected = selectedTimes.includes(slot.value);
                return (
                  <button
                    key={slot.value}
                    onClick={() => toggleTime(slot.value)}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="text-left">
                      <span className="font-medium block">{slot.label}</span>
                      <span className="text-sm text-muted-foreground">{slot.description}</span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom time */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-card">
                <Clock size={18} className="text-muted-foreground" />
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="bg-transparent outline-none"
                />
              </div>
              <Button variant="outline" onClick={addCustomTime}>
                <Plus size={16} className="mr-2" /> Add time
              </Button>
            </div>

            {selectedTimes.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-medium mb-3">Selected times</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTimes.sort().map((t) => (
                    <span key={t} className="text-sm px-2 py-1 rounded bg-muted">
                      {formatTime(t)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="bg-card border border-border rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔔</span>
            <h3 className="font-medium">Reminder summary</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            {enableReminders ? (
              selectedTimes.length > 0 ? (
                <>You'll receive reminders at <strong>{selectedTimes.map(formatTime).join(', ')}</strong> daily.</>
              ) : (
                <>No time selected. We'll default to <strong>9:00 AM</strong>.</>
              )
            ) : (
              <>Notifications are disabled. You can enable them anytime in settings.</>
            )}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
              <h3 className="font-medium text-red-900 dark:text-red-100">Setup Error</h3>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success State */}
        {enableReminders && isPermissionGranted && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
              <h3 className="font-medium text-green-900 dark:text-green-100">Notifications Ready!</h3>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200">
              You'll receive reminders at {selectedTimes.length > 0 ? selectedTimes.map(formatTime).join(', ') : '9:00 AM'} daily.
            </p>
          </div>
        )}

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🎉</span>
            <h3 className="font-medium text-primary">Almost ready!</h3>
          </div>
          <p className="text-primary/80 text-sm">
            You're all set to start building amazing habits. Let's begin your journey!
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
        <Button
          onClick={handleFinish}
          disabled={isLoading}
          className="w-full h-12"
        >
          {isLoading ? 'Setting up...' : 'Finish Setup'}
        </Button>
      </div>
    </div>
  );
}
