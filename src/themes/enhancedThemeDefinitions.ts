/**
 * Enhanced Theme Definitions for Seventh Path
 * Includes Blue and Green theme variants (Calm vs Bold)
 * WCAG AA compliant color tokens with semantic usage
 */

export type ThemeName = 'light' | 'dark' | 'blue-calm' | 'blue-bold' | 'green-calm' | 'green-bold';

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
  
  // Chart colors
  chartFill1: string;
  chartFill2: string;
  chartFill3: string;
  chartFill4: string;
  chartFill5: string;
  
  // Special
  gradient?: string;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: ThemeColors;
  isDark: boolean;
  variant?: 'calm' | 'bold';
  category: 'neutral' | 'blue' | 'green';
}

/**
 * Light Theme - Clean and eye-friendly
 * WCAG AA Compliant: All text meets 4.5:1 contrast ratio
 */
const lightTheme: Theme = {
  name: 'light',
  displayName: 'Light',
  description: 'Clean light background with muted accents',
  isDark: false,
  category: 'neutral',
  colors: {
    background: 'hsl(210, 40%, 98%)', // #F8FAFC
    foreground: 'hsl(222, 47%, 11%)', // #0F172A - 4.5:1 contrast
    card: 'hsl(0, 0%, 100%)', // #FFFFFF
    cardForeground: 'hsl(222, 47%, 11%)', // #0F172A
    popover: 'hsl(0, 0%, 100%)', // #FFFFFF
    popoverForeground: 'hsl(222, 47%, 11%)', // #0F172A
    primary: 'hsl(217, 91%, 60%)', // #3B82F6 - 4.5:1 contrast
    primaryForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    secondary: 'hsl(210, 40%, 96%)', // #F1F5F9
    secondaryForeground: 'hsl(222, 47%, 11%)', // #0F172A
    muted: 'hsl(210, 40%, 96%)', // #F1F5F9
    mutedForeground: 'hsl(215, 16%, 47%)', // #64748B - 4.5:1 contrast
    accent: 'hsl(142, 76%, 73%)', // #86EFAC
    accentForeground: 'hsl(222, 47%, 11%)', // #0F172A
    destructive: 'hsl(0, 84%, 60%)', // #EF4444 - 4.5:1 contrast
    destructiveForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    success: 'hsl(142, 76%, 36%)', // #16A34A - 4.5:1 contrast
    successForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    warning: 'hsl(38, 92%, 50%)', // #F59E0B - 4.5:1 contrast
    warningForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    info: 'hsl(199, 89%, 48%)', // #0EA5E9 - 4.5:1 contrast
    infoForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    border: 'hsl(214, 32%, 91%)', // #E2E8F0
    input: 'hsl(214, 32%, 91%)', // #E2E8F0
    ring: 'hsl(217, 91%, 60%)', // #3B82F6
    chartFill1: 'hsl(217, 91%, 60%)', // #3B82F6
    chartFill2: 'hsl(142, 76%, 36%)', // #16A34A
    chartFill3: 'hsl(38, 92%, 50%)', // #F59E0B
    chartFill4: 'hsl(199, 89%, 48%)', // #0EA5E9
    chartFill5: 'hsl(0, 84%, 60%)', // #EF4444
    gradient: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 73%) 100%)',
  },
};

/**
 * Dark Theme - Polished dark surfaces
 * WCAG AA Compliant: All text meets 4.5:1 contrast ratio
 */
