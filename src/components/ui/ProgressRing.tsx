/**
 * Seventh Path Mindful Progress Ring Component
 * Organic, breathing progress indicator with celebration effects
 */

import React, { useEffect, useState, useRef } from 'react';
import { BreathingAnimation } from '../animations/BreathingAnimation';
import { CelebrationAnimation } from '../animations/CelebrationAnimation';
import { useCalmMode } from '../../contexts/ZenThemeContext';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  breathing?: boolean;
  celebration?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  showPercentage = true,
  animated = true,
  breathing = false,
  celebration = false,
  className = '',
  children,
}: ProgressRingProps) {
  const calmMode = useCalmMode();
  const [displayValue, setDisplayValue] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [wasComplete, setWasComplete] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Animate progress value
  useEffect(() => {
    if (!animated) {
      setDisplayValue(percentage);
      return;
    }

    const startValue = displayValue;
    const endValue = percentage;
    const duration = calmMode ? 1200 : 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use organic easing curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [percentage, animated, calmMode]);

  // Check for completion
  useEffect(() => {
    const completed = percentage >= 100;
    setIsComplete(completed);
    
    if (completed && !wasComplete) {
      setWasComplete(true);
    }
  }, [percentage, wasComplete]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const ProgressContent = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      {children || (
        <div className="text-center">
          {showValue && (
            <div className="text-2xl font-semibold text-primary">
              {Math.round(displayValue)}%
            </div>
          )}
          {showPercentage && !showValue && (
            <div className="text-lg text-secondary">
              {Math.round(displayValue)}%
            </div>
          )}
        </div>
      )}
    </div>
  );

  const ProgressRingContent = () => (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: isComplete ? 'drop-shadow(0 0 8px rgba(168, 181, 160, 0.3))' : 'none' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-border-subtle opacity-30"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={`text-sage transition-all duration-300 ${
            isComplete ? 'text-lavender' : ''
          }`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference - (displayValue / 100) * circumference,
            transition: animated ? 'stroke-dashoffset 0.3s ease-out' : 'none',
          }}
        />
        
        {/* Completion glow effect */}
        {isComplete && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth * 0.5}
            fill="none"
            className="text-sage opacity-50 animate-pulse"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: circumference - (displayValue / 100) * circumference,
            }}
          />
        )}
      </svg>
      
      <ProgressContent />
    </div>
  );

  // Apply breathing animation if enabled
  if (breathing) {
    return (
      <BreathingAnimation
        intensity="subtle"
        duration={4000}
        className={className}
      >
        <ProgressRingContent />
      </BreathingAnimation>
    );
  }

  // Apply celebration animation if completed
  if (celebration && isComplete && !wasComplete) {
    return (
      <CelebrationAnimation
        type="glow"
        intensity="gentle"
        duration={2000}
        iterations={3}
        className={className}
      >
        <ProgressRingContent />
      </CelebrationAnimation>
    );
  }

  return (
    <div className={className}>
      <ProgressRingContent />
    </div>
  );
}

// Specialized progress ring variants
export function HabitProgressRing({ 
  value, 
  max = 100, 
  ...props 
}: Omit<ProgressRingProps, 'celebration'>) {
  return (
    <ProgressRing
      value={value}
      max={max}
      celebration={value >= max}
      breathing={value < max}
      {...props}
    />
  );
}

export function StreakProgressRing({ 
  value, 
  max = 7, 
  ...props 
}: Omit<ProgressRingProps, 'celebration'>) {
  return (
    <ProgressRing
      value={value}
      max={max}
      celebration={value >= max}
      breathing={value < max}
      size={100}
      strokeWidth={6}
      {...props}
    />
  );
}

export function GoalProgressRing({ 
  value, 
  max = 100, 
  ...props 
}: Omit<ProgressRingProps, 'celebration'>) {
  return (
    <ProgressRing
      value={value}
      max={max}
      celebration={value >= max}
      breathing={value < max}
      size={140}
      strokeWidth={10}
      {...props}
    />
  );
}

export function MeditationProgressRing({ 
  value, 
  max = 100, 
  ...props 
}: Omit<ProgressRingProps, 'breathing'>) {
  return (
    <ProgressRing
      value={value}
      max={max}
      breathing={true}
      celebration={value >= max}
      size={160}
      strokeWidth={12}
      {...props}
    />
  );
}

export default ProgressRing;
