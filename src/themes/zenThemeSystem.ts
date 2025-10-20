/**
 * Seventh Path Zen Theme System
 * Tranquil, spiritual theme system for mindful habit tracking
 */

export type ZenThemeName = 'zen-light' | 'zen-dark' | 'zen-calm' | 'zen-meditation';

// Zen Color Palette
export const zenColors = {
  // Primary Palette - Mindfulness Core
  sage: '#A8B5A0',        // Primary calm green
  lavender: '#E6E6FA',    // Secondary spiritual purple
  amber: '#F4E4BC',       // Accent warmth
  mist: '#F5F7F5',        // Background serenity
  stone: '#6B7280',       // Neutral grounding
  
  // Reduced Saturation Variants (15% reduction)
  sageSubtle: '#B5C0B0',     // 15% less saturated
  lavenderSubtle: '#E8E8F2', // 15% less saturated
  amberSubtle: '#F6E8D0',    // 15% less saturated
  mistSubtle: '#F7F9F7',     // 15% less saturated
  stoneSubtle: '#7A7F8A',    // 15% less saturated
  
  // Semantic Colors
  completed: 'linear-gradient(135deg, #A8B5A0 0%, #E6E6FA 100%)',
  inProgress: 'linear-gradient(135deg, #F4E4BC 0%, #A8B5A0 100%)',
  gentleWarning: '#F4E4BC',
  affirming: '#A8B5A0',
} as const;

// Zen Theme Interface
export interface ZenTheme {
  name: ZenThemeName;
  displayName: string;
  description: string;
  isDark: boolean;
  colors: {
    // Backgrounds
    primary: string;
    surface: string;
    surfaceElevated: string;
    card: string;
    cardCompleted: string;
    
    // Text
    primary: string;
    secondary: string;
    muted: string;
    onAccent: string;
    onSage: string;
    
    // Borders
    subtle: string;
    interactive: string;
    focus: string;
    
    // Accents
    sage: string;
    lavender: string;
    amber: string;
    mist: string;
    stone: string;
    
    // Gradients
    completed: string;
    inProgress: string;
    overlayLight: string;
    overlayDark: string;
    
    // Shadows
    innerSoft: string;
    innerGentle: string;
    focusRing: string;
  };
}

// Zen Light Theme
const zenLightTheme: ZenTheme = {
  name: 'zen-light',
  displayName: 'Zen Light',
  description: 'Serene light interface with mindful green accents',
  isDark: false,
  colors: {
    // Backgrounds
    primary: zenColors.mist,
    surface: 'rgba(255, 255, 255, 0.98)',
    surfaceElevated: 'rgba(255, 255, 255, 0.95)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(245, 247, 245, 0.95) 100%)',
    cardCompleted: 'linear-gradient(135deg, rgba(168, 181, 160, 0.08) 0%, rgba(230, 230, 250, 0.08) 100%)',
    
    // Text
    textPrimary: '#2D3748',
    textSecondary: '#4A5568',
    textMuted: '#718096',
    textOnAccent: '#FFFFFF',
    textOnSage: '#2D3748',
    
    // Borders
    subtle: 'rgba(168, 181, 160, 0.1)',
    interactive: 'rgba(168, 181, 160, 0.2)',
    focus: zenColors.sage,
    
    // Accents
    sage: zenColors.sage,
    lavender: zenColors.lavender,
    amber: zenColors.amber,
    mist: zenColors.mist,
    stone: zenColors.stone,
    
    // Gradients
    completed: zenColors.completed,
    inProgress: zenColors.inProgress,
    overlayLight: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(168, 181, 160, 0.05) 100%)',
    overlayDark: 'linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(168, 181, 160, 0.1) 100%)',
    
    // Shadows
    innerSoft: 'inset 0 1px 3px rgba(168, 181, 160, 0.1)',
    innerGentle: 'inset 0 2px 4px rgba(168, 181, 160, 0.08)',
    focusRing: '0 0 0 3px rgba(168, 181, 160, 0.12)',
  },
};

