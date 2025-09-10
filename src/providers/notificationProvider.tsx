/**
 * Notification Provider for React Context
 * Manages notification state and provides hooks for components
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  notificationService, 
  NotificationPermission, 
  ScheduledNotification 
} from '../services/notifications';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useHabitsStore } from '../store/HabitsStore';
// Ensure numeric ids for native notifications (Java int range)
function toJavaIntId(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  h = Math.abs(h);
  if (h === 0) h = 1;
  return h % 2147483647;
}
function getNativeSoundName(): string {
  const platform = Capacitor.getPlatform();
  // iOS expects filename with extension included in app bundle; Android uses channel sound name without extension
  return platform === 'ios' ? 'ting.caf' : 'ting';
}

interface NotificationContextType {
  // Permission state
  permission: NotificationPermission | null;
  isPermissionGranted: boolean;
  isEnabled: boolean;
  setEnabled: (on: boolean) => Promise<void>;
  
  // Notification management
  scheduledNotifications: ScheduledNotification[];
  requestPermission: () => Promise<NotificationPermission>;
  scheduleHabitReminder: (
    habitId: string,
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency?: 'daily' | 'weekly',
    weekdays?: number[]
  ) => Promise<string>;
  cancelHabitReminder: (notificationId: string) => Promise<void>;
  cancelHabitReminders: (habitId: string) => Promise<void>;
  cancelAllReminders: () => Promise<void>;
  updateHabitReminder: (
    habitId: string,
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency?: 'daily' | 'weekly',
    weekdays?: number[]
  ) => Promise<string>;
  
  // Utility functions
  sendTestNotification: (title: string, body: string) => Promise<void>;
  rescheduleAllNotifications: () => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('notificationsEnabled') !== 'false'; } catch { return true; }
  });

  // Helper: compute next N occurrence dates for a given time/frequency
  function getNextOccurrenceDates(
    hours: number,
    minutes: number,
    frequency: 'daily' | 'weekly',
    weekdays?: number[], // 0-6 Sun-Sat
    count: number = 7
  ): Date[] {
    const dates: Date[] = [];
    const now = new Date();
    if (frequency === 'daily' || !weekdays || weekdays.length === 0) {
      let d = new Date();
      d.setHours(hours, minutes, 0, 0);
      // If passed, apply testing rule: allow within next 5m; else roll to tomorrow
      const diff = d.getTime() - now.getTime();
      if (!(diff >= 60_000 || (diff >= 0 && diff < 5 * 60_000))) {
        d.setDate(d.getDate() + 1);
      }
      for (let i = 0; i < count; i++) {
        const at = new Date(d.getTime() + i * 24 * 60 * 60 * 1000);
        dates.push(at);
      }
    } else {
      // Weekly: walk forward day by day collecting matching weekdays
      let day = 0;
      let cur = new Date();
      cur.setHours(hours, minutes, 0, 0);
      while (dates.length < count && day < 21) { // cap walk to 3 weeks
        const candidate = new Date(cur.getTime() + day * 24 * 60 * 60 * 1000);
        const dow = candidate.getDay();
        const isToday = day === 0;
        if (weekdays.includes(dow)) {
          const diff = candidate.getTime() - now.getTime();
          if (!isToday || (diff >= 60_000 || (diff >= 0 && diff < 5 * 60_000))) {
            dates.push(candidate);
          }
        }
        day++;
      }
      // If we couldn't fill count due to testing rule, continue into next weeks
      while (dates.length < count) {
        const last = dates[dates.length - 1] || new Date();
        const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
        const dow = next.getDay();
        if (weekdays.includes(dow)) {
          next.setHours(hours, minutes, 0, 0);
          dates.push(next);
        }
      }
    }
    return dates;
  }

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        setIsLoading(true);
        const isNative = Capacitor.getPlatform() !== 'web';

        if (isNative) {
          // Initialize high-importance notification channel for Android
          try {
            await LocalNotifications.createChannel({
              id: 'habit-reminders',
              name: 'Habit Reminders',
              description: 'Notifications for habit reminders',
              importance: 4, // High importance
              visibility: 1, // Public
              sound: 'default',
              lights: true,
              vibration: true,
            });
          } catch (err) {
            console.warn('Failed to create notification channel:', err);
          }

          // Register action types (Snooze, Mark Done)
          try {
            await LocalNotifications.registerActionTypes({
              types: [
                {
                  id: 'HABIT_REM',
                  actions: [
                    { id: 'DONE', title: 'Mark Done' },
                    { id: 'SNOOZE', title: 'Snooze 10m' },
                  ],
                },
              ],
            });
          } catch {}

          // Check permission status
          const permissionStatus = await LocalNotifications.checkPermissions();
          const granted = permissionStatus.display === 'granted';
          setPermission({ 
            granted, 
            canAskAgain: permissionStatus.display !== 'denied', 
            status: permissionStatus.display 
          });
          setScheduledNotifications([]);
        } else {
          // Web fallback
          const currentPermission = notificationService.getPermissionStatus();
          setPermission(currentPermission);
          const notifications = notificationService.getScheduledNotifications();
          setScheduledNotifications(notifications);
          if (currentPermission?.granted) {
            await notificationService.rescheduleAllNotifications();
          }
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize notifications');
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();
  }, []);

  // Listen for notification events
  useEffect(() => {
    const handleNotificationClick = (event: CustomEvent) => {
      const { habitId } = event.detail;
      console.log('Notification clicked for habit:', habitId);
      // This would typically navigate to the habit detail screen
    };

    const handleNotificationAction = (event: CustomEvent) => {
      const { habitId, action } = event.detail;
      console.log('Notification action:', action, 'for habit:', habitId);
      // This would handle the action (complete, snooze, skip)
    };

    window.addEventListener('notification-click', handleNotificationClick as EventListener);
    window.addEventListener('notification-action', handleNotificationAction as EventListener);

    // Native listener: actions
    try {
      LocalNotifications.addListener('localNotificationActionPerformed', async (action) => {
        try {
          const info = action?.notification;
          const extra = info?.extra || {};
          const habitId: string | undefined = extra.habitId;
          const time: string | undefined = extra.time;
          const actionId: string | undefined = (action as any)?.actionId;
          if (!habitId) return;
          const store = useHabitsStore.getState();
          if (actionId === 'DONE' && time) {
            // Cancel this instance id and mark done
            const id = info?.id;
            if (typeof id === 'number') {
              try { await LocalNotifications.cancel({ notifications: [{ id }] }); } catch {}
            }
            try { await store.toggleTime(habitId, time); } catch (e) { console.warn(e); }
          } else if (actionId === 'SNOOZE') {
            // Schedule one-off +10 minutes
            const at = new Date(Date.now() + 10 * 60 * 1000);
            const nativeId = toJavaIntId(`snooze|${habitId}|${at.getTime()}`);
            await LocalNotifications.schedule({ notifications: [{ id: nativeId, title: info?.title || 'Reminder', body: info?.body || '', schedule: { at }, channelId: 'habit-reminders-ting', sound: getNativeSoundName(), extra: { habitId, type: 'habit-reminder', snoozed: true } }] });
          }
        } catch (e) {
          console.warn('Action handler error', e);
        }
      });
    } catch {}

    return () => {
      window.removeEventListener('notification-click', handleNotificationClick as EventListener);
      window.removeEventListener('notification-action', handleNotificationAction as EventListener);
    };
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    try {
      setIsLoading(true);
      setError(null);
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // Request permission using LocalNotifications
        const permissionStatus = await LocalNotifications.requestPermissions();
        const granted = permissionStatus.display === 'granted';
        const perm: NotificationPermission = { 
          granted, 
          canAskAgain: permissionStatus.display !== 'denied', 
          status: permissionStatus.display 
        };
        setPermission(perm);
        return perm;
      } else {
        const newPermission = await notificationService.requestPermission();
        setPermission(newPermission);
        return newPermission;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setEnabled = async (on: boolean) => {
    try {
      setIsLoading(true);
      setIsEnabled(on);
      try { localStorage.setItem('notificationsEnabled', on ? 'true' : 'false'); } catch {}
      if (!on) {
        // Cancel all scheduled notifications when disabled
        await cancelAllReminders();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleHabitReminder = async (
    habitId: string,
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency: 'daily' | 'weekly' = 'daily',
    weekdays?: number[]
  ): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      if (!isEnabled) throw new Error('Notifications disabled');
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // New approach: one-shot notifications for the next 7 occurrences (no repeats), so we can reschedule precisely
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const baseTitle = `${emoji} ${title}`;
        const body = `Time for your ${title} session!`;
        const nextDates = getNextOccurrenceDates(hours, minutes, frequency, weekdays, 7);
        const ids: number[] = [];
        const toSchedule: any[] = [];
        for (const d of nextDates) {
          const ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          const idKey = `${habitId}|${ymd}|${scheduledTime}`;
          const nativeId = toJavaIntId(idKey);
          ids.push(nativeId);
          toSchedule.push({ id: nativeId, title: baseTitle, body, schedule: { at: d }, channelId: 'habit-reminders-ting', sound: getNativeSoundName(), actionTypeId: 'HABIT_REM', extra: { habitId, time: scheduledTime, date: ymd, type: 'habit-reminder' } });
        }
        if (toSchedule.length) {
          await LocalNotifications.schedule({ notifications: toSchedule });
          setHabitScheduledIds(habitId, [...getHabitScheduledIds(habitId), ...ids]);
        }
        return `native-${habitId}-${scheduledTime}`;
      } else {
        const notificationId = await notificationService.scheduleHabitReminder(
          habitId,
          title,
          emoji,
          scheduledTime,
          frequency,
          weekdays
        );
        const notifications = notificationService.getScheduledNotifications();
        setScheduledNotifications(notifications);
        return notificationId;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule reminder';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelHabitReminder = async (notificationId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // For native, prefer cancel by habit via cancelHabitReminders instead
        // no-op here
      } else {
        await notificationService.cancelHabitReminder(notificationId);
        const notifications = notificationService.getScheduledNotifications();
        setScheduledNotifications(notifications);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel reminder';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelHabitReminders = async (habitId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // Get all pending notifications and cancel those for this habit
        const pending = await LocalNotifications.getPending();
        const habitNotifications = pending.notifications.filter(
          n => n.extra?.habitId === habitId
        );
        
        if (habitNotifications.length > 0) {
          await LocalNotifications.cancel({
            notifications: habitNotifications.map(n => ({ id: n.id }))
          });
        }
        // Also clear our stored id mapping
        clearHabitScheduledIds(habitId);
      } else {
        await notificationService.cancelHabitReminders(habitId);
        const notifications = notificationService.getScheduledNotifications();
        setScheduledNotifications(notifications);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel reminders';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAllReminders = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // Cancel all pending notifications
        await LocalNotifications.cancelAll();
        setScheduledNotifications([]);
      } else {
        await notificationService.cancelAllReminders();
        const notifications = notificationService.getScheduledNotifications();
        setScheduledNotifications(notifications);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel all reminders';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHabitReminder = async (
    habitId: string,
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency: 'daily' | 'weekly' = 'daily',
    weekdays?: number[]
  ): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // Cancel existing notifications for this habit
        await cancelHabitReminders(habitId);
        // Schedule new notification
        return await scheduleHabitReminder(habitId, title, emoji, scheduledTime, frequency, weekdays);
      } else {
        const notificationId = await notificationService.updateHabitReminder(
          habitId,
          title,
          emoji,
          scheduledTime,
          frequency,
          weekdays
        );
        const notifications = notificationService.getScheduledNotifications();
        setScheduledNotifications(notifications);
        return notificationId;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reminder';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async (title: string, body: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      if (!isEnabled) throw new Error('Notifications disabled');
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // Send immediate notification using LocalNotifications with safe int id
        const id = toJavaIntId(`test-${Date.now()}`);
        await LocalNotifications.schedule({
          notifications: [{ id, title, body, channelId: 'habit-reminders-ting', sound: getNativeSoundName() }]
        });
      } else {
        await notificationService.sendTestNotification(title, body);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rescheduleAllNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // Native alarms are rescheduled by BootReceiver; nothing to do here
      } else {
        await notificationService.rescheduleAllNotifications();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reschedule notifications';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: NotificationContextType = {
    permission,
    isPermissionGranted: permission?.granted ?? false,
    isEnabled,
    setEnabled,
    scheduledNotifications,
    requestPermission,
    scheduleHabitReminder,
    cancelHabitReminder,
    cancelHabitReminders,
    cancelAllReminders,
    updateHabitReminder,
    sendTestNotification,
    rescheduleAllNotifications,
    isLoading,
    error
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 */
export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

/**
 * Hook for habit-specific notification operations
 */
export function useHabitNotifications(habitId: string) {
  const { scheduledNotifications, scheduleHabitReminder, cancelHabitReminders, updateHabitReminder } = useNotifications();
  
  const habitNotifications = scheduledNotifications.filter(n => n.habitId === habitId);
  const hasReminder = habitNotifications.length > 0;
  const reminderTime = habitNotifications[0]?.scheduledTime;

  const scheduleReminder = async (
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency: 'daily' | 'weekly' = 'daily',
    weekdays?: number[]
  ) => {
    return scheduleHabitReminder(habitId, title, emoji, scheduledTime, frequency, weekdays);
  };

  const cancelReminder = async () => {
    return cancelHabitReminders(habitId);
  };

  const updateReminder = async (
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency: 'daily' | 'weekly' = 'daily',
    weekdays?: number[]
  ) => {
    return updateHabitReminder(habitId, title, emoji, scheduledTime, frequency, weekdays);
  };

  return {
    habitNotifications,
    hasReminder,
    reminderTime,
    scheduleReminder,
    cancelReminder,
    updateReminder
  };
}
