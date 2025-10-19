/**
 * Enhanced Theme Selector with iOS-style design patterns
 * Features: Floating dropdown, proper z-index, accessibility, smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Palette, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllThemes } from '../../themes/themeDefinitions';
import type { ThemeName, Theme } from '../../themes/themeDefinitions';

interface EnhancedThemeSelectorProps {
  onThemeChange?: (themeName: ThemeName) => void;
  className?: string;
}

export function EnhancedThemeSelector({ onThemeChange, className }: EnhancedThemeSelectorProps) {
  const { themeName: currentTheme, setTheme, isTransitioning } = useTheme();
  const themes = getAllThemes();
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
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 group">
      {/* Compact Theme Preview Swatch */}
      <div className="flex gap-0.5 h-6 w-8 rounded-md overflow-hidden border border-border/50 flex-shrink-0 shadow-sm">
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
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
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
      {/* Enhanced Dropdown Trigger Button */}
      <Button
        ref={triggerRef}
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between h-14 px-4 rounded-xl border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
        disabled={isTransitioning}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select theme"
        role="combobox"
      >
        <div className="flex items-center gap-3">
          {/* Current Theme Preview */}
          {currentThemeData && (
            <div className="flex gap-0.5 h-6 w-8 rounded-md overflow-hidden border border-border/50 shadow-sm">
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
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {/* Enhanced Floating Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Floating Dropdown */}
          <Card 
            className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto shadow-2xl border border-border/50 bg-card/95 backdrop-blur-xl rounded-2xl"
            onKeyDown={handleKeyDown}
            style={{
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            }}
          >
            <div className="p-2">
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-3 mb-2 border-b border-border/50">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Palette className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Theme</h3>
                  <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
                </div>
              </div>

              {/* Theme Options */}
              <div className="space-y-1">
                {themes.map((theme) => {
                  const isSelected = currentTheme === theme.name;
                  const isPending = pendingTheme === theme.name;
                  
                  return (
                    <button
                      key={theme.name}
                      onClick={() => handleThemeSelect(theme.name)}
                      disabled={isPending || isTransitioning}
                      className="w-full text-left rounded-xl hover:bg-muted/50 transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-muted/30"
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
              <div className="px-3 py-3 border-t border-border/50 mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  <span>Changes apply immediately</span>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}


