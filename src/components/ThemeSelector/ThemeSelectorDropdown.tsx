/**
 * Enhanced Theme Selector Dropdown Component
 * Provides a dropdown interface for theme selection with preview swatches
 * Includes accessibility features and smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Palette, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllThemes } from '../../themes/themeDefinitions';
import type { ThemeName, Theme } from '../../themes/themeDefinitions';

interface ThemeSelectorDropdownProps {
  onThemeChange?: (themeName: ThemeName) => void;
  className?: string;
}

export function ThemeSelectorDropdown({ onThemeChange, className }: ThemeSelectorDropdownProps) {
  const { themeName: currentTheme, setTheme, isTransitioning } = useTheme();
  const themes = getAllThemes();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<ThemeName | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    }
  };

  const handleThemeSelect = async (themeName: ThemeName) => {
    if (themeName === currentTheme || isTransitioning) return;

    setPendingTheme(themeName);
    await setTheme(themeName);
    setPendingTheme(null);
    setIsOpen(false);
    onThemeChange?.(themeName);
  };

  const currentThemeData = themes.find(t => t.name === currentTheme);

  const ThemePreview = ({ theme, isSelected, isPending }: { 
    theme: Theme; 
    isSelected: boolean; 
    isPending: boolean; 
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      {/* Theme Preview Swatch */}
      <div className="flex gap-1 h-8 w-12 rounded-md overflow-hidden border border-border flex-shrink-0">
        <div
          className="flex-1"
          style={{ backgroundColor: theme.colors.background }}
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.colors.accent }}
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.colors.card }}
        />
      </div>

      {/* Theme Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {theme.displayName}
          </span>
          {isSelected && (
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {theme.description}
        </p>
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-12 px-4"
        disabled={isTransitioning}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select theme"
      >
        <div className="flex items-center gap-3">
          {/* Current Theme Preview */}
          {currentThemeData && (
            <div className="flex gap-0.5 h-6 w-8 rounded-md overflow-hidden border border-border">
              <div
                className="flex-1"
                style={{ backgroundColor: currentThemeData.colors.background }}
              />
              <div
                className="flex-1"
                style={{ backgroundColor: currentThemeData.colors.primary }}
              />
              <div
                className="flex-1"
                style={{ backgroundColor: currentThemeData.colors.accent }}
              />
              <div
                className="flex-1"
                style={{ backgroundColor: currentThemeData.colors.card }}
              />
            </div>
          )}
          
          <div className="text-left">
            <div className="font-medium text-sm">
              {currentThemeData?.displayName || 'Select Theme'}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentThemeData?.description || 'Choose your preferred color scheme'}
            </div>
          </div>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card 
          className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg border"
          onKeyDown={handleKeyDown}
        >
          <div className="p-2">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 mb-2 border-b border-border">
              <Palette className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Choose Theme</span>
            </div>

            {/* All Themes */}
            <div className="space-y-1">
              {themes.map((theme) => {
                const isSelected = currentTheme === theme.name;
                const isPending = pendingTheme === theme.name;
                
                return (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeSelect(theme.name)}
                    disabled={isPending || isTransitioning}
                    className="w-full text-left rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50"
                    role="option"
                    aria-selected={isSelected}
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
            <div className="px-3 py-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>Changes apply immediately</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
