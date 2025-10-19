/**
 * Timer Configuration Component
 * Used in habit creation/editing to configure timer settings
 */

import React, { useState } from 'react';
import { Clock, Timer, Zap } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import type { TimerConfig, TimerMode } from '../../types/timer';

interface TimerConfigurationProps {
  config: TimerConfig;
  onChange: (config: TimerConfig) => void;
}

export function TimerConfiguration({ config, onChange }: TimerConfigurationProps) {
  const [hours, setHours] = useState(
    config.defaultDuration ? Math.floor(config.defaultDuration / 3600) : 0
  );
  const [minutes, setMinutes] = useState(
    config.defaultDuration ? Math.floor((config.defaultDuration % 3600) / 60) : 30
  );

  const handleEnabledChange = (enabled: boolean) => {
    onChange({ ...config, enabled });
  };

  const handleModeChange = (mode: TimerMode) => {
    onChange({ ...config, mode });
  };

  const handleDurationChange = (newHours: number, newMinutes: number) => {
    const totalSeconds = (newHours * 3600) + (newMinutes * 60);
    onChange({ ...config, defaultDuration: totalSeconds });
  };

  const handleAutoCompleteChange = (autoComplete: boolean) => {
    onChange({ ...config, autoCompleteHabit: autoComplete });
  };

  const quickDurations = [
    { label: '15 min', minutes: 15 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '1 hour', minutes: 60 },
    { label: '2 hours', minutes: 120 },
  ];

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Enable Timer Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Label className="text-base font-semibold">Enable Timer</Label>
              <p className="text-sm text-muted-foreground">Track time spent on this habit</p>
            </div>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={handleEnabledChange}
          />
        </div>

        {config.enabled && (
          <>
            {/* Timer Mode Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Timer Mode</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={config.mode === 'countdown' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('countdown')}
                  className="h-auto py-4 flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">Countdown</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    Set a target duration
                  </span>
                </Button>

                <Button
                  type="button"
                  variant={config.mode === 'stopwatch' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('stopwatch')}
                  className="h-auto py-4 flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-semibold">Stopwatch</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    Track how long you go
                  </span>
                </Button>
              </div>
            </div>

            {/* Duration Settings (for countdown mode) */}
            {config.mode === 'countdown' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Default Duration</Label>
                
                {/* Quick Duration Buttons */}
                <div className="flex flex-wrap gap-2">
                  {quickDurations.map((duration) => (
                    <Button
                      key={duration.minutes}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const h = Math.floor(duration.minutes / 60);
                        const m = duration.minutes % 60;
                        setHours(h);
                        setMinutes(m);
                        handleDurationChange(h, m);
                      }}
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>

                {/* Custom Duration Inputs */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="timer-hours" className="text-sm">Hours</Label>
                    <Input
                      id="timer-hours"
                      type="number"
                      min="0"
                      max="23"
                      value={hours}
                      onChange={(e) => {
                        const h = parseInt(e.target.value) || 0;
                        setHours(h);
                        handleDurationChange(h, minutes);
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="timer-minutes" className="text-sm">Minutes</Label>
                    <Input
                      id="timer-minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => {
                        const m = parseInt(e.target.value) || 0;
                        setMinutes(m);
                        handleDurationChange(hours, m);
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Auto-complete Habit Option */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <Label className="text-sm font-semibold">Auto-complete habit</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Mark habit as done when timer completes
                </p>
              </div>
              <Switch
                checked={config.autoCompleteHabit ?? false}
                onCheckedChange={handleAutoCompleteChange}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
