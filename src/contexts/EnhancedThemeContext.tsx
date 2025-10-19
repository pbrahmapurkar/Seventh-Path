/**
 * Enhanced Theme Context with comprehensive token system
 * Features: Persistence, hydration, token resolution, instant updates
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ThemeName, Theme, ThemeTokens } from '../themes/tokenSystem';
import { getTheme, defaultTheme, applyThemeToDOM, getAllThemes } from '../themes/tokenSystem';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  isTransitioning: boolean;
  resolvedTokens: ThemeTokens;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'seventh-path-theme';

/**
 * Load theme preference from storage with fallback
 */
function loadThemePreference(): ThemeName {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'blue', 'green'].includes(stored)) {
      return stored as ThemeName;
    }
  } catch (error) {
    console.error('Failed to load theme preference:', error);
  }
  return defaultTheme;
}

/**
 * Save theme preference to storage
 */
function saveThemePreference(themeName: ThemeName): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
}

/**
 * Enhanced Theme Provider with comprehensive token system
 */
export function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(defaultTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Get theme with fallback
  const theme = getTheme(themeName);
  const resolvedTokens = theme.tokens;

  // Hydrate theme on mount
  useEffect(() => {
    const savedTheme = loadThemePreference();
    setThemeNameState(savedTheme);
    setIsHydrated(true);
  }, []);

  // Apply theme to DOM whenever theme changes
  useEffect(() => {
    if (isHydrated && theme) {
      applyThemeToDOM(theme);
    }
  }, [theme, isHydrated]);

  const setTheme = useCallback(async (name: ThemeName) => {
    if (name === themeName || isTransitioning) return;
    
    // Start transition
    setIsTransitioning(true);

    // Small delay to allow transition to start
    await new Promise(resolve => setTimeout(resolve, 50));

    // Update theme
    setThemeNameState(name);

    // Save to storage
    saveThemePreference(name);

    // End transition after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 120); // 120ms ease transition
  }, [themeName]);

  const availableThemes = getAllThemes();

  const value: ThemeContextValue = {
    theme,
    themeName,
    setTheme,
    isTransitioning,
    resolvedTokens,
    availableThemes: [], // Will be populated by getAllThemes()
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access enhanced theme context
 */
export function useEnhancedTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
}

/**
 * Backward compatibility hook
 */
export function useTheme(): ThemeContextValue {
  return useEnhancedTheme();
}

/**
 * Hook to get resolved theme tokens
 */
export function useThemeTokens(): ThemeTokens {
  const { resolvedTokens } = useEnhancedTheme();
  return resolvedTokens;
}

/**
 * Hook to check if theme is dark
 */
export function useIsDarkTheme(): boolean {
  const { theme } = useEnhancedTheme();
  return theme.isDark;
}