/**
 * Seventh Path Mindful Loading Spinner Component
 * Gentle, breathing loading indicators for peaceful waiting
 */

import React from 'react';
import { BreathingAnimation } from '../animations/BreathingAnimation';
import { useCalmMode } from '../../contexts/ZenThemeContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'breathing' | 'meditation';
  color?: 'sage' | 'lavender' | 'amber' | 'stone';
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  color = 'sage',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const calmMode = useCalmMode();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    sage: 'text-sage',
    lavender: 'text-lavender',
    amber: 'text-amber',
    stone: 'text-stone',
  };

  const getSpinnerContent = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-mindful-spinner`}>
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                strokeWidth="2"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                strokeWidth="2"
                className="opacity-75"
              />
            </svg>
          </div>
        );

      case 'dots':
        return (
          <div className={`flex space-x-1 ${colorClasses[color]}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full bg-current animate-pulse`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-breathing-pulse`}
            style={{
              animationDuration: calmMode ? '3s' : '2s',
            }}
          />
        );

      case 'breathing':
        return (
          <BreathingAnimation intensity="gentle" duration={calmMode ? 6000 : 4000}>
            <div
              className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
              style={{
                background: `radial-gradient(circle, currentColor 0%, transparent 70%)`,
              }}
            />
          </BreathingAnimation>
        );

      case 'meditation':
        return (
          <BreathingAnimation intensity="subtle" duration={calmMode ? 8000 : 6000}>
            <div className={`${sizeClasses[size]} ${colorClasses[color]} relative`}>
              <div className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
              <div className="absolute inset-1 rounded-full border-2 border-current opacity-40" />
              <div className="absolute inset-2 rounded-full border-2 border-current opacity-60" />
              <div className="absolute inset-3 rounded-full border-2 border-current" />
            </div>
          </BreathingAnimation>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {getSpinnerContent()}
      {text && (
        <div className="text-sm text-muted font-medium animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
}

// Specialized loading components
export function HabitLoadingSpinner({ text = 'Loading habits...', ...props }: Omit<LoadingSpinnerProps, 'variant'>) {
  return (
    <LoadingSpinner
      variant="breathing"
      color="sage"
      text={text}
      {...props}
    />
  );
}

export function MeditationLoadingSpinner({ text = 'Preparing meditation...', ...props }: Omit<LoadingSpinnerProps, 'variant'>) {
  return (
    <LoadingSpinner
      variant="meditation"
      color="lavender"
      text={text}
      {...props}
    />
  );
}

export function DataLoadingSpinner({ text = 'Loading data...', ...props }: Omit<LoadingSpinnerProps, 'variant'>) {
  return (
    <LoadingSpinner
      variant="spinner"
      color="stone"
      text={text}
      {...props}
    />
  );
}

export function CalmLoadingSpinner({ text = 'Please wait...', ...props }: Omit<LoadingSpinnerProps, 'variant'>) {
  return (
    <LoadingSpinner
      variant="pulse"
      color="sage"
      text={text}
      size="lg"
      {...props}
    />
  );
}

// Loading overlay component
export function LoadingOverlay({ 
  children, 
  loading = false, 
  text,
  ...spinnerProps 
}: {
  children: React.ReactNode;
  loading?: boolean;
  text?: string;
} & Omit<LoadingSpinnerProps, 'text'>) {
  if (!loading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoadingSpinner text={text} {...spinnerProps} />
      </div>
    </div>
  );
}

// Skeleton loading component
export function SkeletonLoader({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-surface rounded animate-pulse"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

export default LoadingSpinner;
