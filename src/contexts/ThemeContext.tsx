/**
 * Theme Context Provider
 * Provides the single Emerald Night theme to the entire app
 */

import React, { createContext, useContext, useEffect } from 'react';
import type { Theme } from '../themes/themeDefinitions';
import { defaultTheme } from '../themes/themeDefinitions';

interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

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

  // Always apply dark class for Emerald Night theme
  root.classList.add('dark');

  // Set data attribute for theme name
  root.setAttribute('data-theme', theme.name);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = defaultTheme;

  // Apply theme to DOM on mount
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
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
