import React, { useEffect, useRef } from 'react';
import { ZenThemeProvider } from './contexts/ZenThemeContext';
import { App as CapacitorApp } from '@capacitor/app';
import { NotificationProvider } from './providers/notificationProvider';
import { AppRouter } from './router/AppRouter';
import { useHabitsStore } from './store/HabitsStore';
import { startDayRolloverService } from './services/DayRolloverService';
import { start as startSyncBus } from './lib/syncBus';
import './styles/design-system/index.css';

function AppContent() {
  // Hydrate habits store on app start and start rollover service
  useEffect(() => {
    const { _hasHydrated } = useHabitsStore.getState();
    const hydrateAll = useHabitsStore.getState().hydrateAll;
    if (!_hasHydrated) {
      console.log('--- HYDRATING STORE ---');
      void hydrateAll();
    }
    startDayRolloverService();
    startSyncBus(async (_msg) => {
      await hydrateAll(true);
    });
  }, []);

  return <AppRouter />;
}

export default function App() {
  return (
    <ZenThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ZenThemeProvider>
  );
}
