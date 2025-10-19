/**
 * Timer Session List - Display past timer sessions
 */

import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import type { TimerSession } from '../../types/timer';
import { formatTime, formatDuration } from '../../utils/timerUtils';
import { format } from 'date-fns';

interface TimerSessionListProps {
  sessions: TimerSession[];
  limit?: number;
}

export function TimerSessionList({ sessions, limit }: TimerSessionListProps) {
  const displaySessions = limit ? sessions.slice(0, limit) : sessions;
  const sortedSessions = [...displaySessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  if (sortedSessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No timer sessions yet</p>
        <p className="text-sm mt-1">Start a timer to track your progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedSessions.map((session) => {
        const startDate = new Date(session.startTime);
        const isToday = format(startDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        
        return (
          <Card key={session.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {session.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-semibold">
                    {formatTime(session.duration)}
                  </span>
                  {session.mode === 'countdown' && session.targetDuration && (
                    <span className="text-sm text-muted-foreground">
                      / {formatTime(session.targetDuration)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {isToday ? 'Today' : format(startDate, 'MMM d, yyyy')} at{' '}
                    {format(startDate, 'h:mm a')}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge variant={session.mode === 'countdown' ? 'default' : 'secondary'}>
                  {session.mode === 'countdown' ? 'Countdown' : 'Stopwatch'}
                </Badge>
                {session.completed && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Progress bar for countdown mode */}
            {session.mode === 'countdown' && session.targetDuration && (
              <div className="mt-3">
                <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      session.completed ? 'bg-green-500' : 'bg-primary'
                    }`}
                    style={{
                      width: `${Math.min(100, (session.duration / session.targetDuration) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </Card>
        );
      })}
      
      {limit && sessions.length > limit && (
        <p className="text-sm text-center text-muted-foreground">
          Showing {limit} of {sessions.length} sessions
        </p>
      )}
    </div>
  );
}
