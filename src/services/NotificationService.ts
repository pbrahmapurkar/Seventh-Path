import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type PermissionStatus, type ScheduleOptions, type PendingResult } from '@capacitor/local-notifications';

// Helper to map PermissionStatus to spec types
function mapPermission(status: PermissionStatus['display']): 'granted' | 'denied' | 'prompt' {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'prompt';
}

class NotificationService {
  private async ensureChannels(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') return;
    try {
      await LocalNotifications.createChannel({
        id: 'seventhpath_default',
        name: 'Default',
        importance: 3, // IMPORTANCE_DEFAULT
      });
      await LocalNotifications.createChannel({
        id: 'seventhpath_reminders',
        name: 'Habit Reminders',
        importance: 4, // IMPORTANCE_HIGH
        sound: 'ting_positive',
        vibration: true,
      });
    } catch {
      // ignore
    }
  }

  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    const res = await LocalNotifications.checkPermissions();
    return mapPermission(res.display);
  }

  async requestPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    const res = await LocalNotifications.requestPermissions();
    await this.ensureChannels();
    return mapPermission(res.display);
  }

  async getPendingCount(): Promise<number> {
    try {
      const pending: PendingResult = await LocalNotifications.getPending();
      return pending.notifications.length;
    } catch {
      return 0;
    }
  }

  async sendTestNotification(): Promise<void> {
    const id = Date.now();
    const sound = Capacitor.getPlatform() === 'ios' ? 'ting_positive.mp3' : 'ting_positive';
    const opts: ScheduleOptions = {
      notifications: [
        {
          id,
          title: 'Seventh Path',
          body: 'Test notification',
          schedule: { at: new Date(Date.now() + 1000) },
          channelId: 'seventhpath_reminders',
          sound,
          smallIcon: 'notification_icon',
        },
      ],
    };
    await LocalNotifications.schedule(opts);
  }

  async openSystemSettings(): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const appMod = require('@capacitor/app');
      const AppCap = appMod?.App;
      if (AppCap && AppCap.openSettings) {
        await AppCap.openSettings();
      }
    } catch {
      // ignore (plugin not installed in this build)
    }
  }
}

export const notificationService = new NotificationService();
export type PermissionState = 'granted' | 'denied' | 'prompt';
