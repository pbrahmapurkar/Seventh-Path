import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface CalendarDay {
  date: number;
  ymd: string; // YYYY-MM-DD format
  isCurrentMonth: boolean;
  isToday: boolean;
  isCompleted: boolean;
  isPast: boolean;
}

interface CompletionCalendarProps {
  view: 'week' | 'month';
  onDateClick?: (date: string) => void;
  completedDates?: string[]; // Array of YYYY-MM-DD strings
  className?: string;
}

export function CompletionCalendar({ 
  view, 
  onDateClick, 
  completedDates = [], 
  className = '' 
}: CompletionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const todayYMD = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (view === 'week') {
      // Generate 7 days starting from Monday of current week
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = startOfWeek.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
      startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);

      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        return {
          date: date.getDate(),
          ymd,
          isCurrentMonth: true,
          isToday: ymd === todayYMD,
          isCompleted: completedDates.includes(ymd),
          isPast: date < today && ymd !== todayYMD
        };
      });
    } else {
      // Generate full month calendar
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDayOfMonth.getDay();
      const daysInMonth = lastDayOfMonth.getDate();
      
      const days: CalendarDay[] = [];
      
      // Add days from previous month
      const prevMonth = new Date(year, month - 1, 0);
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = prevMonth.getDate() - i;
        const ymd = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        days.push({
          date,
          ymd,
          isCurrentMonth: false,
          isToday: false,
          isCompleted: false,
          isPast: true
        });
      }
      
      // Add days from current month
      for (let date = 1; date <= daysInMonth; date++) {
        const ymd = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        days.push({
          date,
          ymd,
          isCurrentMonth: true,
          isToday: ymd === todayYMD,
          isCompleted: completedDates.includes(ymd),
          isPast: new Date(year, month, date) < today && ymd !== todayYMD
        });
      }
      
      // Add days from next month to complete the grid
      const remainingDays = 42 - days.length; // 6 weeks * 7 days
      for (let date = 1; date <= remainingDays; date++) {
        const ymd = `${year}-${String(month + 2).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        days.push({
          date,
          ymd,
          isCurrentMonth: false,
          isToday: false,
          isCompleted: false,
          isPast: false
        });
      }
      
      return days;
    }
  };

  const calendarDays = useMemo(() => generateCalendarDays(), [currentDate, view, completedDates]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const getDayLabel = (index: number): string => {
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return dayLabels[index];
  };

  const getDateStyle = (day: CalendarDay): string => {
    if (!day.isCurrentMonth) {
      return 'text-muted-foreground/50';
    }
    
    // If today has 100% completion, show it in green
    if (day.isToday && day.isCompleted) {
      return 'bg-green-500 text-white border-2 border-green-600';
    }
    
    // If today but not completed, show as current day
    if (day.isToday && !day.isCompleted) {
      return 'bg-white text-black border-2 border-primary';
    }
    
    // Past days
    if (day.isPast) {
      if (day.isCompleted) {
        return 'bg-green-500 text-white';
      } else {
        return 'text-red-500';
      }
    }
    
    // Future days
    return 'text-muted-foreground';
  };

  const getDateClasses = (day: CalendarDay): string => {
    const baseClasses = 'w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full transition-colors cursor-pointer';
    const styleClasses = getDateStyle(day);
    
    return `${baseClasses} ${styleClasses}`;
  };

  const formatMonthYear = (): string => {
    return currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatWeekRange = (): string => {
    if (view === 'week') {
      const firstDay = calendarDays[0];
      const lastDay = calendarDays[6];
      const firstDate = new Date(firstDay.ymd);
      const lastDate = new Date(lastDay.ymd);
      
      if (firstDate.getMonth() === lastDate.getMonth()) {
        return `${firstDate.toLocaleDateString('en-US', { month: 'short' })} ${firstDate.getDate()}-${lastDate.getDate()}`;
      } else {
        return `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
    }
    return '';
  };

  return (
    <div className={`rounded-xl bg-card border border-border p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Completion Calendar</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => view === 'week' ? navigateWeek('prev') : navigateMonth('prev')}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {view === 'week' ? formatWeekRange() : formatMonthYear()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => view === 'week' ? navigateWeek('next') : navigateMonth('next')}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="text-center text-xs font-medium text-muted-foreground py-2">
            {getDayLabel(index)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid gap-1 ${view === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
        {calendarDays.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <button
              className={getDateClasses(day)}
              onClick={() => onDateClick?.(day.ymd)}
              disabled={!day.isCurrentMonth}
              aria-label={`${day.ymd} - ${day.isCompleted ? 'Completed' : 'Not completed'}`}
            >
              {day.date}
            </button>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>100% Complete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border border-red-500 rounded-full"></div>
          <span>Incomplete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-primary rounded-full"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
