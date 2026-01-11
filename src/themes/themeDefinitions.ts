/**
 * Emerald Night Theme - The Single Default Theme for Seventh Path
 * A deep, sophisticated dark theme with emerald accents
 */

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
  name: string;
  displayName: string;
  description: string;
  colors: ThemeColors;
}

/**
 * Emerald Night - The one and only theme
 * Deep slate backgrounds with vibrant emerald accents for a sophisticated, modern look
 */
const emeraldNightTheme: Theme = {
  name: 'emerald-night',
  displayName: 'Emerald Night',
  description: 'Deep slate with vibrant emerald accents',
  colors: {
    // Base - Deep dark background (#0C1117)
    background: '#0C1117',
    foreground: '#E6E8EC',

    // Surface - Slightly lighter for cards
    card: '#1a1f26',
    cardForeground: '#E6E8EC',
    popover: '#1a1f26',
    popoverForeground: '#E6E8EC',

    // Primary - Vibrant emerald for main actions
    primary: '#10B981',
    primaryForeground: '#ffffff',

    // Secondary - Subtle dark gray
    secondary: '#2a3441',
    secondaryForeground: '#E6E8EC',

    // Muted - For less prominent elements
    muted: '#2a3441',
    mutedForeground: '#9CA3AF',

    // Accent - Emerald for highlights
    accent: '#10B981',
    accentForeground: '#ffffff',

    // Semantic colors
    destructive: '#EF4444',
    destructiveForeground: '#ffffff',
    success: '#10B981',
    successForeground: '#ffffff',
    warning: '#F59E0B',
    warningForeground: '#000000',
    info: '#3B82F6',
    infoForeground: '#ffffff',

    // UI elements - Subtle borders
    border: 'rgba(255, 255, 255, 0.12)',
    input: '#2a3441',
    ring: '#10B981',

    // Gradient
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  },
};

/**
 * Default theme - always Emerald Night
 */
export const defaultTheme: Theme = emeraldNightTheme;

/**
 * Get the default theme (always returns Emerald Night)
 */
export function getTheme(): Theme {
  return defaultTheme;
}
