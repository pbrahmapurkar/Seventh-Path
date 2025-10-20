/**
 * Seventh Path Zen Theme Context
 * Mindful theme management with spiritual design system
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ZenThemeName, ZenTheme } from '../themes/zenThemeSystem';
import { 
  getZenTheme, 
  defaultZenTheme, 
  applyZenThemeToDOM, 
  getAllZenThemes,
  applyCalmMode,
  isCalmModeEnabled,
  applyThemeTransition,
  removeThemeTransition
} from '../themes/zenThemeSystem';

interface ZenThemeContextValue {
  theme: ZenTheme;
  themeName: ZenThemeName;
  setTheme: (name: ZenThemeName) => Promise<void>;
  isTransitioning: boolean;
  availableThemes: ZenTheme[];
  calmMode: boolean;
  setCalmMode: (enabled: boolean) => void;
  isHydrated: boolean;
}

const ZenThemeContext = createContext<ZenThemeContextValue | undefined>(undefined);

const ZEN_THEME_STORAGE_KEY = 'seventh-path-zen-theme';
const CALM_MODE_STORAGE_KEY = 'seventh-path-calm-mode';

/**
 * Load theme preference from storage with fallback
 */
function loadThemePreference(): ZenThemeName {
  try {
    const stored = localStorage.getItem(ZEN_THEME_STORAGE_KEY);
    if (stored && ['zen-light', 'zen-dark', 'zen-calm', 'zen-meditation'].includes(stored)) {
      return stored as ZenThemeName;
    }
  } catch (error) {
    console.error('Failed to load zen theme preference:', error);
  }
  return defaultZenTheme;
}

/**
 * Save theme preference to storage
 */
function saveThemePreference(themeName: ZenThemeName): void {
  try {
    localStorage.setItem(ZEN_THEME_STORAGE_KEY, themeName);
  } catch (error) {
    console.error('Failed to save zen theme preference:', error);
  }
}

/**
 * Load calm mode preference from storage
 */
function loadCalmModePreference(): boolean {
  try {
    const stored = localStorage.getItem(CALM_MODE_STORAGE_KEY);
    return stored === 'true';
  } catch (error) {
    console.error('Failed to load calm mode preference:', error);
    return false;
  }
}

/**
 * Save calm mode preference to storage
 */
function saveCalmModePreference(enabled: boolean): void {
  try {
    localStorage.setItem(CALM_MODE_STORAGE_KEY, enabled.toString());
  } catch (error) {
    console.error('Failed to save calm mode preference:', error);
  }
}

/**
 * Zen Theme Provider with mindful design system
 */
export function ZenThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ZenThemeName>(defaultZenTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [calmMode, setCalmModeState] = useState(false);
  
  // Get theme with fallback
  const theme = getZenTheme(themeName);
  const availableThemes = getAllZenThemes();

  // Hydrate theme and calm mode on mount
  useEffect(() => {
    const savedTheme = loadThemePreference();
    const savedCalmMode = loadCalmModePreference();
    
    setThemeNameState(savedTheme);
    setCalmModeState(savedCalmMode);
    setIsHydrated(true);
  }, []);

  // Apply theme to DOM whenever theme changes
  useEffect(() => {
    if (isHydrated && theme) {
      applyZenThemeToDOM(theme);
    }
  }, [theme, isHydrated]);

  // Apply calm mode to DOM whenever it changes
  useEffect(() => {
    if (isHydrated) {
      applyCalmMode(calmMode);
    }
  }, [calmMode, isHydrated]);

  const setTheme = useCallback(async (name: ZenThemeName) => {
    if (name === themeName || isTransitioning) return;
    
    // Start transition
    setIsTransitioning(true);
    applyThemeTransition(400);

    // Small delay to allow transition to start
    await new Promise(resolve => setTimeout(resolve, 50));

    // Update theme
    setThemeNameState(name);

    // Save to storage
    saveThemePreference(name);

    // End transition after animation
    setTimeout(() => {
      setIsTransitioning(false);
      removeThemeTransition();
    }, 400);
  }, [themeName, isTransitioning]);

  const setCalmMode = useCallback((enabled: boolean) => {
    setCalmModeState(enabled);
    saveCalmModePreference(enabled);
  }, []);

  const value: ZenThemeContextValue = {
    theme,
    themeName,
    setTheme,
    isTransitioning,
    availableThemes,
    calmMode,
    setCalmMode,
    isHydrated,
  };

  return (
    <ZenThemeContext.Provider value={value}>
      {children}
    </ZenThemeContext.Provider>
  );
}

/**
 * Hook to access zen theme context
 */
export function useZenTheme(): ZenThemeContextValue {
  const context = useContext(ZenThemeContext);
  if (context === undefined) {
    throw new Error('useZenTheme must be used within a ZenThemeProvider');
  }
  return context;
}

/**
 * Hook to get current theme colors
 */
export function useZenThemeColors() {
  const { theme } = useZenTheme();
  return theme.colors;
}

/**
 * Hook to check if current theme is dark
 */
export function useIsZenThemeDark(): boolean {
  const { theme } = useZenTheme();
  return theme.isDark;
}

/**
 * Hook to check if calm mode is enabled
 */
export function useCalmMode(): boolean {
  const { calmMode } = useZenTheme();
  return calmMode;
}

/**
 * Hook to toggle calm mode
 */
export function useToggleCalmMode() {
  const { calmMode, setCalmMode } = useZenTheme();
  
  const toggleCalmMode = useCallback(() => {
    setCalmMode(!calmMode);
  }, [calmMode, setCalmMode]);
  
  return { calmMode, toggleCalmMode };
}

/**
 * Hook to get theme transition state
 */
export function useThemeTransition() {
  const { isTransitioning } = useZenTheme();
  return isTransitioning;
}

/**
 * Hook to get available themes
 */
export function useAvailableZenThemes() {
  const { availableThemes } = useZenTheme();
  return availableThemes;
}

/**
 * Hook to get theme by name
 */
export function useZenThemeByName(name: ZenThemeName) {
  const { availableThemes } = useZenTheme();
  return availableThemes.find(theme => theme.name === name);
}

/**
 * Hook to check if theme is currently active
 */
export function useIsThemeActive(name: ZenThemeName) {
  const { themeName } = useZenTheme();
  return themeName === name;
}

/**
 * Hook to get theme metadata
 */
export function useZenThemeMetadata() {
  const { theme, themeName, calmMode, isTransitioning } = useZenTheme();
  
  return {
    currentTheme: theme,
    currentThemeName: themeName,
    isDark: theme.isDark,
    calmMode,
    isTransitioning,
    displayName: theme.displayName,
    description: theme.description,
  };
}
