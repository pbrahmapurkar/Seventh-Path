/**
 * Seventh Path Breathing Animation Component
 * Mindful breathing effects for spiritual interface elements
 */

import React, { useEffect, useState } from 'react';
import { useCalmMode } from '../../contexts/ZenThemeContext';

interface BreathingAnimationProps {
  children: React.ReactNode;
  duration?: number;
  intensity?: 'subtle' | 'gentle' | 'moderate' | 'strong';
  type?: 'scale' | 'pulse' | 'glow' | 'rotate' | 'combined';
  className?: string;
  disabled?: boolean;
}

export function BreathingAnimation({
  children,
  duration = 4000,
  intensity = 'gentle',
  type = 'scale',
  className = '',
  disabled = false,
}: BreathingAnimationProps) {
  const calmMode = useCalmMode();
  const [isVisible, setIsVisible] = useState(true);

  // Adjust duration for calm mode
  const adjustedDuration = calmMode ? duration * 1.5 : duration;

  // Get animation class based on type and intensity
  const getAnimationClass = () => {
    if (disabled) return '';
    
    const baseClass = 'breathing';
    const intensityClass = intensity === 'subtle' ? 'breathing-slow' : 
                          intensity === 'gentle' ? 'breathing' :
                          intensity === 'moderate' ? 'breathing-fast' : 'breathing';
    
    switch (type) {
      case 'scale':
        return `${baseClass} ${intensityClass}`;
      case 'pulse':
        return 'breathing-pulse';
      case 'glow':
        return 'breathing-glow';
      case 'rotate':
        return 'breathing-rotate';
      case 'combined':
        return `${baseClass} ${intensityClass} breathing-glow`;
      default:
        return `${baseClass} ${intensityClass}`;
    }
  };

  // Handle reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsVisible(!e.matches);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!isVisible || disabled) {
    return <>{children}</>;
  }

  return (
    <div
      className={`${getAnimationClass()} ${className}`}
      style={{
        animationDuration: `${adjustedDuration}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Specialized breathing components for common use cases
export function BreathingCard({ children, ...props }: Omit<BreathingAnimationProps, 'type'>) {
  return (
    <BreathingAnimation type="scale" intensity="gentle" {...props}>
      {children}
    </BreathingAnimation>
  );
}

export function BreathingButton({ children, ...props }: Omit<BreathingAnimationProps, 'type'>) {
  return (
    <BreathingAnimation type="pulse" intensity="subtle" {...props}>
      {children}
    </BreathingAnimation>
  );
}

export function BreathingIcon({ children, ...props }: Omit<BreathingAnimationProps, 'type'>) {
  return (
    <BreathingAnimation type="rotate" intensity="gentle" {...props}>
      {children}
    </BreathingAnimation>
  );
}

export function BreathingText({ children, ...props }: Omit<BreathingAnimationProps, 'type'>) {
  return (
    <BreathingAnimation type="scale" intensity="subtle" {...props}>
      {children}
    </BreathingAnimation>
  );
}

// Meditation-specific breathing component
export function MeditationBreathing({ 
  children, 
  phase = 'inhale',
  ...props 
}: Omit<BreathingAnimationProps, 'type'> & { phase?: 'inhale' | 'exhale' | 'hold' }) {
  const getPhaseClass = () => {
    switch (phase) {
      case 'inhale':
        return 'breathing-meditation inhale';
      case 'exhale':
        return 'breathing-meditation exhale';
      case 'hold':
        return 'breathing-slow';
      default:
        return 'breathing-meditation';
    }
  };

  return (
    <BreathingAnimation {...props}>
      <div className={getPhaseClass()}>
        {children}
      </div>
    </BreathingAnimation>
  );
}

// Breathing group for staggered animations
export function BreathingGroup({ 
  children, 
  stagger = 100,
  ...props 
}: Omit<BreathingAnimationProps, 'type'> & { stagger?: number }) {
  return (
    <div className="breathing-group">
      {React.Children.map(children, (child, index) => (
        <BreathingAnimation
          {...props}
          className={`${props.className || ''} breathing-delay-${Math.min(index + 1, 6)}`}
          style={{
            ...props.style,
            animationDelay: `${index * stagger}ms`,
          }}
        >
          {child}
        </BreathingAnimation>
      ))}
    </div>
  );
}

export default BreathingAnimation;