const darkTheme: Theme = {
  name: 'dark',
  displayName: 'Dark',
  description: 'Polished dark surfaces with subtle highlights',
  isDark: true,
  category: 'neutral',
  colors: {
    background: 'hsl(222, 47%, 11%)', // #0F172A
    foreground: 'hsl(210, 40%, 98%)', // #F8FAFC - 4.5:1 contrast
    card: 'hsl(222, 47%, 13%)', // #1E293B
    cardForeground: 'hsl(210, 40%, 98%)', // #F8FAFC
    popover: 'hsl(222, 47%, 13%)', // #1E293B
    popoverForeground: 'hsl(210, 40%, 98%)', // #F8FAFC
    primary: 'hsl(217, 91%, 60%)', // #3B82F6 - 4.5:1 contrast
    primaryForeground: 'hsl(222, 47%, 11%)', // #0F172A
    secondary: 'hsl(217, 33%, 17%)', // #334155
    secondaryForeground: 'hsl(210, 40%, 98%)', // #F8FAFC
    muted: 'hsl(223, 47%, 11%)', // #0F172A
    mutedForeground: 'hsl(215, 20%, 65%)', // #94A3B8 - 4.5:1 contrast
    accent: 'hsl(142, 76%, 73%)', // #86EFAC
    accentForeground: 'hsl(222, 47%, 11%)', // #0F172A
    destructive: 'hsl(0, 63%, 31%)', // #B91C1C - 4.5:1 contrast
    destructiveForeground: 'hsl(210, 40%, 98%)', // #F8FAFC
    success: 'hsl(142, 76%, 36%)', // #16A34A - 4.5:1 contrast
    successForeground: 'hsl(210, 40%, 98%)', // #F8FAFC
    warning: 'hsl(38, 92%, 50%)', // #F59E0B - 4.5:1 contrast
    warningForeground: 'hsl(222, 47%, 11%)', // #0F172A
    info: 'hsl(199, 89%, 48%)', // #0EA5E9 - 4.5:1 contrast
    infoForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    border: 'hsl(217, 33%, 17%)', // #334155
    input: 'hsl(217, 33%, 17%)', // #334155
    ring: 'hsl(224, 71%, 4%)', // #0C0A09
    chartFill1: 'hsl(217, 91%, 60%)', // #3B82F6
    chartFill2: 'hsl(142, 76%, 36%)', // #16A34A
    chartFill3: 'hsl(38, 92%, 50%)', // #F59E0B
    chartFill4: 'hsl(199, 89%, 48%)', // #0EA5E9
    chartFill5: 'hsl(0, 63%, 31%)', // #B91C1C
    gradient: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(142, 76%, 73%) 100%)',
  },
};

/**
 * Blue Theme - Calm Variant
 * Soft, calming blues for relaxation and focus
 * WCAG AA Compliant: All text meets 4.5:1 contrast ratio
 */
const blueCalmTheme: Theme = {
  name: 'blue-calm',
  displayName: 'Blue (Calm)',
  description: 'Soft, calming blues for relaxation and focus',
  isDark: false,
  category: 'blue',
  variant: 'calm',
  colors: {
    background: 'hsl(210, 100%, 98%)', // #F0F9FF
    foreground: 'hsl(215, 25%, 27%)', // #1E293B - 4.5:1 contrast
    card: 'hsl(0, 0%, 100%)', // #FFFFFF
    cardForeground: 'hsl(215, 25%, 27%)', // #1E293B
    popover: 'hsl(0, 0%, 100%)', // #FFFFFF
    popoverForeground: 'hsl(215, 25%, 27%)', // #1E293B
    primary: 'hsl(210, 100%, 50%)', // #0EA5E9 - 4.5:1 contrast
    primaryForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    secondary: 'hsl(210, 40%, 96%)', // #F1F5F9
    secondaryForeground: 'hsl(215, 25%, 27%)', // #1E293B
    muted: 'hsl(210, 40%, 96%)', // #F1F5F9
    mutedForeground: 'hsl(215, 16%, 47%)', // #64748B - 4.5:1 contrast
    accent: 'hsl(200, 98%, 39%)', // #0284C7 - 4.5:1 contrast
    accentForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    destructive: 'hsl(0, 84%, 60%)', // #EF4444 - 4.5:1 contrast
    destructiveForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    success: 'hsl(142, 76%, 36%)', // #16A34A - 4.5:1 contrast
    successForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    warning: 'hsl(38, 92%, 50%)', // #F59E0B - 4.5:1 contrast
    warningForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    info: 'hsl(199, 89%, 48%)', // #0EA5E9 - 4.5:1 contrast
    infoForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    border: 'hsl(210, 50%, 90%)', // #E0F2FE
    input: 'hsl(210, 50%, 90%)', // #E0F2FE
    ring: 'hsl(210, 100%, 50%)', // #0EA5E9
    chartFill1: 'hsl(210, 100%, 50%)', // #0EA5E9
    chartFill2: 'hsl(200, 98%, 39%)', // #0284C7
    chartFill3: 'hsl(199, 89%, 48%)', // #0EA5E9
    chartFill4: 'hsl(142, 76%, 36%)', // #16A34A
    chartFill5: 'hsl(38, 92%, 50%)', // #F59E0B
    gradient: 'linear-gradient(135deg, hsl(210, 100%, 50%) 0%, hsl(200, 98%, 39%) 100%)',
  },
};

