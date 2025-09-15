import React, { useEffect, useRef } from 'react';
import { AppShellProvider, useAppShell, BottomNav } from './components/AppShell';
import { BackNavHandler } from './components/BackNavHandler';
import { NotificationProvider } from './providers/notificationProvider';
import { BootScreen } from './screens/BootScreen';
import { OnboardingMain } from './screens/OnboardingMain';
import { OnboardingName } from './screens/OnboardingName';
import { OnboardingHabits } from './screens/OnboardingHabits';
import { OnboardingReminder } from './screens/OnboardingReminder';
import { HomeToday } from './screens/HomeToday';
import { AddHabit } from './screens/AddHabit';
import { TermsOfUse } from './screens/Terms';
import { PrivacyPolicy } from './screens/Privacy';
import { Insights } from './screens/Insights';
import { Settings } from './screens/Settings';
import { HabitDetails } from './screens/HabitDetails';
import { HistoryScreen } from './screens/History';
import { HabitEdit } from './screens/HabitEdit';
import { Affirmations } from './screens/Affirmations';
import { DailyGratitudes } from './screens/DailyGratitudes';
import { ErrorNotFound } from './screens/ErrorNotFound';
import { ConfirmRemoveHabits } from './screens/ConfirmRemoveHabits';
import { useHabitsStore } from './store/HabitsStore';
import { startDayRolloverService } from './services/DayRolloverService';
import { start as startSyncBus } from './lib/syncBus';

// Import test utilities in development mode
if (process.env.NODE_ENV === 'development') {
  import('./utils/backNavHandlerTest');
}

function AppContent() {
  const { currentRoute, navigate, theme, isOnboarded } = useAppShell();
  const { hydrateAll, hydrationState } = useHabitsStore();
  const lastNotifNavAtRef = useRef<number>(0);
  const lastNotifHabitRef = useRef<string | null>(null);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Hydrate habits store on app start and start rollover service
  useEffect(() => {
    if (hydrationState !== 'ready') {
      void hydrateAll();
    }
    startDayRolloverService();
    // Start cross-tab/app sync bus: rehydrate on external mutations
    startSyncBus(async (_msg) => {
      await hydrateAll();
    });
  }, [hydrateAll, hydrationState]);

  // Navigate to habit detail when a notification is tapped
  useEffect(() => {
    const onNotificationClick = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as { habitId?: string };
        if (!detail?.habitId) return;
        const now = Date.now();
        const isSameAsLast = lastNotifHabitRef.current === detail.habitId;
        const withinWindow = now - (lastNotifNavAtRef.current || 0) < 800;
        if (isSameAsLast && withinWindow) return; // debounce duplicate taps
        lastNotifHabitRef.current = detail.habitId;
        lastNotifNavAtRef.current = now;
        navigate(`/habit/${detail.habitId}`);
      } catch {}
    };
    window.addEventListener('notification-click', onNotificationClick as EventListener);
    return () => window.removeEventListener('notification-click', onNotificationClick as EventListener);
  }, [navigate]);

  // Route rendering
  const renderScreen = () => {
    // Extract route parameters for dynamic routes
    const habitIdMatch = currentRoute.match(/^\/habit\/(.+?)(?:\/|$)/);
    const habitId = habitIdMatch ? habitIdMatch[1] : null;

    switch (true) {
      case currentRoute === '/boot':
        return <BootScreen />;
      
      case currentRoute === '/onboarding':
        return <OnboardingMain />;
      
      case currentRoute === '/onboarding/name':
        return <OnboardingName />;
      
      case currentRoute === '/onboarding/habits':
        return <OnboardingHabits />;
      
      case currentRoute === '/onboarding/reminder':
        return <OnboardingReminder />;
      
      case currentRoute === '/home':
        return <HomeToday />;
      
      case currentRoute === '/add':
        return <AddHabit />;
      
      case currentRoute === '/insights':
        return <Insights />;
      
      case currentRoute === '/history':
        return <HistoryScreen />;
      
      case currentRoute === '/settings':
        return <Settings />;

      case currentRoute === '/terms':
        return <TermsOfUse />;

      case currentRoute === '/privacy':
        return <PrivacyPolicy />;
      
      case currentRoute === '/confirm-remove-habits':
      case currentRoute === '/remove-all-habits':
        return <ConfirmRemoveHabits />;
      
      case currentRoute.startsWith('/habit/') && currentRoute.endsWith('/edit'):
        return <HabitEdit habitId={habitId || '1'} />;

      case currentRoute.startsWith('/habit/') && !currentRoute.includes('/edit'):
        return <HabitDetails habitId={habitId || '1'} />;
      
      case currentRoute === '/affirmations':
        return <Affirmations />;
      
      case currentRoute === '/daily-gratitudes':
        return <DailyGratitudes />;
      
      default:
        return <ErrorNotFound />;
    }
  };

  // Show bottom navigation for main app routes
  const showBottomNav = isOnboarded && ['/home', '/history', '/insights', '/settings'].includes(currentRoute);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto relative">
        {/* Robust Android back navigation handler */}
        <BackNavHandler
          enableDoublePressToExit={true}
          doublePressWindow={2000}
          rootRoutes={['/', '/home']}
          exitMessage="Press back again to exit"
        />
        
        {renderScreen()}
        {showBottomNav && (
          <BottomNav
            currentRoute={currentRoute}
            onNavigate={navigate}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppShellProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AppShellProvider>
  );
}
