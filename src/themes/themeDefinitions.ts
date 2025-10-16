/**
 * Theme Definitions for Seventh Path
 * Each theme includes color tokens for consistent theming across the app
 */

export type ThemeName = 'light' | 'dark' | 'blue' | 'green';

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  
  // Surface colors
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Interactive colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  
  // Semantic colors
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  
  // UI elements
  border: string;
  input: string;
  ring: string;
  
  // Special
  gradient?: string;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: ThemeColors;
  isDark: boolean;
}

/**
 * Light Theme - Clean and eye-friendly
 */
const lightTheme: Theme = {
  name: 'light',
  displayName: 'Light',
  description: 'Clean light background with muted accents',
  isDark: false,
  colors: {
    background: 'hsl(210, 40%, 98%)',
    foreground: 'hsl(222, 47%, 11%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(222, 47%, 11%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(222, 47%, 11%)',
    primary: 'hsl(217, 91%, 60%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(210, 40%, 96%)',
    secondaryForeground: 'hsl(222, 47%, 11%)',
    muted: 'hsl(210, 40%, 96%)',
    mutedForeground: 'hsl(215, 16%, 47%)',
    accent: 'hsl(142, 76%, 73%)',
    accentForeground: 'hsl(222, 47%, 11%)',
    destructive: 'hsl(0, 84%, 60%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
    success: 'hsl(142, 76%, 36%)',
    successForeground: 'hsl(0, 0%, 100%)',
    warning: 'hsl(38, 92%, 50%)',
    warningForeground: 'hsl(0, 0%, 100%)',
    info: 'hsl(199, 89%, 48%)',
    infoForeground: 'hsl(0, 0%, 100%)',
    border: 'hsl(214, 32%, 91%)',
    input: 'hsl(214, 32%, 91%)',
    ring: 'hsl(217, 91%, 60%)',
    gradient: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 73%) 100%)',
  },
};

/**
 * Dark Theme - Polished dark surfaces
 */
const darkTheme: Theme = {
  name: 'dark',
  displayName: 'Dark',
  description: 'Polished dark surfaces with subtle highlights',
  isDark: true,
  colors: {
    background: 'hsl(222, 47%, 11%)',
    foreground: 'hsl(210, 40%, 98%)',
    card: 'hsl(222, 47%, 13%)',
    cardForeground: 'hsl(210, 40%, 98%)',
    popover: 'hsl(222, 47%, 13%)',
    popoverForeground: 'hsl(210, 40%, 98%)',
    primary: 'hsl(217, 91%, 60%)',
    primaryForeground: 'hsl(222, 47%, 11%)',
    secondary: 'hsl(217, 33%, 17%)',
    secondaryForeground: 'hsl(210, 40%, 98%)',
    muted: 'hsl(223, 47%, 11%)',
    mutedForeground: 'hsl(215, 20%, 65%)',
    accent: 'hsl(142, 76%, 73%)',
    accentForeground: 'hsl(222, 47%, 11%)',
    destructive: 'hsl(0, 63%, 31%)',
    destructiveForeground: 'hsl(210, 40%, 98%)',
    success: 'hsl(142, 76%, 36%)',
    successForeground: 'hsl(210, 40%, 98%)',
    warning: 'hsl(38, 92%, 50%)',
    warningForeground: 'hsl(222, 47%, 11%)',
    info: 'hsl(199, 89%, 48%)',
    infoForeground: 'hsl(0, 0%, 100%)',
    border: 'hsl(217, 33%, 17%)',
    input: 'hsl(217, 33%, 17%)',
    ring: 'hsl(224, 71%, 4%)',
    gradient: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 73%) 100%)',
  },
};

/**
 * Blue Theme - Calming blues with neutral backgrounds
 */
const blueTheme: Theme = {
  name: 'blue',
  displayName: 'Blue',
  description: 'Calming blues with neutral backgrounds',
  isDark: false,
  colors: {
    background: 'hsl(210, 100%, 97%)',
    foreground: 'hsl(215, 25%, 27%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(215, 25%, 27%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(215, 25%, 27%)',
    primary: 'hsl(210, 100%, 50%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(210, 40%, 96%)',
    secondaryForeground: 'hsl(215, 25%, 27%)',
    muted: 'hsl(210, 40%, 96%)',
    mutedForeground: 'hsl(215, 16%, 47%)',
    accent: 'hsl(200, 98%, 39%)',
    accentForeground: 'hsl(0, 0%, 100%)',
    destructive: 'hsl(0, 84%, 60%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
    success: 'hsl(142, 76%, 36%)',
    successForeground: 'hsl(0, 0%, 100%)',
    warning: 'hsl(38, 92%, 50%)',
    warningForeground: 'hsl(0, 0%, 100%)',
    info: 'hsl(199, 89%, 48%)',
    infoForeground: 'hsl(0, 0%, 100%)',
    border: 'hsl(210, 50%, 90%)',
    input: 'hsl(210, 50%, 90%)',
    ring: 'hsl(210, 100%, 50%)',
    gradient: 'linear-gradient(135deg, hsl(210, 100%, 50%) 0%, hsl(200, 98%, 39%) 100%)',
  },
};

/**
 * Green Theme - Fresh greens with balanced neutrals
 */
const greenTheme: Theme = {
  name: 'green',
  displayName: 'Green',
  description: 'Fresh greens with balanced neutrals',
  isDark: false,
  colors: {
    background: 'hsl(120, 40%, 97%)',
    foreground: 'hsl(120, 25%, 15%)',
    card: 'hsl(0, 0%, 100%)',
    cardForeground: 'hsl(120, 25%, 15%)',
    popover: 'hsl(0, 0%, 100%)',
    popoverForeground: 'hsl(120, 25%, 15%)',
    primary: 'hsl(142, 76%, 36%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary: 'hsl(120, 40%, 96%)',
    secondaryForeground: 'hsl(120, 25%, 15%)',
    muted: 'hsl(120, 40%, 96%)',
    mutedForeground: 'hsl(120, 16%, 47%)',
    accent: 'hsl(142, 76%, 73%)',
    accentForeground: 'hsl(120, 25%, 15%)',
    destructive: 'hsl(0, 84%, 60%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
    success: 'hsl(142, 76%, 36%)',
    successForeground: 'hsl(0, 0%, 100%)',
    warning: 'hsl(38, 92%, 50%)',
    warningForeground: 'hsl(0, 0%, 100%)',
    info: 'hsl(199, 89%, 48%)',
    infoForeground: 'hsl(0, 0%, 100%)',
    border: 'hsl(120, 30%, 88%)',
    input: 'hsl(120, 30%, 88%)',
    ring: 'hsl(142, 76%, 36%)',
    gradient: 'linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 76%, 73%) 100%)',
  },
};

export const themes: Record<ThemeName, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
  green: greenTheme,
};

export const defaultTheme: ThemeName = 'light';

/**
 * Get theme by name
 */
export function getTheme(name: ThemeName): Theme {
  return themes[name];
}

/**
 * Get all available themes
 */
export function getAllThemes(): Theme[] {
  return Object.values(themes);
}
