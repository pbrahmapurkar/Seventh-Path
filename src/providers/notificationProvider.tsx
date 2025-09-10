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

interface NotificationContextType {
  // Permission state
  permission: NotificationPermission | null;
  isPermissionGranted: boolean;
  
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

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        setIsLoading(true);
        const isNative = Capacitor.getPlatform() !== 'web';

        if (isNative) {
          // Native environment: we delegate to Android/iOS layers; assume granted unknown
          setPermission({ granted: true, canAskAgain: true, status: 'granted' });
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
        // Assume permissions managed at OS level; mark as granted.
        const perm: NotificationPermission = { granted: true, canAskAgain: true, status: 'granted' };
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
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // Native: scheduled via platform-specific layer elsewhere
        return `native-${habitId}-${Date.now()}`;
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
        // Native: handled by platform layer
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
        // Native: handled by platform layer (e.g., boot receiver)
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
        // Native: cancel + reschedule handled by platform layer
        return `native-${habitId}-${Date.now()}`;
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
      const isNative = Capacitor.getPlatform() !== 'web';
      if (isNative) {
        // Native: use fallback web notification when running in web context
        await notificationService.sendTestNotification(title, body);
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
