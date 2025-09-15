import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAppShell } from '../components/AppShell';
import { starterHabits } from '../lib/habitStore';
import { createHabit, makeHabitId, setOnboardingSelected } from '../lib/habits';
import { useHabitsStore } from '../store/HabitsStore';
import * as EventBus from '../lib/eventBus';
import { CheckCircle, ArrowRight, Target, Plus } from 'lucide-react';

export function OnboardingHabits() {
  const { navigate } = useAppShell();
  const { hydrateAll } = useHabitsStore();
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
      <div className="flex items-center justify-between px-6 py-4 pt-safe-area-top">
        <div className="flex gap-2">
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-muted rounded-full" />
        </div>
        <span className="text-sm text-muted-foreground">3 of 4</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Choose your starter habits</h1>
          <p className="text-muted-foreground text-lg">
            Select a few habits to get started. You can always add more later.
          </p>
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {starterHabits.map((habit, index) => (
            <button
              key={habit.title}
              onClick={() => toggleHabit(habit)}
              className={`group relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                isSelected(habit)
                  ? 'border-primary bg-primary/5 scale-105 shadow-lg'
                  : 'border-border bg-card hover:bg-muted/50 hover:border-primary/50 hover:scale-102'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Selection Indicator */}
              {isSelected(habit) && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Habit Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all ${
                isSelected(habit) ? 'bg-primary/20' : 'bg-muted/50'
              }`}>
                <span className="text-2xl">{habit.emoji}</span>
              </div>
              
              {/* Habit Title */}
              <span className="text-sm font-semibold text-center leading-tight">{habit.title}</span>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        {/* Selected Habits Summary */}
        {selectedHabits.length > 0 && (
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 mb-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Selected habits ({selectedHabits.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedHabits.map((habit) => (
                <Badge key={habit.title} variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                  {habit.emoji} {habit.title}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-primary/80 mt-3">
              Great choices! These habits will help you build a strong foundation.
            </p>
          </div>
        )}

        {/* Motivational Message */}
        {selectedHabits.length === 0 && (
          <div className="bg-muted/30 border border-border rounded-2xl p-6 mb-6 text-center">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Select habits that resonate with your goals. Start small, stay consistent!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-6 pt-0 pb-safe-area-bottom space-y-3">
        <Button
          onClick={async () => {
            // Persist selected habits in order and update in-memory store immediately
            const ids: string[] = [];
            const created: any[] = [];
            for (const h of selectedHabits) {
              const id = makeHabitId(h.title);
              ids.push(id);
              const habit = await createHabit({ id, name: h.title, emoji: h.emoji, frequency: 'daily', reminderTimes: [] });
              created.push(habit);
              EventBus.emit('habit:created', { habit });
            }
            await setOnboardingSelected(ids);
            try { await hydrateAll(); } catch {}
            navigate('/onboarding/reminder');
          }}
          disabled={selectedHabits.length === 0}
          className="w-full h-14 text-lg font-medium group"
        >
          Continue with {selectedHabits.length} habit{selectedHabits.length !== 1 ? 's' : ''}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/onboarding/reminder')}
          className="w-full h-12"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}
