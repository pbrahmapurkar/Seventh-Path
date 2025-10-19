/**
 * Seventh Path Design System Context
 * Formal implementation of the design specification
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ThemeName, ThemeMetadata } from '../themes/designSystem';
import { getTheme, defaultTheme, applyThemeToDOM, getAllThemes } from '../themes/designSystem';

interface DesignSystemContextValue {
  theme: ThemeMetadata;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  isTransitioning: boolean;
  availableThemes: ThemeMetadata[];
}

const DesignSystemContext = createContext<DesignSystemContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'seventh-path-theme';

/**
 * Load theme preference from storage with fallback
 */
function loadThemePreference(): ThemeName {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['dark', 'light', 'blue', 'green'].includes(stored)) {
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
 * Design System Provider with formal specification implementation
 */
export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(defaultTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Get theme with fallback
  const theme = getTheme(themeName);
  const availableThemes = getAllThemes();

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

  const value: DesignSystemContextValue = {
    theme,
    themeName,
    setTheme,
    isTransitioning,
    availableThemes,
  };

  return (
    <DesignSystemContext.Provider value={value}>
      {children}
    </DesignSystemContext.Provider>
  );
}

/**
 * Hook to access design system context
 */
export function useDesignSystem(): DesignSystemContextValue {
  const context = useContext(DesignSystemContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

/**
 * Backward compatibility hook
 */
export function useTheme(): DesignSystemContextValue {
  return useDesignSystem();
}

/**
 * Hook to get design tokens
 */
export function useDesignTokens() {
  const { theme } = useDesignSystem();
  return theme.tokens;
}

/**
 * Hook to check if theme is dark
 */
export function useIsDarkTheme(): boolean {
  const { theme } = useDesignSystem();
  return theme.isDark;
}


