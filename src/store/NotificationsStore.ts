import { create } from 'zustand';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { notificationService, type PermissionState } from '../services/NotificationService';

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
    const perm = await notificationService.checkPermission();
    const enabledStr = await getPref(ENABLED_KEY);
    const enabled = enabledStr !== 'false';
    const count = await notificationService.getPendingCount();
    set({ permission: perm, enabled, scheduledCount: count });
  },

  requestPermission: async () => {
    const perm = await notificationService.requestPermission();
    set({ permission: perm });
    await get().refreshScheduledCount();
  },

  setEnabled: async (on: boolean) => {
    set({ enabled: on });
    await setPref(ENABLED_KEY, on ? 'true' : 'false');
  },

  refreshScheduledCount: async () => {
    const count = await notificationService.getPendingCount();
    set({ scheduledCount: count });
  },

  sendTest: async () => {
    if (get().permission !== 'granted' || !get().enabled) return;
    await notificationService.sendTestNotification();
    await get().refreshScheduledCount();
  },

  openSystemSettings: async () => {
    await notificationService.openSystemSettings();
  },
}));

// Rehydrate on app resume
App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) useNotificationsStore.getState().hydrate().catch(() => {});
});
