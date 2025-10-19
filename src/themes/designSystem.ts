/**
 * Seventh Path Design System - Formal Specification
 * Version: 1.0
 * Date: October 16, 2025
 * 
 * Comprehensive design system with invariant semantic colors and theme-specific palettes
 */

export type ThemeName = 'dark' | 'light' | 'blue' | 'green';

// Invariant Semantic Palette - consistent across all themes
export const semanticColors = {
  success: '#30A46C', // 145°, 55%, 42% - 5.1:1 / 4.1:1
  warning: '#F7B955', // 39°, 91%, 66% - 10.3:1 / 2.0:1 (Needs Dark Text)
  danger: '#E5484D',  // 358°, 79%, 60% - 6.2:1 / 3.4:1 (Needs AA+)
  info: '#0090FF',    // 208°, 100%, 50% - 4.6:1 / 4.6:1
} as const;

// Theme-specific palette definitions
export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: {
    100: string; // App Background
    200: string; // Surface
    300: string; // Borders, Dividers
    400: string; // UI Elements
    500: string;
    600: string; // Muted Text, Icons
    700: string;
    800: string;
    900: string; // Primary Text
  };
}

// Dark Theme (Default)
const darkTheme: ThemePalette = {
  primary: '#8B5CF6', // Violet
  secondary: '#30A46C', // Green
  accent: '#EC4899', // Pink
  neutral: {
    100: '#1C1C1E', // App Background
    200: '#2C2C2E', // Surface
    300: '#3A3A3C', // Borders, Dividers
    400: '#48484A', // UI Elements
    500: '#636366',
    600: '#8E8E93', // Muted Text, Icons
    700: '#AEAEB2',
    800: '#D1D1D6',
    900: '#F2F2F7', // Primary Text
  },
};

// Light Theme
const lightTheme: ThemePalette = {
  primary: '#6D28D9', // Violet
  secondary: '#15803D', // Green
  accent: '#DB2777', // Pink
  neutral: {
    100: '#FFFFFF', // App Background
    200: '#F2F2F7', // Surface
    300: '#E5E5EA', // Borders, Dividers
    400: '#D1D1D6', // UI Elements
    500: '#C7C7CC',
    600: '#8E8E93', // Muted Text, Icons
    700: '#636366',
    800: '#3A3A3C',
    900: '#1C1C1E', // Primary Text
  },
};

// Blue Theme
const blueTheme: ThemePalette = {
  primary: '#60A5FA', // Sky Blue
  secondary: '#34D399', // Emerald
  accent: '#FBBF24', // Amber
  neutral: {
    100: '#0F172A', // App Background
    200: '#1E293B', // Surface
    300: '#334155', // Borders, Dividers
    400: '#475569', // UI Elements
    500: '#64748B',
    600: '#94A3B8', // Muted Text, Icons
    700: '#CBD5E1',
    800: '#E2E8F0',
    900: '#F1F5F9', // Primary Text
  },
};

// Green Theme
const greenTheme: ThemePalette = {
  primary: '#4ADE80', // Lime Green
  secondary: '#A78BFA', // Violet
  accent: '#F97316', // Orange
  neutral: {
    100: '#111813', // App Background
    200: '#1A241D', // Surface
    300: '#29362E', // Borders, Dividers
    400: '#37493D', // UI Elements
    500: '#506457',
    600: '#87978D', // Muted Text, Icons
    700: '#B4BFB8',
    800: '#DDE2DF',
    900: '#F5F7F6', // Primary Text
  },
};

export const themePalettes: Record<ThemeName, ThemePalette> = {
  dark: darkTheme,
  light: lightTheme,
  blue: blueTheme,
  green: greenTheme,
};

// Token mapping interface
export interface DesignTokens {
  // Backgrounds & Surfaces
  'background-primary': string;
  'background-surface': string;
  'background-accent': string;
  'gradient-start': string;
  'gradient-end': string;
  
