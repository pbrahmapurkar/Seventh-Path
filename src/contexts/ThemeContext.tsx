/**
 * Theme Context Provider
 * Manages theme state and provides theme switching functionality
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ThemeName, Theme } from '../themes/themeDefinitions';
import { getTheme, defaultTheme } from '../themes/themeDefinitions';
import { Capacitor } from '@capacitor/core';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'seventh-path-theme';

/**
 * Load theme preference from storage
 */
function loadThemePreference(): ThemeName {
  try {
    if (Capacitor.getPlatform() !== 'web') {
      // For native apps, use Capacitor Preferences
      // Will be loaded async, so return default for now
      return defaultTheme;
    } else {
      // For web, use localStorage
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && ['light', 'dark', 'blue', 'green'].includes(stored)) {
        return stored as ThemeName;
      }
    }
  } catch (error) {
    console.error('Failed to load theme preference:', error);
  }
  return defaultTheme;
}

/**
 * Save theme preference to storage
 */
async function saveThemePreference(themeName: ThemeName): Promise<void> {
  try {
    if (Capacitor.getPlatform() !== 'web') {
      // For native apps
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: THEME_STORAGE_KEY,
        value: themeName,
      });
    } else {
      // For web
      localStorage.setItem(THEME_STORAGE_KEY, themeName);
    }
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
}

/**
 * Apply theme colors to CSS variables
 */
function applyThemeToDOM(theme: Theme): void {
  const root = document.documentElement;
  const { colors } = theme;

  // Apply all color tokens as CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case
    const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--${cssVarName}`, value);
  });

  // Apply dark class for dark theme
  if (theme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set data attribute for theme name
  root.setAttribute('data-theme', theme.name);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(loadThemePreference);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const theme = getTheme(themeName);

  // Load theme from native storage on mount
  useEffect(() => {
    async function loadNativeTheme() {
      if (Capacitor.getPlatform() !== 'web') {
        try {
          const { Preferences } = await import('@capacitor/preferences');
          const result = await Preferences.get({ key: THEME_STORAGE_KEY });
          if (result.value && ['light', 'dark', 'blue', 'green'].includes(result.value)) {
            setThemeNameState(result.value as ThemeName);
          }
        } catch (error) {
          console.error('Failed to load native theme:', error);
        }
      }
    }
    loadNativeTheme();
  }, []);

  // Apply theme to DOM whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const setTheme = useCallback(async (name: ThemeName) => {
    // Start transition
    setIsTransitioning(true);

    // Small delay to allow transition to start
    await new Promise(resolve => setTimeout(resolve, 50));

    // Update theme
    setThemeNameState(name);

    // Save to storage
    await saveThemePreference(name);

    // End transition after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Hook to get current theme colors
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}