// Zen Dark Theme
const zenDarkTheme: ZenTheme = {
  name: 'zen-dark',
  displayName: 'Zen Dark',
  description: 'Peaceful dark interface with gentle green highlights',
  isDark: true,
  colors: {
    // Backgrounds
    primary: '#1A202C',
    surface: 'rgba(26, 32, 44, 0.98)',
    surfaceElevated: 'rgba(26, 32, 44, 0.95)',
    card: 'linear-gradient(135deg, rgba(26, 32, 44, 0.98) 0%, rgba(45, 55, 72, 0.95) 100%)',
    cardCompleted: 'linear-gradient(135deg, rgba(168, 181, 160, 0.12) 0%, rgba(230, 230, 250, 0.08) 100%)',
    
    // Text
    textPrimary: '#F7FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#A0AEC0',
    textOnAccent: '#FFFFFF',
    textOnSage: '#F7FAFC',
    
    // Borders
    subtle: 'rgba(168, 181, 160, 0.15)',
    interactive: 'rgba(168, 181, 160, 0.25)',
    focus: zenColors.sage,
    
    // Accents
    sage: zenColors.sage,
    lavender: zenColors.lavender,
    amber: zenColors.amber,
    mist: zenColors.mist,
    stone: zenColors.stone,
    
    // Gradients
    completed: zenColors.completed,
    inProgress: zenColors.inProgress,
    overlayLight: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(168, 181, 160, 0.08) 100%)',
    overlayDark: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(168, 181, 160, 0.15) 100%)',
    
    // Shadows
    innerSoft: 'inset 0 1px 3px rgba(168, 181, 160, 0.15)',
    innerGentle: 'inset 0 2px 4px rgba(168, 181, 160, 0.12)',
    focusRing: '0 0 0 3px rgba(168, 181, 160, 0.15)',
  },
};

// Zen Calm Theme
const zenCalmTheme: ZenTheme = {
  name: 'zen-calm',
  displayName: 'Zen Calm',
  description: 'Ultra-gentle interface for meditation and mindfulness',
  isDark: false,
  colors: {
    // Backgrounds
    primary: '#F8FAFC',
    surface: 'rgba(248, 250, 252, 0.98)',
    surfaceElevated: 'rgba(248, 250, 252, 0.95)',
    card: 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(245, 247, 245, 0.95) 100%)',
    cardCompleted: 'linear-gradient(135deg, rgba(168, 181, 160, 0.06) 0%, rgba(230, 230, 250, 0.06) 100%)',
    
    // Text
    textPrimary: '#1A202C',
    textSecondary: '#2D3748',
    textMuted: '#4A5568',
    textOnAccent: '#FFFFFF',
    textOnSage: '#1A202C',
    
    // Borders
    subtle: 'rgba(168, 181, 160, 0.08)',
    interactive: 'rgba(168, 181, 160, 0.15)',
    focus: zenColors.sageSubtle,
    
    // Accents
    sage: zenColors.sageSubtle,
    lavender: zenColors.lavenderSubtle,
    amber: zenColors.amberSubtle,
    mist: zenColors.mistSubtle,
    stone: zenColors.stoneSubtle,
    
    // Gradients
    completed: 'linear-gradient(135deg, #B5C0B0 0%, #E8E8F2 100%)',
    inProgress: 'linear-gradient(135deg, #F6E8D0 0%, #B5C0B0 100%)',
    overlayLight: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(181, 192, 176, 0.03) 100%)',
    overlayDark: 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(181, 192, 176, 0.05) 100%)',
    
    // Shadows
    innerSoft: 'inset 0 1px 3px rgba(181, 192, 176, 0.08)',
    innerGentle: 'inset 0 2px 4px rgba(181, 192, 176, 0.06)',
    focusRing: '0 0 0 3px rgba(181, 192, 176, 0.1)',
  },
};

// Zen Meditation Theme
const zenMeditationTheme: ZenTheme = {
  name: 'zen-meditation',
  displayName: 'Zen Meditation',
  description: 'Deep, contemplative interface for focused meditation',
  isDark: true,
  colors: {
    // Backgrounds
    primary: '#0F1419',
    surface: 'rgba(15, 20, 25, 0.98)',
    surfaceElevated: 'rgba(15, 20, 25, 0.95)',
    card: 'linear-gradient(135deg, rgba(15, 20, 25, 0.98) 0%, rgba(26, 32, 44, 0.95) 100%)',
    cardCompleted: 'linear-gradient(135deg, rgba(168, 181, 160, 0.08) 0%, rgba(230, 230, 250, 0.06) 100%)',
    
    // Text
    textPrimary: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textOnAccent: '#FFFFFF',
    textOnSage: '#F1F5F9',
    
    // Borders
    subtle: 'rgba(168, 181, 160, 0.1)',
    interactive: 'rgba(168, 181, 160, 0.2)',
    focus: zenColors.sage,
    
    // Accents
    sage: zenColors.sage,
    lavender: zenColors.lavender,
    amber: zenColors.amber,
    mist: zenColors.mist,
    stone: zenColors.stone,
    
    // Gradients
    completed: zenColors.completed,
    inProgress: zenColors.inProgress,
    overlayLight: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(168, 181, 160, 0.05) 100%)',
    overlayDark: 'linear-gradient(135deg, rgba(0, 0, 0, 0.15) 0%, rgba(168, 181, 160, 0.1) 100%)',
    
    // Shadows
    innerSoft: 'inset 0 1px 3px rgba(168, 181, 160, 0.1)',
    innerGentle: 'inset 0 2px 4px rgba(168, 181, 160, 0.08)',
    focusRing: '0 0 0 3px rgba(168, 181, 160, 0.12)',
  },
};

