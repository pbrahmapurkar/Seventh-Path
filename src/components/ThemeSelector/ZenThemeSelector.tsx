/**
 * Seventh Path Zen Theme Selector
 * Mindful theme selection with spiritual design
 */

import React, { useState } from 'react';
import { useZenTheme, useToggleCalmMode } from '../../contexts/ZenThemeContext';
import type { ZenThemeName } from '../../themes/zenThemeSystem';

interface ZenThemeSelectorProps {
  onThemeChange?: (themeName: ZenThemeName) => void;
  className?: string;
}

export function ZenThemeSelector({ onThemeChange, className = '' }: ZenThemeSelectorProps) {
  const { 
    theme, 
    themeName, 
    setTheme, 
    availableThemes, 
    isTransitioning 
  } = useZenTheme();
  
  const { calmMode, toggleCalmMode } = useToggleCalmMode();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = async (themeName: ZenThemeName) => {
    if (themeName === theme.name || isTransitioning) return;
    
    await setTheme(themeName);
    onThemeChange?.(themeName);
    setIsOpen(false);
  };

  const handleCalmModeToggle = () => {
    toggleCalmMode();
  };

  return (
    <div className={`zen-theme-selector ${className}`}>
      {/* Theme Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isTransitioning}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg
            bg-surface border border-subtle
            hover:bg-surface-elevated hover:border-interactive
            focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2
            transition-all duration-300 ease-mindful
            ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isOpen ? 'ring-2 ring-sage ring-offset-2' : ''}
          `}
          aria-label="Select theme"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {/* Theme Preview Circle */}
          <div 
            className="w-6 h-6 rounded-full border-2 border-subtle"
            style={{ 
              background: `linear-gradient(135deg, ${theme.colors.sage} 0%, ${theme.colors.lavender} 100%)` 
            }}
          />
          
          {/* Theme Info */}
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-primary">
              {theme.displayName}
            </div>
            <div className="text-xs text-muted">
              {theme.description}
            </div>
          </div>
          
          {/* Dropdown Arrow */}
          <svg
            className={`w-4 h-4 text-muted transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-subtle rounded-lg shadow-lg z-50 overflow-hidden">
            {availableThemes.map((availableTheme) => {
              const isSelected = availableTheme.name === themeName;
              const isPending = isTransitioning && availableTheme.name === themeName;
              
              return (
                <button
                  key={availableTheme.name}
                  onClick={() => handleThemeSelect(availableTheme.name)}
                  disabled={isTransitioning}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-surface-elevated
                    focus:outline-none focus:bg-surface-elevated
                    transition-all duration-200 ease-mindful
                    ${isSelected ? 'bg-surface-elevated' : ''}
                    ${isPending ? 'opacity-50' : ''}
                  `}
                >
                  {/* Theme Preview Circle */}
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-subtle flex-shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${availableTheme.colors.sage} 0%, ${availableTheme.colors.lavender} 100%)` 
                    }}
                  />
                  
                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-primary truncate">
                      {availableTheme.displayName}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {availableTheme.description}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-sage flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Calm Mode Toggle */}
      <div className="mt-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={calmMode}
              onChange={handleCalmModeToggle}
              className="sr-only"
            />
            <div
              className={`
                w-11 h-6 rounded-full transition-all duration-300 ease-mindful
                ${calmMode ? 'bg-sage' : 'bg-stone'}
                group-hover:scale-105
              `}
            >
              <div
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                  transition-transform duration-300 ease-mindful
                  ${calmMode ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-primary">
              Calm Mode
            </div>
            <div className="text-xs text-muted">
              Enhanced accessibility with gentle animations
            </div>
          </div>
          
          {/* Calm Mode Icon */}
          <div className="text-muted group-hover:text-sage transition-colors duration-200">
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
          </div>
        </label>
      </div>

      {/* Theme Preview */}
      <div className="mt-6 p-4 bg-surface border border-subtle rounded-lg">
        <div className="text-sm font-medium text-primary mb-3">
          Theme Preview
        </div>
        
        <div className="space-y-3">
          {/* Color Palette Preview */}
          <div className="flex gap-2">
            <div 
              className="w-8 h-8 rounded-full border border-subtle"
              style={{ backgroundColor: theme.colors.sage }}
              title="Sage"
            />
            <div 
              className="w-8 h-8 rounded-full border border-subtle"
              style={{ backgroundColor: theme.colors.lavender }}
              title="Lavender"
            />
            <div 
              className="w-8 h-8 rounded-full border border-subtle"
              style={{ backgroundColor: theme.colors.amber }}
              title="Amber"
            />
            <div 
              className="w-8 h-8 rounded-full border border-subtle"
              style={{ backgroundColor: theme.colors.stone }}
              title="Stone"
            />
          </div>
          
          {/* Sample Text */}
          <div className="space-y-2">
            <div className="text-lg font-heading text-primary">
              Mindful Heading
            </div>
            <div className="text-sm text-secondary">
              Gentle secondary text with peaceful spacing
            </div>
            <div className="text-xs text-muted">
              Subtle muted text for additional context
            </div>
          </div>
          
          {/* Sample Button */}
          <button className="px-4 py-2 bg-sage text-on-sage rounded-lg text-sm font-medium hover:bg-sage-subtle transition-colors duration-200">
            Mindful Action
          </button>
        </div>
      </div>
    </div>
  );
}

export default ZenThemeSelector;
