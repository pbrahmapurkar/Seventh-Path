/**
 * Reminder Time Picker Component
 * Provides a beautiful time selection interface for habit reminders
 */

import React, { useState } from 'react';
import { Clock, Bell, BellOff } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ReminderTimePickerProps {
  value?: string; // HH:MM format
  onChange: (time: string | null) => void;
  frequency?: 'daily' | 'weekly';
  onFrequencyChange?: (frequency: 'daily' | 'weekly') => void;
  weekdays?: number[];
  onWeekdaysChange?: (weekdays: number[]) => void;
  disabled?: boolean;
  className?: string;
}

const timeSlots = [
  { value: '06:00', label: '6:00 AM', description: 'Early morning' },
  { value: '07:00', label: '7:00 AM', description: 'Morning' },
  { value: '08:00', label: '8:00 AM', description: 'Morning' },
  { value: '09:00', label: '9:00 AM', description: 'Late morning' },
  { value: '12:00', label: '12:00 PM', description: 'Lunch time' },
  { value: '15:00', label: '3:00 PM', description: 'Afternoon' },
  { value: '18:00', label: '6:00 PM', description: 'Evening' },
  { value: '20:00', label: '8:00 PM', description: 'Night' },
  { value: '21:00', label: '9:00 PM', description: 'Late evening' },
];

const weekdayOptions = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
];

export function ReminderTimePicker({
  value,
  onChange,
  frequency = 'daily',
  onFrequencyChange,
  weekdays = [],
  onWeekdaysChange,
  disabled = false,
  className = ''
}: ReminderTimePickerProps) {
  const [isEnabled, setIsEnabled] = useState(!!value);
  const [selectedTime, setSelectedTime] = useState(value || '09:00');
  const [selectedFrequency, setSelectedFrequency] = useState(frequency);
  const [selectedWeekdays, setSelectedWeekdays] = useState(weekdays);

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (enabled) {
      onChange(selectedTime);
    } else {
      onChange(null);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (isEnabled) {
      onChange(time);
    }
  };

  const handleFrequencyChange = (newFrequency: 'daily' | 'weekly') => {
    setSelectedFrequency(newFrequency);
    onFrequencyChange?.(newFrequency);
    
    // Reset weekdays if switching to daily
    if (newFrequency === 'daily') {
      setSelectedWeekdays([]);
      onWeekdaysChange?.([]);
    }
  };

  const handleWeekdayToggle = (weekday: number) => {
    const newWeekdays = selectedWeekdays.includes(weekday)
      ? selectedWeekdays.filter(d => d !== weekday)
      : [...selectedWeekdays, weekday].sort();
    
    setSelectedWeekdays(newWeekdays);
    onWeekdaysChange?.(newWeekdays);
  };

  const formatTimeDisplay = (time: string) => {
    const slot = timeSlots.find(s => s.value === time);
    return slot ? slot.label : time;
  };

  const formatWeekdaysDisplay = () => {
    if (selectedWeekdays.length === 0) return 'No days selected';
    if (selectedWeekdays.length === 7) return 'Every day';
    
    const dayLabels = selectedWeekdays.map(d => weekdayOptions[d].label);
    return dayLabels.join(', ');
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell size={20} />
          Reminder Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Enable reminder</Label>
            <p className="text-sm text-muted-foreground">
              Get notified to complete your habit
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={disabled}
          />
        </div>

        {isEnabled && (
          <>
            {/* Frequency Selection */}
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select 
                value={selectedFrequency} 
                onValueChange={handleFrequencyChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label>Reminder time</Label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.value}
                    variant={selectedTime === slot.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeChange(slot.value)}
                    disabled={disabled}
                    className="flex flex-col h-auto py-2"
                  >
                    <span className="font-medium">{slot.label}</span>
                    <span className="text-xs text-muted-foreground">{slot.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Weekly Day Selection */}
            {selectedFrequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Days of the week</Label>
                <div className="flex flex-wrap gap-2">
                  {weekdayOptions.map((day) => (
                    <Button
                      key={day.value}
                      variant={selectedWeekdays.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleWeekdayToggle(day.value)}
                      disabled={disabled}
                      className="min-w-[60px]"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
                {selectedWeekdays.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formatWeekdaysDisplay()}
                  </p>
                )}
              </div>
            )}

            {/* Preview */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">Reminder Preview</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm">
                  <Badge variant="secondary" className="mr-2">
                    {selectedFrequency}
                  </Badge>
                  at {formatTimeDisplay(selectedTime)}
                </p>
                {selectedFrequency === 'weekly' && selectedWeekdays.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatWeekdaysDisplay()}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Notification Permission Banner Component
 * Shows when notification permissions are needed
 */

interface NotificationPermissionBannerProps {
  onRequestPermission: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function NotificationPermissionBanner({
  onRequestPermission,
  isLoading = false,
  className = ''
}: NotificationPermissionBannerProps) {
  return (
    <Card className={`border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Bell size={20} className="text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
              Enable Notifications
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              Allow notifications to receive gentle reminders for your habits. You can change this anytime in settings.
            </p>
            <Button
              size="sm"
              onClick={onRequestPermission}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isLoading ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Notification Status Indicator Component
 * Shows current notification status and quick actions
 */

interface NotificationStatusIndicatorProps {
  isEnabled: boolean;
  reminderTime?: string;
  onToggle: () => void;
  onEdit: () => void;
  className?: string;
}

export function NotificationStatusIndicator({
  isEnabled,
  reminderTime,
  onToggle,
  onEdit,
  className = ''
}: NotificationStatusIndicatorProps) {
  return (
    <div className={`flex items-center justify-between p-3 bg-card border border-border rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        {isEnabled ? (
          <Bell size={20} className="text-green-600 dark:text-green-400" />
        ) : (
          <BellOff size={20} className="text-muted-foreground" />
        )}
        <div>
          <p className="font-medium">
            {isEnabled ? 'Reminder enabled' : 'No reminder set'}
          </p>
          {isEnabled && reminderTime && (
            <p className="text-sm text-muted-foreground">
              Daily at {reminderTime}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggle}
          size="sm"
        />
        {isEnabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
