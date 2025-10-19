/**
 * Theme Selector Component
 * Displays theme options with preview swatches and allows user to select
 */

import React, { useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllThemes } from '../../themes/themeDefinitions';
import type { ThemeName } from '../../themes/themeDefinitions';

interface ThemeSelectorProps {
  onThemeChange?: (themeName: ThemeName) => void;
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const { themeName: currentTheme, setTheme, isTransitioning } = useTheme();
  const themes = getAllThemes();
  const [pendingTheme, setPendingTheme] = useState<ThemeName | null>(null);

  const handleThemeSelect = async (themeName: ThemeName) => {
    if (themeName === currentTheme || isTransitioning) return;

    setPendingTheme(themeName);
    await setTheme(themeName);
    setPendingTheme(null);
    onThemeChange?.(themeName);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
          <Palette className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Theme</h3>
          <p className="text-sm text-muted-foreground">
            Choose your preferred color scheme
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {themes.map((theme) => {
          const isSelected = currentTheme === theme.name;
          const isPending = pendingTheme === theme.name;

          return (
            <Card
              key={theme.name}
              className={`p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                isSelected
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md hover:border-primary/50'
              } ${isPending ? 'opacity-50' : ''}`}
              onClick={() => handleThemeSelect(theme.name)}
            >
              <div className="space-y-3">
                {/* Theme Preview Swatch */}
                <div className="flex gap-2 h-12 rounded-lg overflow-hidden border border-border">
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
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base">
                        {theme.displayName}
                      </h4>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {theme.description}
                    </p>
                  </div>
                </div>

                {/* Select Button */}
                {!isSelected && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isPending || isTransitioning}
                  >
                    {isPending ? 'Applying...' : 'Select'}\n                  </Button>
                )}
                {isSelected && (
                  <div className="w-full text-center py-2 text-sm font-medium text-primary">
                    Active Theme
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
