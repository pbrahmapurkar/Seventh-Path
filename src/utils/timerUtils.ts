/**
 * Timer utilities for Prometheus Timer Feature
 */

import type { TimerSession, TimerMode, ActiveTimer } from '../types/timer';

/**
 * Format seconds to HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format seconds to readable duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Calculate elapsed time for a timer session
 */
export function calculateElapsedTime(session: TimerSession): number {
  const start = new Date(session.startTime).getTime();
  const end = session.endTime ? new Date(session.endTime).getTime() : Date.now();
  const totalTime = Math.floor((end - start) / 1000);
  const pausedTime = session.totalPausedTime || 0;
  return Math.max(0, totalTime - pausedTime);
}

/**
 * Calculate remaining time for countdown timer
 */
export function calculateRemainingTime(activeTimer: ActiveTimer): number {
  if (!activeTimer.targetDuration) return 0;
  
  const now = Date.now();
  const elapsed = Math.floor((now - activeTimer.startTime) / 1000);
  const pausedTime = activeTimer.totalPausedTime || 0;
  const actualElapsed = elapsed - pausedTime;
  
  return Math.max(0, activeTimer.targetDuration - actualElapsed);
}

/**
 * Calculate current elapsed time for an active timer
 */
export function calculateCurrentElapsed(activeTimer: ActiveTimer): number {
  const now = Date.now();
  const elapsed = Math.floor((now - activeTimer.startTime) / 1000);
  const pausedTime = activeTimer.totalPausedTime || 0;
  
  return Math.max(0, elapsed - pausedTime);
}

/**
 * Generate timer session ID
 */
export function generateTimerSessionId(): string {
  return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse duration string (e.g., "30m", "1h", "1h 30m") to seconds
 */
export function parseDuration(durationStr: string): number {
  const hourMatch = durationStr.match(/(\d+)\s*h/);
  const minuteMatch = durationStr.match(/(\d+)\s*m/);
  
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
  
  return (hours * 3600) + (minutes * 60);
}

/**
 * Get timer completion percentage
 */
export function getTimerProgress(activeTimer: ActiveTimer): number {
  if (activeTimer.mode === 'stopwatch') {
    return 0; // Stopwatch has no target, so no progress
  }
  
  if (!activeTimer.targetDuration) return 0;
  
  const elapsed = calculateCurrentElapsed(activeTimer);
  const progress = (elapsed / activeTimer.targetDuration) * 100;
  
  return Math.min(100, Math.max(0, progress));
}

/**
 * Check if timer is completed
 */
export function isTimerCompleted(activeTimer: ActiveTimer): boolean {
  if (activeTimer.mode === 'stopwatch') {
    return false; // Stopwatch never auto-completes
  }
  
  if (!activeTimer.targetDuration) return false;
  
  const remaining = calculateRemainingTime(activeTimer);
  return remaining <= 0;
}

/**
 * Save active timer to localStorage (for persistence across app restarts)
 */
export function saveActiveTimer(timer: ActiveTimer): void {
  try {
    localStorage.setItem(`active_timer_${timer.habitId}`, JSON.stringify(timer));
  } catch (error) {
    console.error('Failed to save active timer:', error);
  }
}

/**
 * Load active timer from localStorage
 */
export function loadActiveTimer(habitId: string): ActiveTimer | null {
  try {
    const stored = localStorage.getItem(`active_timer_${habitId}`);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load active timer:', error);
    return null;
  }
}

/**
 * Remove active timer from localStorage
 */
export function clearActiveTimer(habitId: string): void {
  try {
    localStorage.removeItem(`active_timer_${habitId}`);
  } catch (error) {
    console.error('Failed to clear active timer:', error);
  }
}

/**
 * Play completion sound
 */
export function playTimerCompletionSound(): void {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Failed to play timer completion sound:', error);
  }
}
