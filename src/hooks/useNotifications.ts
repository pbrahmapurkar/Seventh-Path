/**
 * Custom Hook for Notification Management
 * Provides easy-to-use notification functionality for React components
 */

import { useCallback, useEffect, useState } from 'react';
import { useNotifications } from '../providers/notificationProvider';

/**
 * Hook for managing notification permissions and status
 */
export function useNotificationPermission() {
  const { 
    permission, 
    isPermissionGranted, 
    requestPermission, 
    isLoading, 
    error 
  } = useNotifications();

  const [hasRequested, setHasRequested] = useState(false);

  const requestPermissionWithTracking = useCallback(async () => {
    try {
      setHasRequested(true);
      return await requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }, [requestPermission]);

  return {
    permission,
    isPermissionGranted,
    requestPermission: requestPermissionWithTracking,
    isLoading,
    error,
    hasRequested
  };
}

/**
 * Hook for habit-specific notification management
 */
export function useHabitNotificationManager(habitId: string) {
  const { 
    scheduledNotifications, 
    scheduleHabitReminder, 
    cancelHabitReminders, 
    updateHabitReminder,
    isLoading 
  } = useNotifications();

  const habitNotifications = scheduledNotifications.filter(n => n.habitId === habitId);
  const hasReminder = habitNotifications.length > 0;
  const reminderTime = habitNotifications[0]?.scheduledTime;
  const reminderFrequency = habitNotifications[0]?.frequency;

  const scheduleReminder = useCallback(async (
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency: 'daily' | 'weekly' = 'daily',
    weekdays?: number[]
  ) => {
    try {
      return await scheduleHabitReminder(
        habitId, 
        title, 
        emoji, 
        scheduledTime, 
        frequency, 
        weekdays
      );
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }, [habitId, scheduleHabitReminder]);

  const cancelReminder = useCallback(async () => {
    try {
      await cancelHabitReminders(habitId);
    } catch (error) {
      console.error('Error canceling reminder:', error);
      throw error;
    }
  }, [habitId, cancelHabitReminders]);

  const updateReminder = useCallback(async (
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency: 'daily' | 'weekly' = 'daily',
    weekdays?: number[]
  ) => {
    try {
      return await updateHabitReminder(
        habitId, 
        title, 
        emoji, 
        scheduledTime, 
        frequency, 
        weekdays
      );
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  }, [habitId, updateHabitReminder]);

  return {
    habitNotifications,
    hasReminder,
    reminderTime,
    reminderFrequency,
    scheduleReminder,
    cancelReminder,
    updateReminder,
    isLoading
  };
}

/**
 * Hook for notification testing and debugging
 */
export function useNotificationTesting() {
  const { sendTestNotification, isLoading } = useNotifications();
  const [isTesting, setIsTesting] = useState(false);

  const sendTest = useCallback(async (title?: string, body?: string) => {
    try {
      setIsTesting(true);
      await sendTestNotification(
        title || '🔔 Test Notification',
        body || 'This is a test notification from Seventh Path!'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    } finally {
      setIsTesting(false);
    }
  }, [sendTestNotification]);

  return {
    sendTest,
    isTesting: isTesting || isLoading
  };
}

/**
 * Hook for notification analytics and insights
 */
export function useNotificationAnalytics() {
  const { scheduledNotifications } = useNotifications();
  
  const totalScheduled = scheduledNotifications.length;
  const activeNotifications = scheduledNotifications.filter(n => n.isActive).length;
  const dailyReminders = scheduledNotifications.filter(n => n.frequency === 'daily').length;
  const weeklyReminders = scheduledNotifications.filter(n => n.frequency === 'weekly').length;

  // Group by time slots
  const timeSlotGroups = scheduledNotifications.reduce((acc, notification) => {
    const time = notification.scheduledTime;
    acc[time] = (acc[time] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Most popular time slots
  const popularTimeSlots = Object.entries(timeSlotGroups)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([time, count]) => ({ time, count }));

  return {
    totalScheduled,
    activeNotifications,
    dailyReminders,
    weeklyReminders,
    timeSlotGroups,
    popularTimeSlots,
    hasNotifications: totalScheduled > 0
  };
}

/**
 * Hook for notification preferences management
 */
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState({
    enableNotifications: true,
    defaultReminderTime: '09:00',
    enableSound: true,
    enableVibration: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateQuietHours = useCallback((quietHours: Partial<typeof preferences.quietHours>) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        ...quietHours
      }
    }));
  }, []);

  return {
    preferences,
    updatePreference,
    updateQuietHours
  };
}
