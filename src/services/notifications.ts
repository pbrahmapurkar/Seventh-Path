/**
 * Notification Service for Habit Tracker
 * Handles local notifications, scheduling, and permission management
 */

export interface NotificationPermission {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'not-determined';
}

export interface ScheduledNotification {
  id: string;
  habitId: string;
  title: string;
  body: string;
  scheduledTime: string; // HH:MM format
  frequency: 'daily' | 'weekly';
  weekdays?: number[]; // 0-6 (Sunday-Saturday)
  isActive: boolean;
  createdAt: Date;
}

export interface NotificationAction {
  id: string;
  title: string;
  action: 'complete' | 'snooze' | 'skip';
}

class NotificationService {
  private static instance: NotificationService;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private permissionStatus: NotificationPermission | null = null;

  private constructor() {
    this.loadScheduledNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      let permission = Notification.permission;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      this.permissionStatus = {
        granted: permission === 'granted',
        canAskAgain: permission === 'default',
        status: permission as 'granted' | 'denied' | 'not-determined'
      };

      return this.permissionStatus;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.permissionStatus = {
        granted: false,
        canAskAgain: false,
        status: 'denied'
      };
      return this.permissionStatus;
    }
  }

  /**
   * Check current permission status
   */
  getPermissionStatus(): NotificationPermission | null {
    if (!this.permissionStatus && 'Notification' in window) {
      this.permissionStatus = {
        granted: Notification.permission === 'granted',
        canAskAgain: Notification.permission === 'default',
        status: Notification.permission as 'granted' | 'denied' | 'not-determined'
      };
    }
    return this.permissionStatus;
  }

  /**
   * Schedule a habit reminder notification
   */
  async scheduleHabitReminder(
    habitId: string,
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency: 'daily' | 'weekly' = 'daily',
    weekdays?: number[]
  ): Promise<string> {
    const permission = await this.requestPermission();
    
    if (!permission.granted) {
      throw new Error('Notification permission not granted');
    }

    const notificationId = `habit-${habitId}-${Date.now()}`;
    const [hours, minutes] = scheduledTime.split(':').map(Number);

    const scheduledNotification: ScheduledNotification = {
      id: notificationId,
      habitId,
      title: `${emoji} ${title}`,
      body: this.generateNotificationBody(title),
      scheduledTime,
      frequency,
      weekdays,
      isActive: true,
      createdAt: new Date()
    };

    // Schedule the notification
    await this.scheduleBrowserNotification(scheduledNotification, hours, minutes);
    
    // Store the scheduled notification
    this.scheduledNotifications.set(notificationId, scheduledNotification);
    this.saveScheduledNotifications();

    return notificationId;
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelHabitReminder(notificationId: string): Promise<void> {
    const notification = this.scheduledNotifications.get(notificationId);
    if (!notification) return;

    // Cancel browser notification (if supported)
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.showNotification(notificationId, {
            tag: notificationId,
            silent: true
          });
        }
      } catch (error) {
        console.warn('Could not cancel browser notification:', error);
      }
    }

    // Remove from our tracking
    this.scheduledNotifications.delete(notificationId);
    this.saveScheduledNotifications();
  }

  /**
   * Cancel all reminders for a specific habit
   */
  async cancelHabitReminders(habitId: string): Promise<void> {
    const notificationsToCancel = Array.from(this.scheduledNotifications.values())
      .filter(n => n.habitId === habitId);

    for (const notification of notificationsToCancel) {
      await this.cancelHabitReminder(notification.id);
    }
  }

  /**
   * Cancel all scheduled reminders
   */
  async cancelAllReminders(): Promise<void> {
    const all = Array.from(this.scheduledNotifications.values());
    for (const notification of all) {
      await this.cancelHabitReminder(notification.id);
    }
    // Clear persisted storage for notifications
    try {
      localStorage.removeItem('scheduled-notifications');
    } catch {
      // ignore
    }
  }

  /**
   * Update a habit reminder
   */
  async updateHabitReminder(
    habitId: string,
    title: string,
    emoji: string,
    scheduledTime: string,
    frequency: 'daily' | 'weekly' = 'daily',
    weekdays?: number[]
  ): Promise<string> {
    // Cancel existing reminders
    await this.cancelHabitReminders(habitId);
    
    // Schedule new reminder
    return this.scheduleHabitReminder(habitId, title, emoji, scheduledTime, frequency, weekdays);
  }

  /**
   * Get all scheduled notifications
   */
  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * Get notifications for a specific habit
   */
  getHabitNotifications(habitId: string): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values())
      .filter(n => n.habitId === habitId);
  }

  /**
   * Reschedule all notifications (useful for app boot)
   */
  async rescheduleAllNotifications(): Promise<void> {
    const notifications = this.getScheduledNotifications();
    
    for (const notification of notifications) {
      if (notification.isActive) {
        const [hours, minutes] = notification.scheduledTime.split(':').map(Number);
        await this.scheduleBrowserNotification(notification, hours, minutes);
      }
    }
  }

  /**
   * Send a test notification
   */
  async sendTestNotification(title: string, body: string): Promise<void> {
    const permission = await this.requestPermission();
    
    if (!permission.granted) {
      throw new Error('Notification permission not granted');
    }

    if ('Notification' in window) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
    }
  }

  /**
   * Handle notification click (deep link to habit)
   */
  handleNotificationClick(habitId: string): void {
    // This would typically navigate to the habit detail screen
    // For now, we'll dispatch a custom event
    window.dispatchEvent(new CustomEvent('notification-click', {
      detail: { habitId }
    }));
  }

  /**
   * Handle notification action (complete, snooze, skip)
   */
  handleNotificationAction(habitId: string, action: 'complete' | 'snooze' | 'skip'): void {
    window.dispatchEvent(new CustomEvent('notification-action', {
      detail: { habitId, action }
    }));
  }

  // Private methods

  private async scheduleBrowserNotification(
    notification: ScheduledNotification,
    hours: number,
    minutes: number
  ): Promise<void> {
    // For web browsers, we'll use a simplified approach
    // In a real mobile app, you'd use platform-specific APIs
    
    if ('Notification' in window && Notification.permission === 'granted') {
      // Calculate next notification time
      const now = new Date();
      const nextNotification = new Date();
      nextNotification.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, schedule for tomorrow
      if (nextNotification <= now) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }

      const timeUntilNotification = nextNotification.getTime() - now.getTime();

      // Schedule the notification
      setTimeout(() => {
        if (notification.isActive) {
          const browserNotification = new Notification(notification.title, {
            body: notification.body,
            icon: '/favicon.ico',
            tag: notification.id,
            requireInteraction: true,
            actions: [
              { action: 'complete', title: '✅ Complete' },
              { action: 'snooze', title: '⏰ Snooze 10min' },
              { action: 'skip', title: '⏭️ Skip' }
            ]
          });

          browserNotification.onclick = () => {
            this.handleNotificationClick(notification.habitId);
            browserNotification.close();
          };

          // Schedule next occurrence for daily notifications
          if (notification.frequency === 'daily') {
            setTimeout(() => {
              this.scheduleBrowserNotification(notification, hours, minutes);
            }, 24 * 60 * 60 * 1000); // 24 hours
          }
        }
      }, timeUntilNotification);
    }
  }

  private generateNotificationBody(habitTitle: string): string {
    const motivationalMessages = [
      "Time to complete your habit!",
      "Stay consistent with your goals!",
      "You've got this! Keep going!",
      "Small steps lead to big changes!",
      "Your future self will thank you!",
      "Consistency is the key to success!"
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    return `${randomMessage} 💪`;
  }

  private loadScheduledNotifications(): void {
    try {
      const stored = localStorage.getItem('scheduled-notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        notifications.forEach((n: any) => {
          this.scheduledNotifications.set(n.id, {
            ...n,
            createdAt: new Date(n.createdAt)
          });
        });
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  }

  private saveScheduledNotifications(): void {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      localStorage.setItem('scheduled-notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export types for use in other files
export type { NotificationPermission, ScheduledNotification, NotificationAction };
