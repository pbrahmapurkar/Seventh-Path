import React, { useMemo, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, Plus, X, Bell, BellOff, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiTimePickerProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void | Promise<void>;
  times: string[];
  onChange: (times: string[]) => void;
  defaultTime?: string;
  disabled?: boolean;
  onAutoSave?: (times: string[]) => Promise<void>;
}

const SUGGESTED = ['07:00', '08:00', '09:00', '12:00', '18:00', '21:00'];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function MultiTimePicker({ enabled, onEnabledChange, times, onChange, defaultTime = '08:00', disabled = false, onAutoSave }: MultiTimePickerProps) {
  const [customTime, setCustomTime] = useState(defaultTime);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastAddedTime, setLastAddedTime] = useState<string | null>(null);
  const sortedTimes = useMemo(() => [...times].sort(), [times]);

  const toggleTime = async (t: string) => {
    if (times.includes(t)) {
      await removeTime(t);
    } else {
      await addTime(t);
    }
  };

  const addTime = async (t: string) => {
    if (!t) return;
    if (!times.includes(t)) {
      const newTimes = [...times, t];
      onChange(newTimes);
      setLastAddedTime(t);
      setShowConfirmation(true);
      
      // Auto-save if callback provided
      if (onAutoSave) {
        try {
          await onAutoSave(newTimes);
        } catch (error) {
          console.error('Auto-save failed:', error);
          // Revert the change if auto-save failed
          onChange(times);
          setShowConfirmation(false);
          return;
        }
      }
      
      // Hide confirmation after 2 seconds
      setTimeout(() => setShowConfirmation(false), 2000);
    }
    if (!enabled) onEnabledChange(true);
  };

  const removeTime = async (t: string) => {
    const newTimes = times.filter(x => x !== t);
    onChange(newTimes);
    
    // Auto-save if callback provided
    if (onAutoSave) {
      try {
        await onAutoSave(newTimes);
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Revert the change if auto-save failed
        onChange(times);
        return;
      }
    }
    
    if (times.length <= 1) onEnabledChange(false);
  };

  return (
    <div className="bg-gradient-to-r from-card to-card/50 border border-border rounded-2xl p-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {showConfirmation && lastAddedTime && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
          >
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Reminder time updated: {formatTime(lastAddedTime)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Bell className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Reminder Settings</h2>
      </div>
      
      <div className="space-y-6">
        {/* Enhanced Enable/Disable Toggle */}
        <div className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
          enabled 
            ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/10 border-green-200 dark:border-green-800' 
            : 'bg-gradient-to-r from-muted/30 to-muted/10 border-border hover:border-primary/30'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
              enabled 
                ? 'bg-green-100 dark:bg-green-900/30 scale-105 shadow-lg' 
                : 'bg-muted/50'
            }`}>
              {enabled ? (
                <Bell className="w-7 h-7 text-green-600 dark:text-green-400" />
              ) : (
                <BellOff className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className={`font-semibold text-xl transition-colors ${
                enabled ? 'text-green-700 dark:text-green-300' : ''
              }`}>Enable reminders</h3>
              <p className="text-sm text-muted-foreground">
                {enabled 
                  ? 'You\'ll receive notifications at your selected times' 
                  : 'Turn on to get notified about your habit'
                }
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onEnabledChange(!enabled)}
            className={`relative w-16 h-9 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${
              enabled 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-pressed={enabled}
            aria-label={enabled ? 'Disable reminders' : 'Enable reminders'}
          >
            <span className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ${
              enabled ? 'translate-x-8' : 'translate-x-1'
            }`}>
              <div className="w-full h-full rounded-full flex items-center justify-center">
                {enabled ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-gray-500" />
                )}
              </div>
            </span>
          </button>
        </div>

        {enabled && (
          <div className="space-y-6">
            {/* Enhanced Suggested Times */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Label className="text-base font-medium">Quick select times</Label>
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{SUGGESTED.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SUGGESTED.map((t, index) => (
                  <Button 
                    key={t} 
                    variant={times.includes(t) ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={async () => await toggleTime(t)} 
                    disabled={disabled}
                    className={`h-14 transition-all duration-300 ${
                      times.includes(t) 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105 border-primary' 
                        : 'hover:scale-102 hover:border-primary/50'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold text-base">{formatTime(t)}</div>
                        <div className="text-xs opacity-80">
                          {t === '07:00' ? 'Early morning' :
                           t === '08:00' ? 'Morning' :
                           t === '09:00' ? 'Late morning' :
                           t === '12:00' ? 'Lunch time' :
                           t === '18:00' ? 'Evening' :
                           t === '21:00' ? 'Night' : 'Custom'}
                        </div>
                      </div>
                      {times.includes(t) && (
                        <CheckCircle2 className="w-5 h-5 ml-auto" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Time Input */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Add custom time</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 p-4 border-2 border-border rounded-xl bg-background hover:border-primary/50 transition-colors flex-1">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="time"
                    value={customTime}
                    onChange={async (e) => {
                      setCustomTime(e.target.value);
                      // Auto-save when time changes
                      if (e.target.value && e.target.value !== defaultTime) {
                        await addTime(e.target.value);
                      }
                    }}
                    className="bg-transparent outline-none text-lg font-medium flex-1"
                    disabled={disabled}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={async () => await addTime(customTime)} 
                  disabled={disabled}
                  className="h-12 px-6 hover:scale-105 transition-transform"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                💡 Time saves automatically when you select it
              </p>
            </div>

            {/* Selected Times */}
            {sortedTimes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">Selected times</Label>
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{sortedTimes.length}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sortedTimes.map((t, index) => (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        ...(lastAddedTime === t && showConfirmation ? {
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            '0 0 0 0 rgba(59, 130, 246, 0.4)',
                            '0 0 0 10px rgba(59, 130, 246, 0)',
                            '0 0 0 0 rgba(59, 130, 246, 0)'
                          ]
                        } : {})
                      }}
                      transition={{ 
                        duration: 0.3,
                        delay: index * 0.1,
                        ...(lastAddedTime === t && showConfirmation ? {
                          scale: { duration: 0.6, ease: "easeInOut" },
                          boxShadow: { duration: 0.6, ease: "easeOut" }
                        } : {})
                      }}
                      className="group inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-300 relative"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{formatTime(t)}</span>
                      {lastAddedTime === t && showConfirmation && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                      <button 
                        type="button" 
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 dark:hover:bg-red-900 rounded-full p-1" 
                        onClick={async () => await removeTime(t)} 
                        disabled={disabled} 
                        aria-label={`Remove ${formatTime(t)}`}
                      >
                        <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
