import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAppShell } from '../components/AppShell';
import { starterHabits } from '../lib/habitStore';

export function OnboardingHabits() {
  const { navigate } = useAppShell();
  const [selectedHabits, setSelectedHabits] = useState<typeof starterHabits>([]);

  const toggleHabit = (habit: typeof starterHabits[0]) => {
    setSelectedHabits(prev => {
      const exists = prev.find(h => h.title === habit.title);
      if (exists) {
        return prev.filter(h => h.title !== habit.title);
      } else {
        return [...prev, habit];
      }
    });
  };

  const isSelected = (habit: typeof starterHabits[0]) => {
    return selectedHabits.some(h => h.title === habit.title);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Progress Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div className="flex gap-2">
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-primary rounded-full" />
        </div>
        <span className="text-sm text-muted-foreground">3 of 3</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-4">Choose your starter habits</h1>
          <p className="text-muted-foreground">
            Select a few habits to get started. You can always add more later.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {starterHabits.map((habit) => (
            <button
              key={habit.title}
              onClick={() => toggleHabit(habit)}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                isSelected(habit)
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:bg-muted/50'
              }`}
            >
              <span className="text-3xl mb-2">{habit.emoji}</span>
              <span className="text-sm font-medium text-center">{habit.title}</span>
              {isSelected(habit) && (
                <div className="mt-2">
                  <Badge variant="default" className="text-xs">Selected</Badge>
                </div>
              )}
            </button>
          ))}
        </div>

        {selectedHabits.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3">Selected habits ({selectedHabits.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selectedHabits.map((habit) => (
                <Badge key={habit.title} variant="secondary" className="text-sm">
                  {habit.emoji} {habit.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
        <Button
          onClick={() => navigate('/onboarding/reminder')}
          disabled={selectedHabits.length === 0}
          className="w-full h-12"
        >
          Continue ({selectedHabits.length} selected)
        </Button>
      </div>
    </div>
  );
}