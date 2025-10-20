/**
 * Optimized Stats Computation
 * Implements caching and batch loading to avoid O(n²) I/O operations
 */

import type { HabitDef, HabitStats, DayEntry } from './types';
import { toYMD, daysBetween, isDayComplete } from './index';
import { getDayEntry } from './index';

// Cache for day entries to avoid repeated I/O
const dayEntryCache = new Map<string, DayEntry | null>();
const cacheExpiry = new Map<string, number>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Clear cache when it gets too large
const MAX_CACHE_SIZE = 1000;
function cleanupCache() {
  if (dayEntryCache.size > MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, expiry] of cacheExpiry.entries()) {
      if (now > expiry) {
        dayEntryCache.delete(key);
        cacheExpiry.delete(key);
      }
    }
  }
}

/**
 * Get day entry with caching
 */
async function getCachedDayEntry(habitId: string, ymd: string): Promise<DayEntry | null> {
  const cacheKey = `${habitId}:${ymd}`;
  const now = Date.now();
  
  // Check cache first
  if (dayEntryCache.has(cacheKey)) {
    const expiry = cacheExpiry.get(cacheKey);
    if (expiry && now < expiry) {
      return dayEntryCache.get(cacheKey) || null;
    }
  }
  
  try {
    // Fetch from storage
    const entry = await getDayEntry(habitId, ymd);
    
    // Cache the result (including null results)
    dayEntryCache.set(cacheKey, entry);
    cacheExpiry.set(cacheKey, now + CACHE_TTL);
    
    cleanupCache();
    return entry;
  } catch (error) {
    console.warn(`Failed to get day entry for ${habitId} on ${ymd}:`, error);
    // Cache null result to avoid repeated failures
    dayEntryCache.set(cacheKey, null);
    cacheExpiry.set(cacheKey, now + CACHE_TTL);
    return null;
  }
}

/**
 * Batch load day entries for a date range
 */
async function batchLoadDayEntries(
  habitId: string, 
  startDate: Date, 
  endDate: Date
): Promise<Map<string, DayEntry | null>> {
  const entries = new Map<string, DayEntry | null>();
  const promises: Promise<void>[] = [];
  
  // Create date range
  const dates: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(toYMD(current));
    current.setDate(current.getDate() + 1);
  }
  
  // Load all entries in parallel
  for (const ymd of dates) {
    promises.push(
      getCachedDayEntry(habitId, ymd).then(entry => {
        entries.set(ymd, entry);
      })
    );
  }
  
  // Wait for all to complete
  await Promise.allSettled(promises);
  
  return entries;
}

/**
 * Optimized stats computation with caching and batch loading
 */
export async function computeStats(habit: HabitDef): Promise<HabitStats> {
  const today = new Date();
  const created = new Date(habit.createdAt);
  const totalDays = Math.max(1, daysBetween(created, today) + 1);

  // Batch load all day entries for the habit's lifetime
  const allEntries = await batchLoadDayEntries(habit.id, created, today);
  
  // Walk through days to compute completed days and streaks
  let totalCompletedDays = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let rollingStreak = 0;

  // Weekly progress: last 7 days
  const weeklyProgress: { date: string; complete: boolean }[] = [];

  // Iterate all days from creation to today
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(created.getTime() + (i * 24 * 60 * 60 * 1000));
    const ymd = toYMD(d);
    const entry = allEntries.get(ymd);
    const complete = entry ? isDayComplete(entry) : false;
    
    if (complete) {
      totalCompletedDays++;
      rollingStreak++;
      bestStreak = Math.max(bestStreak, rollingStreak);
    } else {
      rollingStreak = 0;
    }
    
    if (toYMD(d) === toYMD(today)) {
      currentStreak = complete ? rollingStreak : 0;
    }
  }

  // Weekly progress (last 7 days ending today)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
    const ymd = toYMD(d);
    const entry = allEntries.get(ymd);
    weeklyProgress.push({ 
      date: ymd, 
      complete: entry ? isDayComplete(entry) : false 
    });
  }

  const completionRate = Math.round((totalCompletedDays / totalDays) * 100);

  return {
    currentStreak,
    bestStreak,
    completionRate,
    totalCompletedDays,
    weeklyProgress,
  };
}

/**
 * Clear the day entry cache
 */
export function clearDayEntryCache(): void {
  dayEntryCache.clear();
  cacheExpiry.clear();
}

/**
 * Clear cache for a specific habit
 */
export function clearHabitCache(habitId: string): void {
  for (const key of dayEntryCache.keys()) {
    if (key.startsWith(`${habitId}:`)) {
      dayEntryCache.delete(key);
      cacheExpiry.delete(key);
    }
  }
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): { size: number; entries: number } {
  return {
    size: dayEntryCache.size,
    entries: Array.from(dayEntryCache.values()).filter(entry => entry !== null).length
  };
}
