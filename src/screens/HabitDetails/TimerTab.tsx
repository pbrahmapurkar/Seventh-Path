/**
 * Timer Tab for Habit Details
 * Shows active timer or start button, and past sessions
 */

import React, { useEffect, useState } from 'react';
import { Play, Timer as TimerIcon, Clock, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { TimerDisplay, TimerSessionList } from '../../components/Timer';
import { useTimerStore } from '../../store/TimerStore';
import type { HabitDef } from '../../lib/habits/types';
import { formatDuration, isTimerCompleted, calculateCurrentElapsed } from '../../utils/timerUtils';
import { useHabitsStore } from '../../store/HabitsStore';

interface TimerTabProps {
  habit: HabitDef;
  onHabitComplete?: () => void;
}

export function TimerTab({ habit, onHabitComplete }: TimerTabProps) {
  const { 
    activeTimers, 
    timerSessions,
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer,
    getTimerSessions,
    loadPersistedTimer 
  } = useTimerStore();
  
  const { markAllDone } = useHabitsStore();
  const activeTimer = activeTimers[habit.id];
  const sessions = getTimerSessions(habit.id);
  const [hasCheckedCompletion, setHasCheckedCompletion] = useState(false);

  // Load persisted timer on mount
  useEffect(() => {
    loadPersistedTimer(habit.id);
  }, [habit.id, loadPersistedTimer]);

  // Check for timer completion
  useEffect(() => {
    if (!activeTimer || hasCheckedCompletion) return;

    const interval = setInterval(() => {
      if (isTimerCompleted(activeTimer)) {
        setHasCheckedCompletion(true);
        handleTimerComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, hasCheckedCompletion]);

  const handleTimerComplete = async () => {
    if (!activeTimer) return;

    // Stop timer and mark as completed
    const session = stopTimer(habit.id, true);
    
    // Auto-complete habit if enabled
    if (habit.timerConfig?.autoCompleteHabit && session) {
      try {
        await markAllDone(habit.id);
        onHabitComplete?.();
      } catch (error) {
        console.error('Failed to auto-complete habit:', error);
      }
    }
  };

  const handleStart = () => {
    if (!habit.timerConfig) return;
    
    startTimer(
      habit.id,
      habit.timerConfig.mode,
      habit.timerConfig.mode === 'countdown' ? habit.timerConfig.defaultDuration : undefined
    );
    setHasCheckedCompletion(false);
  };

  const handlePause = () => {
    pauseTimer(habit.id);
  };

  const handleResume = () => {
    resumeTimer(habit.id);
  };

  const handleStop = () => {
    const completed = activeTimer && habit.timerConfig?.mode === 'countdown' 
      ? isTimerCompleted(activeTimer)
      : false;
    stopTimer(habit.id, completed);
    setHasCheckedCompletion(false);
  };

  // Timer not configured
  if (!habit.timerConfig || !habit.timerConfig.enabled) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <TimerIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Timer Not Enabled</h3>
        <p className="text-muted-foreground mb-6">
          Enable timer tracking when editing this habit to start timing your sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Timer or Start Button */}
      {activeTimer ? (
        <Card className="p-6">
          <TimerDisplay
            activeTimer={activeTimer}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            showControls
          />
          
          {habit.timerConfig.autoCompleteHabit && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              ✨ Habit will be marked complete when timer finishes
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Play className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to Start</h3>
          <p className="text-muted-foreground mb-6">
            {habit.timerConfig.mode === 'countdown'
              ? `Start a ${formatDuration(habit.timerConfig.defaultDuration || 0)} countdown timer`
              : 'Start tracking time with stopwatch mode'
            }
          </p>
          <Button size="lg" onClick={handleStart} className="min-w-[200px]">
            <Play className="w-5 h-5 mr-2" />
            Start Timer
          </Button>
        </Card>
      )}

      {/* Session Statistics */}
      {sessions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Session Statistics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center bg-muted/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-primary mb-1">
                {sessions.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center bg-muted/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-primary mb-1">
                {formatDuration(
                  sessions.reduce((sum, s) => sum + s.duration, 0)
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
          </div>
        </Card>
      )}

      {/* Session History */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Session History</h3>
        </div>
        
        <TimerSessionList sessions={sessions} limit={10} />
      </div>
    </div>
  );
}
