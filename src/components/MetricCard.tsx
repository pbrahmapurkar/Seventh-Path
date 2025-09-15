import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, Target, Zap, Award } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'muted';
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  className = ''
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={14} className="text-red-500" />;
      case 'stable':
        return <Minus size={14} className="text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-primary';
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'danger':
        return 'text-red-500';
      case 'muted':
        return 'text-muted-foreground';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className={`flex items-center justify-between rounded-xl bg-card border border-border p-4 ${className}`}>
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-base font-semibold">{title}</p>
        <div className="flex items-center gap-2">
          <p className={`text-3xl font-bold ${getColorClasses()}`}>
            {value}
          </p>
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className="text-sm text-muted-foreground">{trendValue}</span>
            </div>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      {Icon && (
        <div className={`text-4xl ${getColorClasses()}`}>
          <Icon size={32} />
        </div>
      )}
    </div>
  );
}

// Specialized metric cards
export function CompletionRateCard({ 
  rate, 
  trend, 
  trendValue, 
  className 
}: { 
  rate: number; 
  trend?: 'up' | 'down' | 'stable'; 
  trendValue?: string; 
  className?: string;
}) {
  return (
    <MetricCard
      title="Overall Completion Rate"
      value={`${rate}%`}
      icon={Target}
      trend={trend}
      trendValue={trendValue}
      color="primary"
      className={className}
    />
  );
}

export function StreakCard({ 
  streak, 
  trend, 
  trendValue, 
  className 
}: { 
  streak: number; 
  trend?: 'up' | 'down' | 'stable'; 
  trendValue?: string; 
  className?: string;
}) {
  return (
    <MetricCard
      title="Best Streak"
      value={`${streak} days`}
      icon={Zap}
      trend={trend}
      trendValue={trendValue}
      color="success"
      className={className}
    />
  );
}

export function TopHabitCard({ 
  habitName, 
  completionRate, 
  className 
}: { 
  habitName: string; 
  completionRate: number; 
  className?: string;
}) {
  return (
    <MetricCard
      title="Top Habit"
      value={habitName}
      description={`${completionRate}% completion`}
      icon={Award}
      color="warning"
      className={className}
    />
  );
}
