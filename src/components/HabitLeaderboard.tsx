import React from 'react';
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface HabitLeaderboardItem {
  id: string;
  name: string;
  emoji: string;
  completionRate: number;
  currentStreak: number;
  rank: number;
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
}

interface HabitLeaderboardProps {
  habits: HabitLeaderboardItem[];
  maxItems?: number;
  className?: string;
}

export function HabitLeaderboard({ habits, maxItems = 5, className = '' }: HabitLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Award size={16} className="text-yellow-500" />;
      case 2:
        return <Award size={16} className="text-gray-400" />;
      case 3:
        return <Award size={16} className="text-orange-500" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={12} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={12} className="text-red-500" />;
      case 'stable':
        return <Minus size={12} className="text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`rounded-xl bg-card border border-border p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Award size={20} className="text-primary" />
        <h3 className="font-medium">Habit Leaderboard</h3>
      </div>
      
      <div className="space-y-3">
        {habits.slice(0, maxItems).map((habit) => (
          <div
            key={habit.id}
            className="flex items-center gap-4 rounded-lg bg-muted/30 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={habit.onClick}
          >
            {/* Rank Badge */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getRankBadgeColor(habit.rank)}`}>
              {getRankIcon(habit.rank)}
            </div>
            
            {/* Habit Icon */}
            <div className="flex items-center justify-center rounded-lg bg-card border border-border shrink-0 w-12 h-12">
              <span className="text-2xl">{habit.emoji}</span>
            </div>
            
            {/* Habit Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium truncate">{habit.name}</p>
                {getTrendIcon(habit.trend)}
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium">{habit.completionRate}%</span>
                </div>
                <Progress 
                  value={habit.completionRate} 
                  className="h-2"
                />
              </div>
              
              {/* Streak Info */}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  🔥 {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            
            {/* Rank Number */}
            <div className="text-right">
              <p className="font-bold text-lg text-primary">#{habit.rank}</p>
            </div>
          </div>
        ))}
      </div>
      
      {habits.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Award size={48} className="mx-auto mb-4 opacity-50" />
          <p>No habits to display</p>
          <p className="text-sm">Start building habits to see your leaderboard!</p>
        </div>
      )}
    </div>
  );
}
