import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  description?: string;
  icon?: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export function ProgressRing({
  value,
  max,
  label,
  description,
  icon: Icon,
  color = 'primary',
  size = 'md',
  showPercentage = true,
  className = ''
}: ProgressRingProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = size === 'sm' ? 20 : size === 'lg' ? 35 : 28;
  const strokeWidth = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  const colorClasses = {
    primary: 'text-primary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500'
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className={`flex items-center justify-between rounded-xl bg-card border border-border p-4 ${className}`}>
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-base font-semibold">{label}</p>
        <div className="flex items-center gap-2">
          <p className={`text-3xl font-bold ${colorClasses[color]}`}>
            {showPercentage ? `${Math.round(percentage)}%` : value}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      
      <div className="relative">
        <svg className={`${sizeClasses[size]} transform -rotate-90`} viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className={`transition-all duration-500 ${colorClasses[color]}`}
          />
        </svg>
        
        {/* Icon in center */}
        {Icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={iconSizes[size]} className={colorClasses[color]} />
          </div>
        )}
      </div>
    </div>
  );
}

// Specialized components for common metrics
export function CompletionRateRing({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  return (
    <ProgressRing
      value={value}
      max={max}
      label="Overall Completion Rate"
      color="primary"
      size="md"
      className={className}
    />
  );
}

export function StreakRing({ value, className }: { value: number; className?: string }) {
  return (
    <ProgressRing
      value={value}
      max={30} // Assume max streak of 30 days for visualization
      label="Best Streak"
      description="days"
      color="success"
      size="md"
      showPercentage={false}
      className={className}
    />
  );
}

export function TopHabitRing({ habitName, completionRate, className }: { 
  habitName: string; 
  completionRate: number; 
  className?: string;
}) {
  return (
    <ProgressRing
      value={completionRate}
      max={100}
      label="Top Habit"
      description={habitName}
      color="warning"
      size="md"
      className={className}
    />
  );
}
