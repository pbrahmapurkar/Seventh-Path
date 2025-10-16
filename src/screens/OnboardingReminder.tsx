import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useAppShell } from '../components/AppShell';
import { useNotifications } from '../providers/notificationProvider';
import { NotificationPermissionBanner } from '../components/ReminderTimePicker';
import { getOnboardingSelected, setOnboardingComplete } from '../lib/habits';
import { useHabitsStore } from '../store/HabitsStore';
import { Bell, BellOff, CheckCircle, AlertCircle, Plus, Clock, ArrowRight, Sparkles, Zap } from 'lucide-react';
import '../styles/onboarding.css';

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
  const [finishing, setFinishing] = useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const ids = await getOnboardingSelected();
        setSelectedIds(ids);
      } catch { setSelectedIds([]); }
    })();
  }, []);

  const handleFinish = async () => {
    setFinishing(true);
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
    } finally { setFinishing(false); }
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
    <div
      className="onboarding-intro bg-background min-h-screen w-full flex flex-col"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Progress Header */}
      <div className="intro-header flex-shrink-0">
        <div className="intro-progress-bars" aria-hidden="true">
          <span className="bar bar-active" />
          <span className="bar bar-active" />
          <span className="bar bar-active" />
          <span className="bar bar-active" />
        </div>
        <span className="intro-step text-muted-foreground">4 of 4</span>
      </div>
      {/* Content */}
      <div className="intro-scroll flex-1 overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 motion-scale-in">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4 motion-fade-up" style={{ animationDelay: '60ms' }}>
              Set your reminder time
            </h1>
            <p className="text-muted-foreground text-lg motion-fade-up" style={{ animationDelay: '120ms' }}>
              Choose when you'd like to be reminded about your habits each day.
            </p>
          </div>

          {/* Enable/Disable Reminders */}
          <div className="mb-8">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-card to-card/50 border border-border rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    enableReminders ? 'bg-primary/20' : 'bg-muted/50'
                  }`}
                >
                  {enableReminders ? (
                    <Bell className="w-6 h-6 text-primary" />
                  ) : (
                    <BellOff className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Enable daily reminders</h3>
                  <p className="text-sm text-muted-foreground">Get gentle notifications to stay on track</p>
                </div>
              </div>
              <Switch checked={enableReminders} onCheckedChange={setEnableReminders} className="scale-110" />
            </div>
          </div>

        {/* Permission Banner */}
        {enableReminders && !isPermissionGranted && (
          <div className="mb-8">
            <NotificationPermissionBanner
              onRequestPermission={handleRequestPermission}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Time Selection (multiple) */}
        {enableReminders && (
          <div className="space-y-6 mb-8">
            <div className="text-center">
              <Label className="text-lg font-semibold">Select reminder times</Label>
              <p className="text-sm text-muted-foreground mt-2">Choose the best times for your daily habits</p>
            </div>
            <div className="grid gap-4">
              {timeSlots.map((slot, index) => {
                const isSelected = selectedTimes.includes(slot.value);
                return (
                  <button
                    key={slot.value}
                    onClick={() => toggleTime(slot.value)}
                    className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected 
                        ? 'border-primary bg-primary/5 scale-105 shadow-lg' 
                        : 'border-border bg-card hover:bg-muted/50 hover:border-primary/50 hover:scale-102'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isSelected ? 'bg-primary/20' : 'bg-muted/50'
                      }`}>
                        <Clock className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold block text-lg">{slot.label}</span>
                        <span className="text-sm text-muted-foreground">{slot.description}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom time */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted/50 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">Add custom time</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-xl bg-background">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="bg-transparent outline-none text-sm"
                      />
                    </div>
                    <Button variant="outline" onClick={addCustomTime} size="sm">
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {selectedTimes.length > 0 && (
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Selected times</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTimes.sort().map((t) => (
                    <span key={t} className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {formatTime(t)}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-primary/80 mt-3">
                  You'll receive gentle reminders at these times daily.
                </p>
              </div>
            )}
          </div>
        )}

          {/* Summary */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Reminder summary</h3>
            </div>
            <p className="text-muted-foreground">
              {enableReminders ? (
                selectedTimes.length > 0 ? (
                  <>
                    You'll receive reminders at{' '}
                    <strong className="text-primary">{selectedTimes.map(formatTime).join(', ')}</strong> daily.
                  </>
                ) : (
                  <>
                    No time selected. We'll default to <strong className="text-primary">9:00 AM</strong>.
                  </>
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
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">Notifications Ready!</h3>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                You'll receive reminders at{' '}
                {selectedTimes.length > 0 ? selectedTimes.map(formatTime).join(', ') : '9:00 AM'} daily.
              </p>
            </div>
          )}

          {/* Final Motivation */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-2xl p-6 mb-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-xl text-primary">Almost ready!</h3>
            </div>
            <p className="text-primary/90 text-lg">
              You're all set to start building amazing habits. Let's begin your journey!
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="intro-footer pb-safe-area-bottom">
        <div className="px-6 pb-6 space-y-3">
          <Button onClick={handleFinish} disabled={finishing} className="w-full h-14 text-lg font-medium group rounded-2xl">
            {finishing ? 'Setting up...' : 'Finish Setup'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setEnableReminders(false);
              await handleFinish();
            }}
            disabled={finishing}
            className="w-full h-12 rounded-xl"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
