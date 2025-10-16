import { create } from 'zustand';
import { checkPermissions, requestPermissions, getPendingCount, openSystemSettings, rescheduleHabit, type PermissionState } from '../lib/notifications/habitReminderSystem';
import { useHabitsStore } from './HabitsStore';

// simple Preferences helpers
async function setPref(key: string, value: string): Promise<void> {
  const anyWin: any = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
  if (prefs && Capacitor.getPlatform() !== 'web') {
    await prefs.set({ key, value });
  } else {
    localStorage.setItem(key, value);
  }
}

async function getPref(key: string): Promise<string | null> {
  const anyWin: any = globalThis as any;
  const prefs = anyWin?.Capacitor?.Plugins?.Preferences;
  if (prefs && Capacitor.getPlatform() !== 'web') {
    const res = await prefs.get({ key });
    return res.value ?? null;
  }
  return localStorage.getItem(key);
}

const ENABLED_KEY = 'notifications:enabled';

interface NotificationsState {
  permission: PermissionState;
  enabled: boolean;
  scheduledCount: number;
  hydrate: () => Promise<void>;
  requestPermission: () => Promise<void>;
  setEnabled: (on: boolean) => Promise<void>;
  refreshScheduledCount: () => Promise<void>;
  sendTest: () => Promise<void>;
  openSystemSettings: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  permission: 'prompt',
  enabled: true,
  scheduledCount: 0,

  hydrate: async () => {
    const perm = await checkPermissions();
    const enabledStr = await getPref(ENABLED_KEY);
    const enabled = enabledStr !== 'false';
    const count = await getPendingCount();
    set({ permission: perm, enabled, scheduledCount: count });
  },

  requestPermission: async () => {
    const perm = await requestPermissions();
    set({ permission: perm });
    await get().refreshScheduledCount();
  },

  setEnabled: async (on: boolean) => {
    set({ enabled: on });
    await setPref(ENABLED_KEY, on ? 'true' : 'false');
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      if (!on) {
        // Cancel all pending notifications immediately
        try { await LocalNotifications.cancelAll(); } catch {}
        set({ scheduledCount: 0 });
      } else {
        // Re-schedule all saved habit reminders from DB
        const habits = Object.values(useHabitsStore.getState().habitsById || {});
        for (const h of habits) {
          try { await rescheduleHabit(h, (h as any).frequency || 'daily', (h as any).weeklyDays); } catch {}
        }
        const count = await getPendingCount();
        set({ scheduledCount: count });
      }
    } catch {}
  },

  refreshScheduledCount: async () => {
    const count = await getPendingCount();
    set({ scheduledCount: count });
  },

  sendTest: async () => {
    if (get().permission !== 'granted' || !get().enabled) return;
    // Schedule a one-off test notification 1 minute ahead
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const { toJavaIntId, getNativeSoundName } = await import('../lib/notifications/habitReminderSystem');
      const id = toJavaIntId(`test-${Date.now()}`);
      const at = new Date(Date.now() + 60 * 1000);
      await LocalNotifications.schedule({ notifications: [{ id, title: '🔔 Test Notification', body: 'This is a test notification', schedule: { at }, channelId: 'habit-reminders-ting', sound: getNativeSoundName() }] });
    } catch {}
    await get().refreshScheduledCount();
  },

  openSystemSettings: async () => {
    await openSystemSettings();
  },
}));

// Rehydrate on app resume
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const appMod = require('@capacitor/app');
  const AppCap = appMod?.App;
  if (AppCap && AppCap.addListener) {
    AppCap.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => {
      if (isActive) useNotificationsStore.getState().hydrate().catch(() => {});
    });
  }
} catch {
  // Plugin not available in this build; ignore
}
