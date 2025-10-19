/**
 * Timer Store - Manages active timers and timer sessions
 */

import { create } from 'zustand';
import type { ActiveTimer, TimerSession } from '../types/timer';
import {
  generateTimerSessionId,
  saveActiveTimer,
  loadActiveTimer,
  clearActiveTimer,
  playTimerCompletionSound
} from '../utils/timerUtils';

interface TimerStoreState {
  activeTimers: Record<string, ActiveTimer>; // habitId -> ActiveTimer
  timerSessions: Record<string, TimerSession[]>; // habitId -> TimerSession[]
  
  // Actions
  startTimer: (habitId: string, mode: 'countdown' | 'stopwatch', targetDuration?: number) => void;
  pauseTimer: (habitId: string) => void;
  resumeTimer: (habitId: string) => void;
  stopTimer: (habitId: string, completed?: boolean) => TimerSession | null;
  getActiveTimer: (habitId: string) => ActiveTimer | null;
  getTimerSessions: (habitId: string) => TimerSession[];
  loadPersistedTimer: (habitId: string) => void;
  clearTimer: (habitId: string) => void;
}

export const useTimerStore = create<TimerStoreState>()((set, get) => ({
  activeTimers: {},
  timerSessions: {},

  startTimer: (habitId, mode, targetDuration) => {
    const sessionId = generateTimerSessionId();
    const startTime = Date.now();

    const activeTimer: ActiveTimer = {
      habitId,
      sessionId,
      mode,
      startTime,
      targetDuration,
      isPaused: false,
      totalPausedTime: 0,
    };

    set((state) => ({
      activeTimers: {
        ...state.activeTimers,
        [habitId]: activeTimer,
      },
    }));

    // Persist to localStorage
    saveActiveTimer(activeTimer);
  },

  pauseTimer: (habitId) => {
    const state = get();
    const timer = state.activeTimers[habitId];
    if (!timer || timer.isPaused) return;

    const updatedTimer: ActiveTimer = {
      ...timer,
      isPaused: true,
      pausedAt: Date.now(),
    };

    set((state) => ({
      activeTimers: {
        ...state.activeTimers,
        [habitId]: updatedTimer,
      },
    }));

    saveActiveTimer(updatedTimer);
  },

  resumeTimer: (habitId) => {
    const state = get();
    const timer = state.activeTimers[habitId];
    if (!timer || !timer.isPaused || !timer.pausedAt) return;

    const pauseDuration = Date.now() - timer.pausedAt;
    const updatedTimer: ActiveTimer = {
      ...timer,
      isPaused: false,
      totalPausedTime: (timer.totalPausedTime || 0) + Math.floor(pauseDuration / 1000),
      pausedAt: undefined,
    };

    set((state) => ({
      activeTimers: {
        ...state.activeTimers,
        [habitId]: updatedTimer,
      },
    }));

    saveActiveTimer(updatedTimer);
  },

  stopTimer: (habitId, completed = true) => {
    const state = get();
    const timer = state.activeTimers[habitId];
    if (!timer) return null;

    const endTime = Date.now();
    const totalElapsed = Math.floor((endTime - timer.startTime) / 1000);
    const duration = totalElapsed - (timer.totalPausedTime || 0);

    const session: TimerSession = {
      id: timer.sessionId,
      habitId,
      startTime: new Date(timer.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration,
      targetDuration: timer.targetDuration,
      mode: timer.mode,
      completed,
    };

    // Add session to history
    set((state) => ({
      timerSessions: {
        ...state.timerSessions,
        [habitId]: [...(state.timerSessions[habitId] || []), session],
      },
    }));

    // Remove active timer
    const { [habitId]: removed, ...restTimers } = state.activeTimers;
    set({ activeTimers: restTimers });

    // Clear from localStorage
    clearActiveTimer(habitId);

    // Play completion sound if completed
    if (completed) {
      playTimerCompletionSound();
    }

    return session;
  },

  getActiveTimer: (habitId) => {
    return get().activeTimers[habitId] || null;
  },

  getTimerSessions: (habitId) => {
    return get().timerSessions[habitId] || [];
  },

  loadPersistedTimer: (habitId) => {
    const timer = loadActiveTimer(habitId);
    if (timer) {
      set((state) => ({
        activeTimers: {
          ...state.activeTimers,
          [habitId]: timer,
        },
      }));
    }
  },

  clearTimer: (habitId) => {
    const state = get();
    const { [habitId]: removed, ...restTimers } = state.activeTimers;
    set({ activeTimers: restTimers });
    clearActiveTimer(habitId);
  },
}));