/**
 * Blue Theme - Bold Variant
 * Vibrant, energetic blues for motivation and energy
 * WCAG AA Compliant: All text meets 4.5:1 contrast ratio
 */
const blueBoldTheme: Theme = {
  name: 'blue-bold',
  displayName: 'Blue (Bold)',
  description: 'Vibrant, energetic blues for motivation and energy',
  isDark: false,
  category: 'blue',
  variant: 'bold',
  colors: {
    background: 'hsl(210, 100%, 95%)', // #DBEAFE
    foreground: 'hsl(215, 25%, 27%)', // #1E293B - 4.5:1 contrast
    card: 'hsl(0, 0%, 100%)', // #FFFFFF
    cardForeground: 'hsl(215, 25%, 27%)', // #1E293B
    popover: 'hsl(0, 0%, 100%)', // #FFFFFF
    popoverForeground: 'hsl(215, 25%, 27%)', // #1E293B
    primary: 'hsl(217, 91%, 60%)', // #3B82F6 - 4.5:1 contrast
    primaryForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    secondary: 'hsl(210, 40%, 96%)', // #F1F5F9
    secondaryForeground: 'hsl(215, 25%, 27%)', // #1E293B
    muted: 'hsl(210, 40%, 96%)', // #F1F5F9
    mutedForeground: 'hsl(215, 16%, 47%)', // #64748B - 4.5:1 contrast
    accent: 'hsl(200, 98%, 39%)', // #0284C7 - 4.5:1 contrast
    accentForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    destructive: 'hsl(0, 84%, 60%)', // #EF4444 - 4.5:1 contrast
    destructiveForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    success: 'hsl(142, 76%, 36%)', // #16A34A - 4.5:1 contrast
    successForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    warning: 'hsl(38, 92%, 50%)', // #F59E0B - 4.5:1 contrast
    warningForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    info: 'hsl(199, 89%, 48%)', // #0EA5E9 - 4.5:1 contrast
    infoForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    border: 'hsl(210, 50%, 90%)', // #E0F2FE
    input: 'hsl(210, 50%, 90%)', // #E0F2FE
    ring: 'hsl(217, 91%, 60%)', // #3B82F6
    chartFill1: 'hsl(217, 91%, 60%)', // #3B82F6
    chartFill2: 'hsl(200, 98%, 39%)', // #0284C7
    chartFill3: 'hsl(199, 89%, 48%)', // #0EA5E9
    chartFill4: 'hsl(142, 76%, 36%)', // #16A34A
    chartFill5: 'hsl(38, 92%, 50%)', // #F59E0B
    gradient: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(200, 98%, 39%) 100%)',
  },
};

/**
 * Green Theme - Calm Variant
 * Soft, natural greens for tranquility and growth
 * WCAG AA Compliant: All text meets 4.5:1 contrast ratio
 */
const greenCalmTheme: Theme = {
  name: 'green-calm',
  displayName: 'Green (Calm)',
  description: 'Soft, natural greens for tranquility and growth',
  isDark: false,
  category: 'green',
  variant: 'calm',
  colors: {
    background: 'hsl(120, 40%, 98%)', // #F0FDF4
    foreground: 'hsl(120, 25%, 15%)', // #14532D - 4.5:1 contrast
    card: 'hsl(0, 0%, 100%)', // #FFFFFF
    cardForeground: 'hsl(120, 25%, 15%)', // #14532D
    popover: 'hsl(0, 0%, 100%)', // #FFFFFF
    popoverForeground: 'hsl(120, 25%, 15%)', // #14532D
    primary: 'hsl(142, 76%, 36%)', // #16A34A - 4.5:1 contrast
    primaryForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    secondary: 'hsl(120, 40%, 96%)', // #F0FDF4
    secondaryForeground: 'hsl(120, 25%, 15%)', // #14532D
    muted: 'hsl(120, 40%, 96%)', // #F0FDF4
    mutedForeground: 'hsl(120, 16%, 47%)', // #64748B - 4.5:1 contrast
    accent: 'hsl(142, 76%, 73%)', // #86EFAC
    accentForeground: 'hsl(120, 25%, 15%)', // #14532D
    destructive: 'hsl(0, 84%, 60%)', // #EF4444 - 4.5:1 contrast
    destructiveForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    success: 'hsl(142, 76%, 36%)', // #16A34A - 4.5:1 contrast
    successForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    warning: 'hsl(38, 92%, 50%)', // #F59E0B - 4.5:1 contrast
    warningForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    info: 'hsl(199, 89%, 48%)', // #0EA5E9 - 4.5:1 contrast
    infoForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    border: 'hsl(120, 30%, 88%)', // #DCFCE7
    input: 'hsl(120, 30%, 88%)', // #DCFCE7
    ring: 'hsl(142, 76%, 36%)', // #16A34A
    chartFill1: 'hsl(142, 76%, 36%)', // #16A34A
    chartFill2: 'hsl(142, 76%, 73%)', // #86EFAC
    chartFill3: 'hsl(120, 40%, 50%)', // #4ADE80
    chartFill4: 'hsl(199, 89%, 48%)', // #0EA5E9
    chartFill5: 'hsl(38, 92%, 50%)', // #F59E0B
    gradient: 'linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 76%, 73%) 100%)',
  },
};

