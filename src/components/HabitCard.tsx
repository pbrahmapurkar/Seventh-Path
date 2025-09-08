import React from 'react';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

interface HabitCardProps {
  id: string;
  title: string;
  emoji: string;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
  onClick?: () => void;
}

export function HabitCard({ 
  id, 
  title, 
  emoji, 
  streak, 
  completed, 
  onToggle, 
  onClick 
}: HabitCardProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div
        className="flex items-center gap-3 flex-1 cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggle(id)}
          className="w-6 h-6"
        />
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{emoji}</span>
          <div className="flex-1">
            <h3 className="font-medium">{title}</h3>
            {streak > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  🔥 {streak} day{streak !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="text-muted-foreground"
      >
        <path
          d="M9 18L15 12L9 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

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