import React, { memo, useCallback, useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ChevronRight, Clock, Flame, CheckCircle2 } from 'lucide-react';
import { getIdentityMessage } from '../lib/identityMessages';

interface HabitCardProps {
  id: string;
  title: string;
  emoji: string;
  streak: number;
  completed: boolean;
  frequency?: 'daily' | 'weekly';
  reminderTime?: string; // legacy
  scheduleSummary?: string; // "Daily • Reminders at 8:00 AM" or "Weekly • Mon, Wed • 7:00 AM"
  progress?: number; // 0-100
  showCheckbox?: boolean;
  onToggle?: (id: string) => void;
  onClick?: () => void;
}

export const HabitCard = memo(function HabitCard({
  id,
  title,
  emoji,
  streak,
  completed,
  frequency,
  reminderTime,
  scheduleSummary,
  progress,
  showCheckbox = true,
  onToggle,
  onClick
}: HabitCardProps) {
  const [showIdentityMessage, setShowIdentityMessage] = useState(false);
  const [identityMessage, setIdentityMessage] = useState('');

  const handleToggle = useCallback(async (checked: boolean) => {
    // Trigger haptic feedback for mobile satisfaction
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(10); // Subtle pulse
      }
      // Also try Capacitor Haptics if available
      const Haptics = (window as any)?.Capacitor?.Plugins?.Haptics;
      if (Haptics) {
        await Haptics.impact({ style: 'light' });
      }
    } catch {
      // Ignore haptics errors silently
    }

    // Show identity message when completing (not uncompleting)
    if (!completed) {
      const message = getIdentityMessage(emoji, title, streak);
      setIdentityMessage(message);
      setShowIdentityMessage(true);
    }

    onToggle?.(id);
  }, [onToggle, id, completed, emoji, title, streak]);

  // Auto-hide identity message after 3 seconds
  useEffect(() => {
    if (showIdentityMessage) {
      const timer = setTimeout(() => setShowIdentityMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showIdentityMessage]);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);
  return (
    <div
      className={`group relative flex items-center gap-4 p-5 rounded-[1.25rem] transition-all duration-300 cursor-pointer
        ${completed
          ? 'bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.25)] shadow-[0_8px_24px_rgba(0,0,0,0.15)]'
          : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:border-[rgba(255,255,255,0.18)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-0.5'
        }`}
      onClick={handleClick}
    >
      {/* Completion Status Indicator */}
      {completed && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Identity Message Toast */}
      {showIdentityMessage && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 bg-green-600 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg whitespace-nowrap animate-pulse">
          {identityMessage}
        </div>
      )}

      <div className="flex items-center gap-4 flex-1">
        {/* Checkbox */}
        {showCheckbox && (
          <div className="flex-shrink-0 touch-target-sm">
            <Checkbox
              checked={completed}
              onClick={(e: any) => e.stopPropagation()}
              onCheckedChange={handleToggle}
              className="w-6 h-6 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              aria-label={completed ? 'Mark not done' : 'Mark done'}
            />
          </div>
        )}

        {/* Habit Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'
          }`}>
          {emoji}
        </div>

        {/* Habit Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold text-lg truncate ${completed ? 'text-green-700 dark:text-green-300' : ''}`}>
              {title}
            </h3>
            {completed && (
              <div className="flex-shrink-0">
                <span className="text-green-500">✓</span>
              </div>
            )}
          </div>

          {/* Badges and Info */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {scheduleSummary ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{scheduleSummary}</span>
              </div>
            ) : (
              <>
                {typeof frequency !== 'undefined' && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {frequency === 'daily' ? 'Daily' : 'Weekly'}
                  </Badge>
                )}
                {typeof reminderTime !== 'undefined' && reminderTime && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {reminderTime}
                  </Badge>
                )}
              </>
            )}
            {streak > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                <Flame className="w-3 h-3 mr-1" />
                {streak} day{streak !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          {typeof progress === 'number' && (
            <div className="relative">
              <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${completed
                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                    : 'bg-gradient-to-r from-primary to-primary/80'
                    }`}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              {progress > 0 && (
                <div className="absolute -top-6 right-0 text-xs text-muted-foreground">
                  {progress}%
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Arrow Icon */}
      <div className="flex-shrink-0">
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
});

interface InsightCardProps {
  title: string;
  value: string | number;
  description?: string;
  chart?: React.ReactNode;
}

export function InsightCard({ title, value, description, chart }: InsightCardProps) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-medium text-primary">{value}</div>
        </div>
      </div>
      {chart && <div className="mt-4">{chart}</div>}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && action}
    </div>
  );
}