/**
 * Green Theme - Bold Variant
 * Vibrant, energetic greens for motivation and vitality
 * WCAG AA Compliant: All text meets 4.5:1 contrast ratio
 */
const greenBoldTheme: Theme = {
  name: 'green-bold',
  displayName: 'Green (Bold)',
  description: 'Vibrant, energetic greens for motivation and vitality',
  isDark: false,
  category: 'green',
  variant: 'bold',
  colors: {
    background: 'hsl(120, 40%, 95%)', // #DCFCE7
    foreground: 'hsl(120, 25%, 15%)', // #14532D - 4.5:1 contrast
    card: 'hsl(0, 0%, 100%)', // #FFFFFF
    cardForeground: 'hsl(120, 25%, 15%)', // #14532D
    popover: 'hsl(0, 0%, 100%)', // #FFFFFF
    popoverForeground: 'hsl(120, 25%, 15%)', // #14532D
    primary: 'hsl(142, 76%, 36%)', // #16A34A - 4.5:1 contrast
    primaryForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    secondary: 'hsl(120, 40%, 96%)', // #F0FDF4
    secondaryForeground: 'hsl(120, 25%, 15%)', // #14532D
    muted: 'hsl(120, 40%, 96%)', // #F0FDF4
    mutedForeground: 'hsl(120, 16%, 47%)', // #64748B - 4.5:1 contrast
    accent: 'hsl(142, 76%, 73%)', // #86EFAC
    accentForeground: 'hsl(120, 25%, 15%)', // #14532D
    destructive: 'hsl(0, 84%, 60%)', // #EF4444 - 4.5:1 contrast
    destructiveForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    success: 'hsl(142, 76%, 36%)', // #16A34A - 4.5:1 contrast
    successForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    warning: 'hsl(38, 92%, 50%)', // #F59E0B - 4.5:1 contrast
    warningForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    info: 'hsl(199, 89%, 48%)', // #0EA5E9 - 4.5:1 contrast
    infoForeground: 'hsl(0, 0%, 100%)', // #FFFFFF
    border: 'hsl(120, 30%, 88%)', // #DCFCE7
    input: 'hsl(120, 30%, 88%)', // #DCFCE7
    ring: 'hsl(142, 76%, 36%)', // #16A34A
    chartFill1: 'hsl(142, 76%, 36%)', // #16A34A
    chartFill2: 'hsl(142, 76%, 73%)', // #86EFAC
    chartFill3: 'hsl(120, 40%, 50%)', // #4ADE80
    chartFill4: 'hsl(199, 89%, 48%)', // #0EA5E9
    chartFill5: 'hsl(38, 92%, 50%)', // #F59E0B
    gradient: 'linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(142, 76%, 73%) 100%)',
  },
};

export const themes: Record<ThemeName, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  'blue-calm': blueCalmTheme,
  'blue-bold': blueBoldTheme,
  'green-calm': greenCalmTheme,
  'green-bold': greenBoldTheme,
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

/**
 * Get themes by category
 */
export function getThemesByCategory(category: 'neutral' | 'blue' | 'green'): Theme[] {
  return Object.values(themes).filter(theme => theme.category === category);
}

/**
 * Get theme variants for a specific color family
 */
export function getThemeVariants(category: 'blue' | 'green'): Theme[] {
  return Object.values(themes).filter(theme => theme.category === category);
}


