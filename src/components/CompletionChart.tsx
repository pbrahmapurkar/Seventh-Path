import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  ymd: string;
  label: string;
  completed: number;
  total: number;
  pct: number;
}

interface CompletionChartProps {
  data: ChartData[];
  onDayClick?: (day: ChartData) => void;
  className?: string;
}

export function CompletionChart({ data, onDayClick, className = '' }: CompletionChartProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const getBarColor = (pct: number): string => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 60) return 'bg-yellow-500';
    if (pct >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getBarHeight = (pct: number): number => {
    return Math.max(8, (pct / 100) * 100);
  };

  const getTrendIcon = (pct: number) => {
    if (pct >= 70) return <TrendingUp size={12} className="text-green-400" />;
    if (pct <= 30) return <TrendingDown size={12} className="text-red-400" />;
    return null;
  };

  // Generate sample data if no data provided
  const chartData = data.length > 0 ? data : [
    { ymd: '2024-01-01', label: 'Mon', completed: 0, total: 0, pct: 0 },
    { ymd: '2024-01-02', label: 'Tue', completed: 0, total: 0, pct: 0 },
    { ymd: '2024-01-03', label: 'Wed', completed: 0, total: 0, pct: 0 },
    { ymd: '2024-01-04', label: 'Thu', completed: 0, total: 0, pct: 0 },
    { ymd: '2024-01-05', label: 'Fri', completed: 0, total: 0, pct: 0 },
    { ymd: '2024-01-06', label: 'Sat', completed: 0, total: 0, pct: 0 },
    { ymd: '2024-01-07', label: 'Sun', completed: 0, total: 0, pct: 0 },
  ];

  return (
    <div className={`rounded-xl bg-card border border-border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Completion Chart</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>80%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>&lt;60%</span>
          </div>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="text-4xl mb-4 opacity-50">📊</div>
          <h4 className="font-medium mb-2">No Data Available</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking habits to see your completion chart
          </p>
          <div className="text-xs text-muted-foreground">
            Add habits and mark them complete to build your chart
          </div>
        </div>
      ) : (
        <div className="grid h-48 grid-flow-col gap-2 items-end">
          {chartData.map((day, index) => {
            const height = getBarHeight(day.pct);
            const isHovered = hoveredDay === day.ymd;
            
            return (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="relative w-full h-full flex items-end">
                  <div className="w-full bg-muted rounded-full h-full flex items-end">
                    <div
                      className={`w-full rounded-full transition-all duration-300 hover:opacity-80 cursor-pointer ${getBarColor(day.pct)}`}
                      style={{ height: `${height}%` }}
                      onClick={() => onDayClick?.(day)}
                      onMouseEnter={() => setHoveredDay(day.ymd)}
                      onMouseLeave={() => setHoveredDay(null)}
                      role="button"
                      tabIndex={0}
                      aria-label={`${day.label} - ${day.pct}% completion`}
                    />
                  </div>
                  
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-popover border border-border rounded-lg px-2 py-1 text-xs whitespace-nowrap z-10">
                      <div className="font-medium">{day.pct}%</div>
                      <div className="text-muted-foreground">{day.completed}/{day.total} habits</div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs font-medium text-muted-foreground">{day.label}</p>
                  {getTrendIcon(day.pct)}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {data.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Tap any bar to view detailed breakdown
        </div>
      )}
    </div>
  );
}
