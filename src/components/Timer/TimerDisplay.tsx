/**
 * Timer Display Component with Circular Progress
 */

import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { ActiveTimer } from '../../types/timer';
import {
  formatTime,
  calculateRemainingTime,
  calculateCurrentElapsed,
  getTimerProgress,
  isTimerCompleted
} from '../../utils/timerUtils';

interface TimerDisplayProps {
  activeTimer: ActiveTimer;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  showControls?: boolean;
}

export function TimerDisplay({
  activeTimer,
  onStart,
  onPause,
  onResume,
  onStop,
  showControls = true
}: TimerDisplayProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeTimer.isPaused) {
        if (activeTimer.mode === 'countdown') {
          const remaining = calculateRemainingTime(activeTimer);
          setCurrentTime(remaining);
          setIsCompleted(isTimerCompleted(activeTimer));
        } else {
          const elapsed = calculateCurrentElapsed(activeTimer);
          setCurrentTime(elapsed);
        }
      }
    }, 100); // Update every 100ms for smooth display

    return () => clearInterval(interval);
  }, [activeTimer]);

  const progress = getTimerProgress(activeTimer);
  const displayTime = formatTime(currentTime);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = activeTimer.mode === 'countdown'
    ? circumference - (progress / 100) * circumference
    : 0;

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Circular Timer Display */}
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          
          {/* Progress circle */}
          {activeTimer.mode === 'countdown' && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={isCompleted ? 'text-green-500' : 'text-primary'}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: 'stroke-dashoffset 0.1s linear'
              }}
            />
          )}
          
          {/* Stopwatch pulse ring */}
          {activeTimer.mode === 'stopwatch' && !activeTimer.isPaused && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-primary animate-pulse"
            />
          )}
        </svg>
        
        {/* Time Display in Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-foreground font-mono">
            {displayTime}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {activeTimer.mode === 'countdown' ? 'remaining' : 'elapsed'}
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2">
        <Badge variant={activeTimer.isPaused ? 'secondary' : 'default'}>
          {activeTimer.isPaused ? 'Paused' : 'Running'}
        </Badge>
        <Badge variant="outline">
          <Clock className="w-3 h-3 mr-1" />
          {activeTimer.mode === 'countdown' ? 'Countdown' : 'Stopwatch'}
        </Badge>
        {isCompleted && (
          <Badge variant="default" className="bg-green-500">
            ✓ Completed!
          </Badge>
        )}
      </div>

      {/* Timer Controls */}
      {showControls && (
        <div className="flex gap-3">
          {!activeTimer.isPaused ? (
            <Button
              onClick={onPause}
              variant="outline"
              size="lg"
              className="min-w-[120px]"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          ) : (
            <Button
              onClick={onResume}
              variant="default"
              size="lg"
              className="min-w-[120px]"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume
            </Button>
          )}
          
          <Button
            onClick={onStop}
            variant="destructive"
            size="lg"
            className="min-w-[120px]"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop
          </Button>
        </div>
      )}

      {/* Target Duration (Countdown mode) */}
      {activeTimer.mode === 'countdown' && activeTimer.targetDuration && (
        <div className="text-sm text-muted-foreground">
          Target: {formatTime(activeTimer.targetDuration)}
        </div>
      )}
    </div>
  );
}
