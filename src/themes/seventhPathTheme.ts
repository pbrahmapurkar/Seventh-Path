/**
 * Seventh Path Design System - TypeScript Token System
 * 
 * Type-safe design tokens for use in React components.
 * These values mirror the CSS custom properties in seventh-path-ds.css
 */

// ============================================
// COLOR TOKENS
// ============================================

export const colors = {
    // Core Backgrounds
    bg: {
        primary: '#0A0E14',
        secondary: '#0F1419',
        tertiary: '#151C24',
    },

    // Card Backgrounds (with opacity)
    card: {
        default: 'rgba(26, 36, 50, 0.7)',
        hover: 'rgba(30, 42, 58, 0.75)',
        active: 'rgba(36, 48, 64, 0.85)',
        secondary: 'rgba(26, 36, 50, 0.5)',
    },

    // Borders
    border: {
        subtle: 'rgba(42, 58, 74, 0.4)',
        default: 'rgba(58, 74, 90, 0.5)',
        accent: 'rgba(16, 185, 129, 0.3)',
    },

    // Accent Colors
    accent: {
        primary: '#10B981',
        primarySoft: 'rgba(16, 185, 129, 0.15)',
        secondary: '#D4AF37',
    },

    // Text Colors
    text: {
        primary: 'rgba(255, 255, 255, 0.95)',
        secondary: '#94A3B8',
        muted: '#64748B',
        disabled: '#475569',
    },

    // Semantic Colors (Intentionally Muted)
    semantic: {
        success: 'rgba(16, 185, 129, 0.8)',
        warning: 'rgba(245, 158, 11, 0.6)',
        error: 'rgba(248, 113, 113, 0.7)',
        info: 'rgba(96, 165, 250, 0.6)',
    },
} as const;

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

export const typography = {
    fontFamily: {
        primary: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        fallback: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    },

    fontSize: {
        display: 32,
        headline: 24,
        title: 18,
        body: 16,
        bodySm: 14,
        caption: 12,
        overline: 11,
    },

    fontWeight: {
        regular: 400,
        medium: 500,
        semibold: 600,
    },

    lineHeight: {
        tight: 1.2,
        snug: 1.3,
        normal: 1.4,
        relaxed: 1.5,
    },

    letterSpacing: {
        tight: '-0.02em',
        snug: '-0.015em',
        normal: '0',
        wide: '0.01em',
        wider: '0.08em',
    },
} as const;

// ============================================
// SPACING TOKENS (4px base unit)
// ============================================

export const spacing = {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,

    // Semantic spacing
    screen: {
        paddingX: 20,
        paddingTop: 48,
        paddingBottom: 34,
    },
} as const;

// ============================================
// BORDER RADIUS TOKENS
// ============================================

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
} as const;

// ============================================
// MOTION TOKENS
// ============================================

export const motion = {
    duration: {
        instant: 100,
        fast: 200,
        normal: 300,
        slow: 400,
        deliberate: 600,
    },

    easing: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
} as const;

// ============================================
// ICON SIZES
// ============================================

export const iconSizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,

    // Container sizes (icon + 20px)
    containerMd: 44,
    containerLg: 52,
} as const;

// ============================================
// COMPONENT SIZING
// ============================================

export const componentSizing = {
    touchTarget: 44,
    touchTargetLg: 52,

    button: {
        heightPrimary: 52,
        heightSecondary: 48,
        heightGhost: 44,
    },

    header: {
        height: 56,
    },
} as const;

// ============================================
// THEME OBJECT (Combined Export)
// ============================================

export const theme = {
    colors,
    typography,
    spacing,
    radius,
    motion,
    iconSizes,
    componentSizing,
} as const;

// ============================================
// TYPE EXPORTS
// ============================================

export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Motion = typeof motion;
export type IconSizes = typeof iconSizes;
export type ComponentSizing = typeof componentSizing;
export type Theme = typeof theme;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get a CSS variable reference for use in inline styles
 */
export function cssVar(name: string): string {
    return `var(--sp-${name})`;
}

/**
 * Convert a spacing token to pixels
 */
export function px(value: number): string {
    return `${value}px`;
}

/**
 * Create a transition string using design system tokens
 */
export function transition(
    property: string = 'all',
    duration: keyof typeof motion.duration = 'fast',
    easing: keyof typeof motion.easing = 'out'
): string {
    return `${property} ${motion.duration[duration]}ms ${motion.easing[easing]}`;
}

/**
 * Helper to apply text styles
 */
export function textStyle(variant: 'display' | 'headline' | 'title' | 'body' | 'bodySm' | 'caption' | 'overline') {
    const styles: Record<string, React.CSSProperties> = {
        display: {
            fontSize: typography.fontSize.display,
            fontWeight: typography.fontWeight.semibold,
            lineHeight: typography.lineHeight.tight,
            letterSpacing: typography.letterSpacing.tight,
            color: colors.text.primary,
        },
        headline: {
            fontSize: typography.fontSize.headline,
            fontWeight: typography.fontWeight.semibold,
            lineHeight: typography.lineHeight.snug,
            letterSpacing: typography.letterSpacing.snug,
            color: colors.text.primary,
        },
        title: {
            fontSize: typography.fontSize.title,
            fontWeight: typography.fontWeight.medium,
            lineHeight: typography.lineHeight.normal,
            letterSpacing: typography.letterSpacing.snug,
            color: colors.text.primary,
        },
        body: {
            fontSize: typography.fontSize.body,
            fontWeight: typography.fontWeight.regular,
            lineHeight: typography.lineHeight.relaxed,
            letterSpacing: typography.letterSpacing.normal,
            color: colors.text.primary,
        },
        bodySm: {
            fontSize: typography.fontSize.bodySm,
            fontWeight: typography.fontWeight.regular,
            lineHeight: typography.lineHeight.relaxed,
            letterSpacing: typography.letterSpacing.wide,
            color: colors.text.secondary,
        },
        caption: {
            fontSize: typography.fontSize.caption,
            fontWeight: typography.fontWeight.regular,
            lineHeight: typography.lineHeight.normal,
            letterSpacing: typography.letterSpacing.wide,
            color: colors.text.muted,
        },
        overline: {
            fontSize: typography.fontSize.overline,
            fontWeight: typography.fontWeight.medium,
            lineHeight: typography.lineHeight.snug,
            letterSpacing: typography.letterSpacing.wider,
            textTransform: 'uppercase' as const,
            color: colors.text.muted,
        },
    };

    return styles[variant];
}

/**
 * Helper to get card background styles
 */
export function cardStyle(variant: 'primary' | 'secondary' = 'primary') {
    if (variant === 'secondary') {
        return {
            background: colors.card.secondary,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: radius.md,
        };
    }

    return {
        background: colors.card.default,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: radius.lg,
    };
}

// Default export
export default theme;
