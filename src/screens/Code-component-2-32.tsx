import React from 'react';
import { Button } from '../components/ui/button';
import { useAppShell } from '../components/AppShell';

export function OnboardingMain() {
  const { navigate } = useAppShell();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Progress Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div className="flex gap-2">
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-muted rounded-full" />
          <div className="w-8 h-1 bg-muted rounded-full" />
        </div>
        <span className="text-sm text-muted-foreground">1 of 3</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-8">
          <span className="text-6xl">🎯</span>
        </div>
        
        <h1 className="text-3xl font-medium mb-4">Welcome to HabitFlow</h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-sm">
          Transform your life with small, consistent habits. Track your progress and stay motivated every day.
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
          <div className="flex flex-col items-center p-4 bg-card border border-border rounded-lg">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm text-center">Track Progress</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-card border border-border rounded-lg">
            <span className="text-2xl mb-2">🔔</span>
            <span className="text-sm text-center">Smart Reminders</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-card border border-border rounded-lg">
            <span className="text-2xl mb-2">🏆</span>
            <span className="text-sm text-center">Build Streaks</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-card border border-border rounded-lg">
            <span className="text-2xl mb-2">💫</span>
            <span className="text-sm text-center">Stay Motivated</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
        <Button
          onClick={() => navigate('/onboarding/name')}
          className="w-full h-12"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}