// Theme Registry
export const zenThemes: Record<ZenThemeName, ZenTheme> = {
  'zen-light': zenLightTheme,
  'zen-dark': zenDarkTheme,
  'zen-calm': zenCalmTheme,
  'zen-meditation': zenMeditationTheme,
};

// Default Theme
export const defaultZenTheme: ZenThemeName = 'zen-light';

// Get Theme by Name
export function getZenTheme(name: ZenThemeName): ZenTheme {
  return zenThemes[name] || zenThemes[defaultZenTheme];
}

// Get All Available Themes
export function getAllZenThemes(): ZenTheme[] {
  return Object.values(zenThemes);
}

// Generate CSS Variables from Theme
export function generateZenCSSVariables(theme: ZenTheme): Record<string, string> {
  const cssVars: Record<string, string> = {};
  
  // Background Colors
  cssVars['--zen-bg-primary'] = theme.colors.primary;
  cssVars['--zen-bg-surface'] = theme.colors.surface;
  cssVars['--zen-bg-surface-elevated'] = theme.colors.surfaceElevated;
  cssVars['--zen-bg-card'] = theme.colors.card;
  cssVars['--zen-bg-card-completed'] = theme.colors.cardCompleted;
  
  // Text Colors
  cssVars['--zen-text-primary'] = theme.colors.textPrimary;
  cssVars['--zen-text-secondary'] = theme.colors.textSecondary;
  cssVars['--zen-text-muted'] = theme.colors.textMuted;
  cssVars['--zen-text-on-accent'] = theme.colors.textOnAccent;
  cssVars['--zen-text-on-sage'] = theme.colors.textOnSage;
  
  // Border Colors
  cssVars['--zen-border-subtle'] = theme.colors.subtle;
  cssVars['--zen-border-interactive'] = theme.colors.interactive;
  cssVars['--zen-border-focus'] = theme.colors.focus;
  
  // Accent Colors
  cssVars['--zen-sage'] = theme.colors.sage;
  cssVars['--zen-lavender'] = theme.colors.lavender;
  cssVars['--zen-amber'] = theme.colors.amber;
  cssVars['--zen-mist'] = theme.colors.mist;
  cssVars['--zen-stone'] = theme.colors.stone;
  
  // Gradients
  cssVars['--zen-gradient-completed'] = theme.colors.completed;
  cssVars['--zen-gradient-in-progress'] = theme.colors.inProgress;
  cssVars['--zen-gradient-overlay-light'] = theme.colors.overlayLight;
  cssVars['--zen-gradient-overlay-dark'] = theme.colors.overlayDark;
  
  // Shadows
  cssVars['--zen-shadow-inner-soft'] = theme.colors.innerSoft;
  cssVars['--zen-shadow-inner-gentle'] = theme.colors.innerGentle;
  cssVars['--zen-shadow-focus-ring'] = theme.colors.focusRing;
  
  return cssVars;
}

// Apply Theme to DOM
export function applyZenThemeToDOM(theme: ZenTheme): void {
  const root = document.documentElement;
  const cssVars = generateZenCSSVariables(theme);
  
  // Apply all CSS variables
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Apply theme class
  root.className = root.className.replace(/zen-theme-\w+/g, '');
  root.classList.add(`zen-theme-${theme.name}`);
  
  // Set data attributes
  root.setAttribute('data-zen-theme', theme.name);
  root.setAttribute('data-zen-theme-dark', theme.isDark.toString());
}

// Calm Mode Support
export function applyCalmMode(enabled: boolean): void {
  const root = document.documentElement;
  if (enabled) {
    root.setAttribute('data-calm-mode', 'true');
  } else {
    root.removeAttribute('data-calm-mode');
  }
}

// Check if Calm Mode is Enabled
export function isCalmModeEnabled(): boolean {
  return document.documentElement.hasAttribute('data-calm-mode');
}

// Theme Transition Support
export function applyThemeTransition(duration: number = 400): void {
  const root = document.documentElement;
  root.style.setProperty('--theme-transition-duration', `${duration}ms`);
}

// Remove Theme Transition
export function removeThemeTransition(): void {
  const root = document.documentElement;
  root.style.removeProperty('--theme-transition-duration');
}
