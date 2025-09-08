import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useAppShell } from '../components/AppShell';

export function OnboardingReminder() {
  const { navigate, setIsOnboarded } = useAppShell();
  const [reminderTime, setReminderTime] = useState('09:00');

  const handleFinish = () => {
    setIsOnboarded(true);
    navigate('/home');
  };

  const timeSlots = [
    { value: '07:00', label: '7:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '21:00', label: '9:00 PM' },
  ];

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

        <div className="space-y-4 mb-8">
          <Label>Reminder time</Label>
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
                <span className="font-medium">{slot.label}</span>
                {reminderTime === slot.value && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔔</span>
            <h3 className="font-medium">Daily reminder summary</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            You'll receive a gentle reminder at {timeSlots.find(s => s.value === reminderTime)?.label} 
            each day to check in with your habits. You can change this anytime in settings.
          </p>
        </div>

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
          className="w-full h-12"
        >
          Finish Setup
        </Button>
      </div>
    </div>
  );
}