  // Text & Icons
  'text-primary': string;
  'text-secondary': string;
  'text-muted': string;
  'text-on-accent': string;
  'icon-primary': string;
  'icon-muted': string;
  
  // Borders & Dividers
  'border-subtle': string;
  'border-interactive': string;
  'focus-ring': string;
  'divider': string;
  
  // Charts & Semantics
  'chart-fill-primary': string;
  'chart-fill-secondary': string;
  'semantic-success': string;
  'semantic-warning': string;
  'semantic-danger': string;
  'semantic-info': string;
}

// Generate design tokens from theme palette
export function generateDesignTokens(themeName: ThemeName): DesignTokens {
  const palette = themePalettes[themeName];
  
  return {
    // Backgrounds & Surfaces
    'background-primary': palette.neutral[100],
    'background-surface': palette.neutral[200],
    'background-accent': palette.accent,
    'gradient-start': palette.primary,
    'gradient-end': palette.secondary,
    
    // Text & Icons
    'text-primary': palette.neutral[900],
    'text-secondary': palette.neutral[700],
    'text-muted': palette.neutral[600],
    'text-on-accent': '#FFFFFF', // Always white on accent
    'icon-primary': palette.neutral[800],
    'icon-muted': palette.neutral[600],
    
    // Borders & Dividers
    'border-subtle': palette.neutral[300],
    'border-interactive': palette.neutral[400],
    'focus-ring': palette.primary,
    'divider': palette.neutral[300],
    
    // Charts & Semantics
    'chart-fill-primary': palette.primary,
    'chart-fill-secondary': palette.secondary,
    'semantic-success': semanticColors.success,
    'semantic-warning': semanticColors.warning,
    'semantic-danger': semanticColors.danger,
    'semantic-info': semanticColors.info,
  };
}

// Theme metadata
export interface ThemeMetadata {
  name: ThemeName;
  displayName: string;
  description: string;
  isDark: boolean;
  tokens: DesignTokens;
}

// Generate complete theme with metadata
export function createTheme(themeName: ThemeName): ThemeMetadata {
  const tokens = generateDesignTokens(themeName);
  const isDark = themeName === 'dark' || themeName === 'blue' || themeName === 'green';
  
  const metadata = {
    dark: { displayName: 'Dark', description: 'Sophisticated dark interface with reduced eye strain' },
    light: { displayName: 'Light', description: 'Clean light interface with high contrast' },
    blue: { displayName: 'Blue', description: 'Calming blue interface for focus and productivity' },
    green: { displayName: 'Green', description: 'Natural green interface for growth and wellness' },
  };
  
  return {
    name: themeName,
    displayName: metadata[themeName].displayName,
    description: metadata[themeName].description,
    isDark,
    tokens,
  };
}

// Get all available themes
export function getAllThemes(): ThemeMetadata[] {
  return (['dark', 'light', 'blue', 'green'] as ThemeName[]).map(createTheme);
}

// Get theme by name
export function getTheme(name: ThemeName): ThemeMetadata {
  return createTheme(name);
}

// Default theme
export const defaultTheme: ThemeName = 'dark';

// CSS variable generation
export function generateCSSVariables(tokens: DesignTokens): Record<string, string> {
  const cssVars: Record<string, string> = {};
  
  Object.entries(tokens).forEach(([key, value]) => {
    const cssVarName = `--sp-${key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}`;
    cssVars[cssVarName] = value;
  });
  
  return cssVars;
}

// Apply theme to DOM
export function applyThemeToDOM(theme: ThemeMetadata): void {
  const root = document.documentElement;
  const cssVars = generateCSSVariables(theme.tokens);
  
  // Apply all CSS variables
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Apply theme class
  root.className = root.className.replace(/theme-\w+/g, '');
  root.classList.add(`theme-${theme.name}`);
  
  // Set data attributes
  root.setAttribute('data-theme', theme.name);
  root.setAttribute('data-theme-dark', theme.isDark.toString());
}


