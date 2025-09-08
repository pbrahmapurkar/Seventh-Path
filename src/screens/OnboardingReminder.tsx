import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { useAppShell } from '../components/AppShell';
import { useNotifications } from '../providers/notificationProvider';
import { ReminderTimePicker, NotificationPermissionBanner } from '../components/ReminderTimePicker';
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react';

export function OnboardingReminder() {
  const { navigate, setIsOnboarded } = useAppShell();
  const { 
    requestPermission, 
    isPermissionGranted, 
    isLoading, 
    error,
    sendTestNotification 
  } = useNotifications();
  
  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  const handleFinish = async () => {
    try {
      // If reminders are enabled but permission not granted, request it
      if (enableReminders && !isPermissionGranted && !hasRequestedPermission) {
        await requestPermission();
        setHasRequestedPermission(true);
        
        // Send a test notification to confirm it works
        if (isPermissionGranted) {
          await sendTestNotification(
            '🎉 Welcome to Seventh Path!',
            'Your habit reminders are now set up. Time to start your journey!'
          );
        }
      }
      
      setIsOnboarded(true);
      navigate('/home');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      // Still proceed even if notification setup fails
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

  const selectedTimeSlot = timeSlots.find(s => s.value === reminderTime);

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

        {/* Time Selection */}
        {enableReminders && (
          <div className="space-y-4 mb-8">
            <Label className="text-base font-medium">Reminder time</Label>
            <div className="grid gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => setReminderTime(slot.value)}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    reminderTime === slot.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/50'
                  }`}
                >
                  <div className="text-left">
                    <span className="font-medium block">{slot.label}</span>
                    <span className="text-sm text-muted-foreground">{slot.description}</span>
                  </div>
                  {reminderTime === slot.value && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
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
              <>
                You'll receive a gentle reminder at <strong>{selectedTimeSlot?.label}</strong> 
                each day to check in with your habits. You can change this anytime in settings.
              </>
            ) : (
              <>
                Reminders are disabled. You can enable them later in settings if you change your mind.
              </>
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
              You'll receive reminders at {selectedTimeSlot?.label} daily.
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