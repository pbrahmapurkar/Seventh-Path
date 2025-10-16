import { Capacitor } from '@capacitor/core';
import { clearAllHabitsPersistent } from './habits';
import { cancelAllPendingNotifications } from './notifications/habitReminderSystem';

const PREFERENCE_KEYS = [
  'onboarding_complete',
  'onboarding:selected',
  'notifications:enabled',
];

const LOCAL_STORAGE_KEYS = [
  'onboarding-complete',
  'user-name',
  'notificationsEnabled',
  '__tz_offset__',
];

export async function factoryResetStorage(): Promise<void> {
  await clearAllHabitsPersistent().catch(() => {});

  const anyWin: any = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;

  const removePreference = async (key: string) => {
    try {
      if (prefs && Capacitor.getPlatform() !== 'web') {
        await prefs.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch {}
  };

  await Promise.all(PREFERENCE_KEYS.map(removePreference));

  for (const key of LOCAL_STORAGE_KEYS) {
    try { localStorage.removeItem(key); } catch {}
  }

  // Clean up any leftover notifier caches
  try {
    await cancelAllPendingNotifications();
  } catch {}
}
