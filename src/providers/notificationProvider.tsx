/**
 * Notification Provider for React Context
 * Manages notification state and provides hooks for components
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useHabitsStore } from '../store/HabitsStore';
import {
  runMigrationOnce,
  ensureReminderChannel,
  requestPermissions as requestNotifPermissions,
  checkPermissions as checkNotifPermissions,
  getPendingCount as getNativePendingCount,
  scheduleReminderInstances,
  rescheduleHabit,
  cancelAllForHabit as cancelAllForHabitNative,
  cancelTodayAtTime as cancelTodayAtTimeNative,
  toJavaIntId,
  getNativeSoundName,
} from '../lib/notifications/habitReminderSystem';

interface NotificationContextType {
  // Permission state
  permission: { granted: boolean; canAskAgain: boolean; status: 'granted' | 'denied' | 'prompt' } | null;
  isPermissionGranted: boolean;
  isEnabled: boolean;
  setEnabled: (on: boolean) => Promise<void>;
  
  // Notification management
  scheduledNotifications: { id: string; habitId: string; title: string; body: string; scheduledTime: string; frequency: 'daily' | 'weekly'; weekdays?: number[]; isActive: boolean; createdAt: Date }[];
  requestPermission: () => Promise<{ granted: boolean; canAskAgain: boolean; status: 'granted' | 'denied' | 'prompt' }>;
  checkAndRequestPermission: () => Promise<boolean>;
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
  const [permission, setPermission] = useState<{ granted: boolean; canAskAgain: boolean; status: 'granted' | 'denied' | 'prompt' } | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<NotificationContextType['scheduledNotifications']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('notificationsEnabled') !== 'false'; } catch { return true; }
  });

  // (migrated) computeNextOccurrences moved to habitReminderSystem

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        setIsLoading(true);
        const isNative = Capacitor.getPlatform() !== 'web';
        console.log('[NOTIFICATIONS init] start', { platform: Capacitor.getPlatform(), isNative });

        if (isNative) {
          await runMigrationOnce();
          await ensureReminderChannel();
          console.log('[NOTIFICATIONS init] reminder channel ensured');

          // Register action types (Snooze, Mark Done)
          try {
            await LocalNotifications.registerActionTypes({
              types: [
                {
                  id: 'HABIT_REM',
                  actions: [
                    { id: 'DONE', title: 'Mark Done' },
                    { id: 'SNOOZE', title: 'Snooze' },
                  ],
                },
              ],
            });
            console.log('[NOTIFICATIONS init] action types registered');
          } catch {}

          // Check permission status
          const display = await checkNotifPermissions();
          const permObj = { granted: display === 'granted', canAskAgain: display !== 'denied', status: display } as const;
          console.log('[NOTIFICATIONS init] permission status', permObj);
          setPermission(permObj);
          setScheduledNotifications([]);
          // After migration, reschedule from current habits if enabled + granted
          if (permObj.granted && isEnabled) {
            const habits = Object.values(useHabitsStore.getState().habitsById || {});
            for (const h of habits) await rescheduleHabit(h, h.frequency || 'daily', (h as any).weeklyDays);
          }
        } else {
          // Web: keep minimal state only
          setPermission({ granted: false, canAskAgain: true, status: 'prompt' });
          setScheduledNotifications([]);
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
    let removeActionListener: { remove: () => void } | undefined;
    try {
      LocalNotifications.addListener('localNotificationActionPerformed', async (action) => {
        try {
          console.log('[NOTIFICATION ACTION]', JSON.stringify(action, null, 2));
          const info = action?.notification;
          const extra = (info?.extra || {}) as Record<string, unknown>;
          const habitId: string | undefined = typeof extra.habitId === 'string' ? extra.habitId : undefined;
          const time: string | undefined = typeof extra.reminderTime === 'string' ? extra.reminderTime : undefined;
          const actionId: string | undefined = (action as any)?.actionId;
          if (!habitId) return;
          const store = useHabitsStore.getState();
          if (!actionId || actionId === 'tap') {
            try { window.dispatchEvent(new CustomEvent('notification-click', { detail: { habitId } })); } catch {}
          } else if (actionId === 'DONE' && time) {
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
            await LocalNotifications.schedule({
              notifications: [{
                id: nativeId,
                title: info?.title || 'Reminder',
                body: info?.body || '',
                schedule: { at },
                channelId: 'habit-reminders-ting',
                sound: getNativeSoundName(),
                smallIcon: info?.smallIcon,
                extra: { habitId, reminderTime: time, type: 'habit-reminder', snoozed: true },
                actionTypeId: info?.actionTypeId,
              }],
            });
          }
        } catch (e) {
          console.warn('Action handler error', e);
        }
      }).then((listener) => {
        removeActionListener = listener;
      }).catch((err) => {
        console.warn('Failed to register notification action listener', err);
      });
    } catch {}

    return () => {
      window.removeEventListener('notification-click', handleNotificationClick as EventListener);
      window.removeEventListener('notification-action', handleNotificationAction as EventListener);
      try {
        removeActionListener?.remove();
      } catch (err) {
        console.warn('Failed to remove LocalNotifications listener', err);
      }
    };
  }, []);

  const requestPermission = async (): Promise<{ granted: boolean; canAskAgain: boolean; status: 'granted' | 'denied' | 'prompt' }> => {
    try {
      setIsLoading(true);
      setError(null);
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        const display = await requestNotifPermissions();
        const perm = { granted: display === 'granted', canAskAgain: display !== 'denied', status: display } as const;
        console.log('[NOTIFICATIONS permission request]', perm);
        setPermission(perm);
        return perm;
      } else {
        const perm = { granted: false, canAskAgain: true, status: 'prompt' as const };
        console.log('[NOTIFICATIONS permission request:web]', perm);
        setPermission(perm);
        return perm;
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

  const checkAndRequestPermission = async (): Promise<boolean> => {
    const isNative = Capacitor.getPlatform() !== 'web';
    if (!isNative) {
      return true;
    }
    try {
      const status = await LocalNotifications.checkPermissions();
      const display = status.display as 'granted' | 'denied' | 'prompt' | undefined;
      if (display === 'granted') {
        setPermission({ granted: true, canAskAgain: true, status: 'granted' });
        return true;
      }
      if (display === 'prompt' || !display) {
        setPermission({ granted: false, canAskAgain: true, status: 'prompt' });
        const requestRes = await LocalNotifications.requestPermissions();
        const requestDisplay = (requestRes.display ?? requestRes) as 'granted' | 'denied' | 'prompt' | undefined;
        const granted = requestDisplay === 'granted';
        setPermission({ granted, canAskAgain: requestDisplay !== 'denied', status: (requestDisplay ?? 'prompt') as 'granted' | 'denied' | 'prompt' });
        return granted;
      }

      setPermission({ granted: false, canAskAgain: false, status: 'denied' });
      try {
        let goToSettings = false;
        try {
          const dialogPlugin: any = (Capacitor as any)?.Plugins?.Dialog ?? (Capacitor as any)?.Dialog;
          if (dialogPlugin?.confirm) {
            const result = await dialogPlugin.confirm({
              title: 'Permission Required',
              message: 'To schedule reminders, this app needs permission to send notifications. Would you like to go to settings to enable it?',
              okButtonTitle: 'Go to Settings',
              cancelButtonTitle: 'Not Now',
            });
            goToSettings = !!result?.value;
          } else if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
            goToSettings = window.confirm('To schedule reminders, this app needs permission to send notifications. Open settings now?');
          }
        } catch (dialogErr) {
          console.warn('Permission dialog failed', dialogErr);
        }
        if (goToSettings) {
          try {
            const { App } = await import('@capacitor/app');
            const appApi: any = App;
            if (App?.openSettings) {
              await App.openSettings();
            } else if (typeof appApi?.openAppSettings === 'function') {
              await appApi.openAppSettings();
            }
          } catch (settingsErr) {
            console.warn('Failed to open app settings', settingsErr);
          }
        }
      } catch {}
      return false;
    } catch (err) {
      console.warn('Notification permission check failed', err);
      return false;
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
      console.log('[NOTIFICATIONS scheduleHabitReminder] request', {
        habitId,
        title,
        scheduledTime,
        frequency,
        weekdays,
        isNative,
      });
      if (!isNative) return `web-${habitId}-${scheduledTime}`;
      const habit = useHabitsStore.getState().habitsById[habitId] ?? { id: habitId, name: title, emoji, frequency: 'daily', reminderTimes: [], createdAt: new Date().toISOString() };
      const tmpHabit = { ...habit, reminderTimes: habit.reminderTimes?.includes(scheduledTime) ? habit.reminderTimes : [...(habit.reminderTimes || []), scheduledTime] };
      await scheduleReminderInstances(tmpHabit, scheduledTime, frequency, weekdays);
      return `native-${habitId}-${scheduledTime}`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule reminder';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelHabitReminder = async (_notificationId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      // For native, prefer cancel by habit via cancelHabitReminders
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
      await cancelAllForHabitNative(habitId);
      setScheduledNotifications([]);
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
      await LocalNotifications.cancelAll();
      setScheduledNotifications([]);
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
      // Cancel existing then schedule new
      await cancelHabitReminders(habitId);
      return await scheduleHabitReminder(habitId, title, emoji, scheduledTime, frequency, weekdays);
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
      const id = toJavaIntId(`test-${Date.now()}`);
      await LocalNotifications.schedule({
        notifications: [{ id, title, body: body || 'This is a test notification', channelId: 'habit-reminders-ting', sound: getNativeSoundName(), smallIcon: 'notification_icon' }]
      });
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
      const habits = Object.values(useHabitsStore.getState().habitsById || {});
      for (const h of habits) await rescheduleHabit(h, h.frequency || 'daily', (h as any).weeklyDays);
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
    checkAndRequestPermission,
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
