import React, { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, Plus, X } from 'lucide-react';

interface MultiTimePickerProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  times: string[];
  onChange: (times: string[]) => void;
  defaultTime?: string;
  disabled?: boolean;
}

const SUGGESTED = ['07:00', '08:00', '09:00', '12:00', '18:00', '21:00'];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function MultiTimePicker({ enabled, onEnabledChange, times, onChange, defaultTime = '08:00', disabled = false }: MultiTimePickerProps) {
  const [customTime, setCustomTime] = useState(defaultTime);
  const sortedTimes = useMemo(() => [...times].sort(), [times]);

  const addTime = (t: string) => {
    if (!t) return;
    if (!times.includes(t)) onChange([...times, t]);
    if (!enabled) onEnabledChange(true);
  };

  const removeTime = (t: string) => {
    onChange(times.filter(x => x !== t));
    if (times.length <= 1) onEnabledChange(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock size={20} /> Reminder Times
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Enable reminders</Label>
            <p className="text-sm text-muted-foreground">Get notified at your selected times</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onEnabledChange(!enabled)}
            className={`w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
            aria-pressed={enabled}
            aria-label="Toggle reminders"
          >
            <span className={`block w-6 h-6 bg-white rounded-full translate-y-0.5 transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {enabled && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {SUGGESTED.map((t) => (
                <Button key={t} variant={times.includes(t) ? 'default' : 'outline'} size="sm" onClick={() => addTime(t)} disabled={disabled}>
                  {formatTime(t)}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-card">
                <Clock size={18} className="text-muted-foreground" />
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="bg-transparent outline-none"
                  disabled={disabled}
                />
              </div>
              <Button variant="outline" onClick={() => addTime(customTime)} disabled={disabled}>
                <Plus size={16} className="mr-2" /> Add Time
              </Button>
            </div>

            {sortedTimes.length > 0 && (
              <div className="space-y-2">
                <Label>Selected times</Label>
                <div className="flex flex-wrap gap-2">
                  {sortedTimes.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded bg-muted">
                      {formatTime(t)}
                      <button type="button" className="ml-1" onClick={() => removeTime(t)} disabled={disabled} aria-label={`Remove ${formatTime(t)}`}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

