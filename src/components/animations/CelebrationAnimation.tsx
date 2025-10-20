/**
 * Seventh Path Celebration Animation Component
 * Gentle, mindful celebration effects for habit completions
 */

import React, { useEffect, useState } from 'react';
import { useCalmMode } from '../../contexts/ZenThemeContext';

interface CelebrationAnimationProps {
  children: React.ReactNode;
  type?: 'pulse' | 'glow' | 'bounce' | 'shake' | 'rotate' | 'fade' | 'combined';
  intensity?: 'subtle' | 'gentle' | 'moderate' | 'strong';
  duration?: number;
  iterations?: number;
  className?: string;
  disabled?: boolean;
  onComplete?: () => void;
}

export function CelebrationAnimation({
  children,
  type = 'pulse',
  intensity = 'gentle',
  duration = 1500,
  iterations = 3,
  className = '',
  disabled = false,
  onComplete,
}: CelebrationAnimationProps) {
  const calmMode = useCalmMode();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Adjust duration and iterations for calm mode
  const adjustedDuration = calmMode ? duration * 1.5 : duration;
  const adjustedIterations = calmMode ? Math.max(1, Math.floor(iterations / 2)) : iterations;

  // Get animation class based on type and intensity
  const getAnimationClass = () => {
    if (disabled || !isAnimating) return '';
    
    const baseClass = 'celebration';
    const intensityClass = intensity === 'subtle' ? 'celebration-slow' : 
                          intensity === 'gentle' ? 'celebration' :
                          intensity === 'moderate' ? 'celebration-fast' : 'celebration-strong';
    
    switch (type) {
      case 'pulse':
        return 'celebration-pulse';
      case 'glow':
        return 'celebration-glow';
      case 'bounce':
        return 'celebration-bounce';
      case 'shake':
        return 'celebration-shake';
      case 'rotate':
        return 'celebration-rotate';
      case 'fade':
        return 'celebration-fade-in';
      case 'combined':
        return 'celebration-complete';
      default:
        return 'celebration-pulse';
    }
  };

  // Trigger animation
  const triggerAnimation = () => {
    if (disabled) return;
    
    setIsAnimating(true);
    
    // Reset animation after duration
    setTimeout(() => {
      setIsAnimating(false);
      onComplete?.();
    }, adjustedDuration * adjustedIterations);
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

  // Expose trigger function via ref
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    trigger: triggerAnimation,
  }));

  if (!isVisible || disabled) {
    return <>{children}</>;
  }

  return (
    <div
      className={`${getAnimationClass()} ${className}`}
      style={{
        animationDuration: `${adjustedDuration}ms`,
        animationIterationCount: adjustedIterations,
      }}
    >
      {children}
    </div>
  );
}

// Specialized celebration components for common use cases
export function HabitCompletionCelebration({ 
  children, 
  ...props 
}: Omit<CelebrationAnimationProps, 'type'>) {
  return (
    <CelebrationAnimation type="combined" intensity="gentle" {...props}>
      {children}
    </CelebrationAnimation>
  );
}

export function StreakCelebration({ 
  children, 
  ...props 
}: Omit<CelebrationAnimationProps, 'type'>) {
  return (
    <CelebrationAnimation type="bounce" intensity="moderate" {...props}>
      {children}
    </CelebrationAnimation>
  );
}

export function GoalCelebration({ 
  children, 
  ...props 
}: Omit<CelebrationAnimationProps, 'type'>) {
  return (
    <CelebrationAnimation type="rotate" intensity="gentle" {...props}>
      {children}
    </CelebrationAnimation>
  );
}

export function MilestoneCelebration({ 
  children, 
  ...props 
}: Omit<CelebrationAnimationProps, 'type'>) {
  return (
    <CelebrationAnimation type="combined" intensity="strong" duration={2000} iterations={5} {...props}>
      {children}
    </CelebrationAnimation>
  );
}

export function ButtonCelebration({ 
  children, 
  ...props 
}: Omit<CelebrationAnimationProps, 'type'>) {
  return (
    <CelebrationAnimation type="pulse" intensity="subtle" duration={1000} iterations={3} {...props}>
      {children}
    </CelebrationAnimation>
  );
}

export function CardCelebration({ 
  children, 
  ...props 
}: Omit<CelebrationAnimationProps, 'type'>) {
  return (
    <CelebrationAnimation type="bounce" intensity="gentle" {...props}>
      {children}
    </CelebrationAnimation>
  );
}

export function IconCelebration({ 
  children, 
  ...props 
}: Omit<CelebrationAnimationProps, 'type'>) {
  return (
    <CelebrationAnimation type="rotate" intensity="gentle" duration={1000} iterations={3} {...props}>
      {children}
    </CelebrationAnimation>
  );
}

// Celebration group for staggered animations
export function CelebrationGroup({ 
  children, 
  stagger = 100,
  ...props 
}: Omit<CelebrationAnimationProps, 'type'> & { stagger?: number }) {
  return (
    <div className="celebration-group">
      {React.Children.map(children, (child, index) => (
        <CelebrationAnimation
          {...props}
          className={`${props.className || ''}`}
          style={{
            ...props.style,
            animationDelay: `${index * stagger}ms`,
          }}
        >
          {child}
        </CelebrationAnimation>
      ))}
    </div>
  );
}

// Hook to trigger celebrations programmatically
export function useCelebration() {
  const [celebrationKey, setCelebrationKey] = useState(0);

  const triggerCelebration = (type: CelebrationAnimationProps['type'] = 'pulse') => {
    setCelebrationKey(prev => prev + 1);
  };

  return {
    celebrationKey,
    triggerCelebration,
  };
}

export default CelebrationAnimation;
