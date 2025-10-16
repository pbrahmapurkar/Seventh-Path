import { useHabitsStore } from '../store/HabitsStore';
import { toYMD, listHabits } from '../lib/habits';
import { Capacitor } from '@capacitor/core';

let started = false;
let lastSeenDate = toYMD(new Date());

export function startDayRolloverService() {
  if (started) return;
  started = true;

  const check = async () => {
    const today = toYMD(new Date());
    if (today !== lastSeenDate) {
      lastSeenDate = today;
      const store = useHabitsStore.getState();
      // Re-hydrate if not ready or hydrate date < today
      if (store.hydrationState !== 'ready' || store.lastHydratedYMD !== today) {
        await store.hydrateAll(true);
      }
      // Emit day change via event bus by toggling a flag in store (indirect). Consumers can subscribe via store events if needed.
      // We reuse stats recomputation through hydrateAll which ensures today entries exist.
    }
    // Timezone change detection
    const tzKey = '__tz_offset__';
    const cur = new Date().getTimezoneOffset();
    const prev = Number(localStorage.getItem(tzKey) || cur);
    if (prev !== cur) {
      localStorage.setItem(tzKey, String(cur));
      // Reschedule all habit notifications for new timezone
      const store = useHabitsStore.getState();
      if (store.hydrationState !== 'ready') await store.hydrateAll(true);
      const ids = Object.keys(store.habitsById);
      for (const id of ids) await store.rescheduleNotifications(id);
    }
  };

  // Foreground timer every 15 minutes
  setInterval(check, 15 * 60 * 1000);
  // Visibility / focus listeners
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  // App state (native)
  // Native app state (optional, only if plugin available)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appMod = require('@capacitor/app');
    if (appMod && appMod.App && appMod.App.addListener) {
      appMod.App.addListener('appStateChange', ({ isActive }: { isActive: boolean }) => { if (isActive) check(); });
    }
  } catch {}
}
