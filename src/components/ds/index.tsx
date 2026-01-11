/**
 * Seventh Path Design System - React Component Primitives
 * 
 * Reusable UI components implementing the design system.
 * These components use the CSS classes from seventh-path-ds.css
 */

import React, { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// TEXT COMPONENTS
// ============================================

interface TextProps extends HTMLAttributes<HTMLElement> {
    variant?: 'display' | 'headline' | 'title' | 'body' | 'body-sm' | 'caption' | 'overline';
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
    children: React.ReactNode;
}

export const Text = forwardRef<HTMLElement, TextProps>(
    ({ variant = 'body', as = 'p', className, children, ...props }, ref) => {
        const Component = as;
        const variantClass = `sp-${variant}`;

        return (
            <Component
                ref={ref as any}
                className={cn(variantClass, className)}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Text.displayName = 'Text';

// ============================================
// BUTTON COMPONENTS
// ============================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        variant = 'primary',
        size = 'default',
        isLoading = false,
        leftIcon,
        rightIcon,
        className,
        children,
        disabled,
        ...props
    }, ref) => {
        const variantClasses = {
            primary: 'sp-button sp-button-primary',
            secondary: 'sp-button sp-button-secondary',
            ghost: 'sp-button sp-button-ghost',
        };

        return (
            <button
                ref={ref}
                className={cn(variantClasses[variant], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <span className="sp-animate-pulse" aria-label="Loading">●</span>
                ) : (
                    <>
                        {leftIcon && <span className="sp-button-icon">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="sp-button-icon">{rightIcon}</span>}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

// ============================================
// CARD COMPONENTS
// ============================================

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'primary' | 'secondary';
    isCompleted?: boolean;
    isInteractive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({
        variant = 'primary',
        isCompleted = false,
        isInteractive = false,
        className,
        children,
        ...props
    }, ref) => {
        const baseClass = variant === 'secondary' ? 'sp-card-secondary' : 'sp-card';

        return (
            <div
                ref={ref}
                className={cn(
                    baseClass,
                    isCompleted && 'sp-card--completed',
                    isInteractive && 'cursor-pointer',
                    className
                )}
                role={isInteractive ? 'button' : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// ============================================
// HABIT CARD COMPONENT
// ============================================

interface HabitCardProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    subtitle?: string;
    isCompleted?: boolean;
    accentColor?: string;
    onToggle?: () => void;
    leftElement?: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const HabitCard = forwardRef<HTMLDivElement, HabitCardProps>(
    ({
        title,
        subtitle,
        isCompleted = false,
        accentColor,
        onToggle,
        leftElement,
        rightElement,
        className,
        ...props
    }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'sp-habit-card',
                    isCompleted && 'sp-habit-card--completed',
                    className
                )}
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggle?.();
                    }
                }}
                {...props}
            >
                {leftElement}
                {accentColor && (
                    <div
                        className="sp-habit-card__accent"
                        style={{ backgroundColor: accentColor }}
                    />
                )}
                <div className="sp-habit-card__content">
                    <div className="sp-habit-card__title">{title}</div>
                    {subtitle && (
                        <div className="sp-habit-card__subtitle">{subtitle}</div>
                    )}
                </div>
                {rightElement}
            </div>
        );
    }
);

HabitCard.displayName = 'HabitCard';

// ============================================
// INPUT COMPONENT
// ============================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="sp-stack" style={{ gap: 'var(--sp-space-2)' }}>
                {label && (
                    <label htmlFor={inputId} className="sp-body-sm">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'sp-input',
                        error && 'sp-input--error',
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    {...props}
                />
                {error && (
                    <span id={`${inputId}-error`} className="sp-caption sp-state-error">
                        {error}
                    </span>
                )}
                {helperText && !error && (
                    <span id={`${inputId}-helper`} className="sp-caption">
                        {helperText}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// ============================================
// ICON CONTAINER COMPONENT
// ============================================

interface IconContainerProps extends HTMLAttributes<HTMLDivElement> {
    size?: 'md' | 'lg';
    children: React.ReactNode;
}

export const IconContainer = forwardRef<HTMLDivElement, IconContainerProps>(
    ({ size = 'md', className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'sp-icon-container',
                    size === 'lg' && 'sp-icon-container--lg',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

IconContainer.displayName = 'IconContainer';

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
    value: number; // 0-100
    max?: number;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
    ({ value, max = 100, className, ...props }, ref) => {
        const percentage = Math.min(100, Math.max(0, (value / max) * 100));

        return (
            <div
                ref={ref}
                className={cn('sp-progress-bar', className)}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                {...props}
            >
                <div
                    className="sp-progress-bar__fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        );
    }
);

ProgressBar.displayName = 'ProgressBar';

// ============================================
// CIRCULAR PROGRESS COMPONENT
// ============================================

interface CircularProgressProps extends HTMLAttributes<SVGSVGElement> {
    value: number; // 0-100
    size?: number;
    strokeWidth?: number;
    children?: React.ReactNode;
}

export const CircularProgress = forwardRef<SVGSVGElement, CircularProgressProps>(
    ({ value, size = 64, strokeWidth = 4, className, children, ...props }, ref) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const percentage = Math.min(100, Math.max(0, value));
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="sp-center" style={{ position: 'relative', width: size, height: size }}>
                <svg
                    ref={ref}
                    className={cn('sp-progress-ring', className)}
                    width={size}
                    height={size}
                    {...props}
                >
                    <circle
                        className="sp-progress-ring__track"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                    />
                    <circle
                        className="sp-progress-ring__fill"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                {children && (
                    <div style={{ position: 'absolute', inset: 0 }} className="sp-center">
                        {children}
                    </div>
                )}
            </div>
        );
    }
);

CircularProgress.displayName = 'CircularProgress';

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    illustration?: React.ReactNode;
    action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
    ({ title, description, illustration, action, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('sp-empty-state', className)}
                {...props}
            >
                {illustration && (
                    <div className="sp-empty-state__illustration">
                        {illustration}
                    </div>
                )}
                <h3 className="sp-empty-state__title">{title}</h3>
                {description && (
                    <p className="sp-empty-state__description">{description}</p>
                )}
                {action}
            </div>
        );
    }
);

EmptyState.displayName = 'EmptyState';

// ============================================
// BOTTOM SHEET COMPONENT
// ============================================

interface BottomSheetProps extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
    ({ isOpen, onClose, className, children, ...props }, ref) => {
        // Handle escape key
        React.useEffect(() => {
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };

            if (isOpen) {
                document.addEventListener('keydown', handleEscape);
                document.body.style.overflow = 'hidden';
            }

            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = '';
            };
        }, [isOpen, onClose]);

        if (!isOpen) return null;

        return (
            <>
                <div
                    className={cn('sp-modal-backdrop', isOpen && 'sp-modal-backdrop--visible')}
                    onClick={onClose}
                    aria-hidden="true"
                />
                <div
                    ref={ref}
                    className={cn(
                        'sp-bottom-sheet',
                        isOpen && 'sp-bottom-sheet--visible',
                        className
                    )}
                    role="dialog"
                    aria-modal="true"
                    {...props}
                >
                    <div className="sp-bottom-sheet__handle" />
                    {children}
                </div>
            </>
        );
    }
);

BottomSheet.displayName = 'BottomSheet';

// ============================================
// HEADER COMPONENT
// ============================================

interface HeaderProps extends HTMLAttributes<HTMLElement> {
    title?: string;
    leftAction?: React.ReactNode;
    rightAction?: React.ReactNode;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(
    ({ title, leftAction, rightAction, className, ...props }, ref) => {
        return (
            <header
                ref={ref}
                className={cn('sp-header', className)}
                {...props}
            >
                <div className="sp-header__left">
                    {leftAction}
                </div>
                {title && (
                    <h1 className="sp-header__title">{title}</h1>
                )}
                <div className="sp-header__right">
                    {rightAction}
                </div>
            </header>
        );
    }
);

Header.displayName = 'Header';

// ============================================
// STACK LAYOUT COMPONENT
// ============================================

interface StackProps extends HTMLAttributes<HTMLDivElement> {
    gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
    direction?: 'vertical' | 'horizontal';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
    ({
        gap = 4,
        direction = 'vertical',
        align = 'stretch',
        justify = 'start',
        className,
        style,
        children,
        ...props
    }, ref) => {
        const alignMap = {
            start: 'flex-start',
            center: 'center',
            end: 'flex-end',
            stretch: 'stretch',
        };

        const justifyMap = {
            start: 'flex-start',
            center: 'center',
            end: 'flex-end',
            between: 'space-between',
            around: 'space-around',
        };

        return (
            <div
                ref={ref}
                className={cn(direction === 'vertical' ? 'sp-stack' : 'sp-row', className)}
                style={{
                    gap: `var(--sp-space-${gap})`,
                    alignItems: alignMap[align],
                    justifyContent: justifyMap[justify],
                    ...style,
                }}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Stack.displayName = 'Stack';
