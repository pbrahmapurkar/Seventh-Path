/**
 * Timer Session Types for Prometheus Timer Feature
 */

export type TimerMode = 'countdown' | 'stopwatch';

export interface TimerConfig {
  enabled: boolean;
  mode: TimerMode;
  defaultDuration?: number; // in seconds, for countdown mode
  autoCompleteHabit?: boolean; // complete habit when timer finishes
}

export interface TimerSession {
  id: string;
  habitId: string;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  duration: number; // actual duration in seconds
  targetDuration?: number; // for countdown mode
  mode: TimerMode;
  completed: boolean;
  paused: boolean;
  pausedAt?: string;
  totalPausedTime?: number; // in seconds
}

export interface ActiveTimer {
  habitId: string;
  sessionId: string;
  mode: TimerMode;
  startTime: number; // timestamp
  targetDuration?: number; // in seconds
  isPaused: boolean;
  pausedAt?: number;
  totalPausedTime: number;
}
