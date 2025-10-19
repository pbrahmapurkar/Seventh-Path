/**
 * Design System Theme Selector
 * Formal implementation with design specification compliance
 */

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Palette, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useDesignSystem } from '../../contexts/DesignSystemContext';
import type { ThemeName, ThemeMetadata } from '../../themes/designSystem';

interface DesignSystemThemeSelectorProps {
  onThemeChange?: (themeName: ThemeName) => void;
  className?: string;
}

export function DesignSystemThemeSelector({ onThemeChange, className }: DesignSystemThemeSelectorProps) {
  const { theme: currentTheme, setTheme, isTransitioning, availableThemes } = useDesignSystem();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<ThemeName | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleThemeSelect = async (themeName: ThemeName) => {
    if (themeName === currentTheme.name || isTransitioning) return;

    setPendingTheme(themeName);
    await setTheme(themeName);
    setPendingTheme(null);
    setIsOpen(false);
    onThemeChange?.(themeName);
    
    // Show toast feedback
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('theme-changed', { 
        detail: { themeName } 
      }));
    }
  };

  const ThemePreview = ({ theme, isSelected, isPending }: { 
    theme: ThemeMetadata; 
    isSelected: boolean; 
    isPending: boolean; 
  }) => (
    <div 
      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
      style={{
        backgroundColor: isSelected ? currentTheme.tokens['background-surface'] : 'transparent',
        borderColor: isSelected ? currentTheme.tokens['border-subtle'] : 'transparent',
        borderWidth: isSelected ? '1px' : '0px',
      }}
    >
      {/* Compact Theme Preview Swatch */}
      <div 
        className="flex gap-0.5 h-6 w-8 rounded-md overflow-hidden border flex-shrink-0 shadow-sm"
        style={{ borderColor: currentTheme.tokens['border-subtle'] }}
      >
        <div
          className="flex-1"
          style={{ backgroundColor: theme.tokens['background-primary'] }}
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.tokens['background-accent'] }}
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.tokens['semantic-success'] }}
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.tokens['background-surface'] }}
        />
      </div>

      {/* Theme Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span 
            className="font-medium text-sm truncate"
            style={{ color: currentTheme.tokens['text-primary'] }}
          >
            {theme.displayName}
          </span>
          {isSelected && (
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: currentTheme.tokens['background-accent'] }}
            >
              <Check className="w-3 h-3" style={{ color: currentTheme.tokens['text-on-accent'] }} />
            </div>
          )}
        </div>
        <p 
          className="text-xs truncate"
          style={{ color: currentTheme.tokens['text-secondary'] }}
        >
          {theme.description}
        </p>
      </div>

      {/* Loading State */}
      {isPending && (
        <div 
          className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
          style={{ borderColor: currentTheme.tokens['background-accent'] }}
        />
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Enhanced Dropdown Trigger Button */}
      <Button
        ref={triggerRef}
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-14 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-offset-2"
        disabled={isTransitioning}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select theme"
        role="combobox"
        style={{
          backgroundColor: currentTheme.tokens['background-surface'],
          borderColor: currentTheme.tokens['border-subtle'],
          color: currentTheme.tokens['text-primary'],
        }}
      >
        <div className="flex items-center gap-3">
          {/* Current Theme Preview */}
          <div 
            className="flex gap-0.5 h-6 w-8 rounded-md overflow-hidden border shadow-sm"
            style={{ borderColor: currentTheme.tokens['border-subtle'] }}
          >
            <div
              className="flex-1"
              style={{ backgroundColor: currentTheme.tokens['background-primary'] }}
            />
            <div
              className="flex-1"
              style={{ backgroundColor: currentTheme.tokens['background-accent'] }}
            />
            <div
              className="flex-1"
              style={{ backgroundColor: currentTheme.tokens['semantic-success'] }}
            />
            <div
              className="flex-1"
              style={{ backgroundColor: currentTheme.tokens['background-surface'] }}
            />
          </div>
          
          <div className="text-left">
            <div 
              className="font-medium text-sm"
              style={{ color: currentTheme.tokens['text-primary'] }}
            >
              {currentTheme.displayName}
            </div>
            <div 
              className="text-xs"
              style={{ color: currentTheme.tokens['text-secondary'] }}
            >
              {currentTheme.description}
            </div>
          </div>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: currentTheme.tokens['text-secondary'] }}
        />
      </Button>

      {/* Enhanced Floating Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 z-40 transition-opacity duration-200"
            style={{ 
              backgroundColor: currentTheme.tokens['text-muted'] + '20',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Floating Dropdown */}
          <Card 
            className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto transition-all duration-200 rounded-2xl"
            onKeyDown={handleKeyDown}
            style={{
              backgroundColor: currentTheme.tokens['background-surface'],
              borderColor: currentTheme.tokens['border-subtle'],
              boxShadow: `0 20px 25px -5px ${currentTheme.tokens['text-muted']}20, 0 8px 10px -6px ${currentTheme.tokens['text-muted']}20`,
            }}
          >
            <div className="p-2">
              {/* Header */}
              <div 
                className="flex items-center gap-2 px-3 py-3 mb-2 border-b"
                style={{ borderColor: currentTheme.tokens['border-subtle'] }}
              >
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: currentTheme.tokens['background-accent'] + '20' }}
                >
                  <Palette className="w-4 h-4" style={{ color: currentTheme.tokens['background-accent'] }} />
                </div>
                <div>
                  <h3 
                    className="font-semibold text-sm"
                    style={{ color: currentTheme.tokens['text-primary'] }}
                  >
                    Theme
                  </h3>
                  <p 
                    className="text-xs"
                    style={{ color: currentTheme.tokens['text-secondary'] }}
                  >
                    Choose your preferred color scheme
                  </p>
                </div>
              </div>

              {/* Theme Options */}
              <div className="space-y-1">
                {availableThemes.map((theme) => {
                  const isSelected = currentTheme.name === theme.name;
                  const isPending = pendingTheme === theme.name;
                  
                  return (
                    <button
                      key={theme.name}
                      onClick={() => handleThemeSelect(theme.name)}
                      disabled={isPending || isTransitioning}
                      className="w-full text-left rounded-xl transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        focusRingColor: currentTheme.tokens['focus-ring'],
                      }}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={0}
                    >
                      <ThemePreview 
                        theme={theme} 
                        isSelected={isSelected} 
                        isPending={isPending} 
                      />
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div 
                className="px-3 py-3 border-t mt-2"
                style={{ borderColor: currentTheme.tokens['border-subtle'] }}
              >
                <div className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-3 h-3" style={{ color: currentTheme.tokens['background-accent'] }} />
                  <span style={{ color: currentTheme.tokens['text-secondary'] }}>
                    Changes apply immediately
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}


