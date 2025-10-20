/**
 * Capacitor Preferences Storage Helper
 * Provides a unified interface for storing preferences across web and native platforms
 */

import { Capacitor } from '@capacitor/core';

// Safe JSON parsing with error handling
function safeParseJson<T = any>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return null;
  }
}

// Safe JSON stringification with error handling
function safeStringifyJson(value: any): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('Failed to stringify JSON:', error);
    return null;
  }
}

/**
 * Get a preference value with fallback
 */
export async function getPreference<T = any>(key: string, defaultValue: T): Promise<T> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    
    if (prefs && Capacitor.getPlatform() !== 'web') {
      // Use Capacitor Preferences on native platforms
      const result = await prefs.get({ key });
      if (result?.value) {
        const parsed = safeParseJson<T>(result.value);
        return parsed !== null ? parsed : defaultValue;
      }
      return defaultValue;
    } else {
      // Use localStorage on web
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = safeParseJson<T>(raw);
        return parsed !== null ? parsed : defaultValue;
      }
      return defaultValue;
    }
  } catch (error) {
    console.warn(`Failed to get preference ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Set a preference value
 */
export async function setPreference<T = any>(key: string, value: T): Promise<void> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    
    const str = safeStringifyJson(value);
    if (!str) {
      console.error(`Failed to stringify value for key: ${key}`);
      return;
    }
    
    if (prefs && Capacitor.getPlatform() !== 'web') {
      // Use Capacitor Preferences on native platforms
      await prefs.set({ key, value: str });
    } else {
      // Use localStorage on web
      localStorage.setItem(key, str);
    }
  } catch (error) {
    console.warn(`Failed to set preference ${key}:`, error);
  }
}

/**
 * Remove a preference value
 */
export async function removePreference(key: string): Promise<void> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    
    if (prefs && Capacitor.getPlatform() !== 'web') {
      // Use Capacitor Preferences on native platforms
      await prefs.remove({ key });
    } else {
      // Use localStorage on web
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn(`Failed to remove preference ${key}:`, error);
  }
}

/**
 * Check if a preference exists
 */
export async function hasPreference(key: string): Promise<boolean> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    
    if (prefs && Capacitor.getPlatform() !== 'web') {
      // Use Capacitor Preferences on native platforms
      const result = await prefs.get({ key });
      return result?.value !== undefined;
    } else {
      // Use localStorage on web
      return localStorage.getItem(key) !== null;
    }
  } catch (error) {
    console.warn(`Failed to check preference ${key}:`, error);
    return false;
  }
}

/**
 * Get all preference keys
 */
export async function getAllPreferenceKeys(): Promise<string[]> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    
    if (prefs && Capacitor.getPlatform() !== 'web') {
      // Use Capacitor Preferences on native platforms
      const result = await prefs.keys();
      return result?.keys || [];
    } else {
      // Use localStorage on web
      return Object.keys(localStorage);
    }
  } catch (error) {
    console.warn('Failed to get all preference keys:', error);
    return [];
  }
}

/**
 * Clear all preferences
 */
export async function clearAllPreferences(): Promise<void> {
  try {
    const anyWin: any = globalThis as any;
    const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
    
    if (prefs && Capacitor.getPlatform() !== 'web') {
      // Use Capacitor Preferences on native platforms
      await prefs.clear();
    } else {
      // Use localStorage on web
      localStorage.clear();
    }
  } catch (error) {
    console.warn('Failed to clear all preferences:', error);
  }
}
