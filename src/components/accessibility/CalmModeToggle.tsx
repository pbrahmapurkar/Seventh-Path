/**
 * Seventh Path Calm Mode Toggle Component
 * Enhanced accessibility with gentle animations and expanded spacing
 */

import React from 'react';
import { useToggleCalmMode } from '../../contexts/ZenThemeContext';
import { BreathingAnimation } from '../animations/BreathingAnimation';

interface CalmModeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'switch' | 'button' | 'card';
}

export function CalmModeToggle({
  className = '',
  showLabel = true,
  size = 'md',
  variant = 'switch',
}: CalmModeToggleProps) {
  const { calmMode, toggleCalmMode } = useToggleCalmMode();

  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-8',
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const renderSwitch = () => (
    <label className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={calmMode}
          onChange={toggleCalmMode}
          className="sr-only"
          aria-label="Toggle calm mode"
        />
        <div
          className={`
            ${sizeClasses[size]} rounded-full transition-all duration-300 ease-mindful
            ${calmMode ? 'bg-sage' : 'bg-stone'}
            group-hover:scale-105
          `}
        >
          <div
            className={`
              absolute top-0.5 left-0.5 ${thumbSizeClasses[size]} bg-white rounded-full
              transition-transform duration-300 ease-mindful
              ${calmMode ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </div>
      </div>
      
      {showLabel && (
        <div className="flex-1">
          <div className={`${textSizeClasses[size]} font-medium text-primary`}>
            Calm Mode
          </div>
          <div className={`${textSizeClasses[size]} text-muted`}>
            Enhanced accessibility
          </div>
        </div>
      )}
      
      {/* Calm Mode Icon */}
      <div className="text-muted group-hover:text-sage transition-colors duration-200">
        <svg
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </div>
    </label>
  );

  const renderButton = () => (
    <button
      onClick={toggleCalmMode}
      className={`
        btn ${calmMode ? 'btn-primary' : 'btn-secondary'}
        flex items-center gap-3 ${className}
      `}
      aria-label={`${calmMode ? 'Disable' : 'Enable'} calm mode`}
    >
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {showLabel && (
          <span className="font-medium">
            {calmMode ? 'Calm Mode On' : 'Calm Mode Off'}
          </span>
        )}
      </div>
    </button>
  );

  const renderCard = () => (
    <div
      className={`
        card cursor-pointer transition-all duration-300 ease-mindful
        ${calmMode ? 'card-completed' : ''}
        hover:scale-105 ${className}
      `}
      onClick={toggleCalmMode}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCalmMode();
        }
      }}
      aria-label={`${calmMode ? 'Disable' : 'Enable'} calm mode`}
    >
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div
              className={`
                ${sizeClasses[size]} rounded-full transition-all duration-300 ease-mindful
                ${calmMode ? 'bg-sage' : 'bg-stone'}
              `}
            >
              <div
                className={`
                  absolute top-0.5 left-0.5 ${thumbSizeClasses[size]} bg-white rounded-full
                  transition-transform duration-300 ease-mindful
                  ${calmMode ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="card-title">
              Calm Mode
            </h3>
            <p className="card-subtitle">
              {calmMode 
                ? 'Enhanced accessibility with gentle animations and expanded spacing'
                : 'Enable for enhanced accessibility with gentle animations and expanded spacing'
              }
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'switch':
        return renderSwitch();
      case 'button':
        return renderButton();
      case 'card':
        return renderCard();
      default:
        return renderSwitch();
    }
  };

  // Apply breathing animation when calm mode is active
  if (calmMode) {
    return (
      <BreathingAnimation intensity="subtle" duration={6000}>
        {renderContent()}
      </BreathingAnimation>
    );
  }

  return renderContent();
}

// Accessibility features component
export function AccessibilityFeatures({ className = '' }: { className?: string }) {
  const { calmMode, toggleCalmMode } = useToggleCalmMode();

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-heading text-primary">
        Accessibility Features
      </h3>
      
      <div className="space-y-3">
        <CalmModeToggle variant="card" />
        
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">
              Voice Guidance
            </h4>
            <p className="card-subtitle">
              Audio confirmations for habit completions and navigation
            </p>
            <div className="mt-3">
              <button className="btn btn-secondary btn-sm">
                Enable Voice
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">
              High Contrast
            </h4>
            <p className="card-subtitle">
              Enhanced contrast for better visibility
            </p>
            <div className="mt-3">
              <button className="btn btn-secondary btn-sm">
                Toggle Contrast
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">
              Reduced Motion
            </h4>
            <p className="card-subtitle">
              Minimize animations for sensitive users
            </p>
            <div className="mt-3">
              <button className="btn btn-secondary btn-sm">
                Reduce Motion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalmModeToggle;
