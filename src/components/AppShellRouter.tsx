/**
 * Router-aware AppShell Component
 * Integrates react-router for proper URL handling and deep links
 */

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, Plus, BarChart3, Settings, History } from 'lucide-react';
import { getPreference, setPreference } from '../lib/storage/preferences';

interface AppShellContextType {
  currentRoute: string;
  navigate: (route: string) => void;
  goBack: () => void;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  theme: 'dark';
  userName: string;
  setUserName: (name: string) => void;
}

const AppShellContext = createContext<AppShellContextType | null>(null);

export const useAppShell = () => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within AppShellProvider');
  }
  return context;
};

interface AppShellProviderProps {
  children: React.ReactNode;
}

export function AppShellProvider({ children }: AppShellProviderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Always use dark theme - no theme switching
  const theme = 'dark' as const;
  
  // Get current route from location
  const currentRoute = location.pathname;

  // Initialize state from preferences
  useEffect(() => {
    const initializeState = async () => {
      try {
        const [onboardedState, userNameState] = await Promise.all([
          getPreference('onboarding-complete', false),
          getPreference('user-name', '')
        ]);
        
        setIsOnboarded(onboardedState);
        setUserName(userNameState);
        setIsInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize app state:', error);
        setIsInitialized(true);
      }
    };

    initializeState();
  }, []);

  // Handle onboarding state changes
  const handleSetIsOnboarded = async (value: boolean) => {
    try {
      setIsOnboarded(value);
      await setPreference('onboarding-complete', value);
    } catch (error) {
      console.warn('Failed to save onboarding state:', error);
    }
  };

  // Handle user name changes
  const handleSetUserName = async (name: string) => {
    try {
      setUserName(name);
      await setPreference('user-name', name);
    } catch (error) {
      console.warn('Failed to save user name:', error);
    }
  };

  // Navigation function that updates URL
  const navigateToRoute = (route: string) => {
    navigate(route);
  };

  // Back navigation function
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home if no history
      navigate('/home');
    }
  };

  // Handle hardware back button on mobile
  useEffect(() => {
    const handleBackButton = () => {
      goBack();
    };

    // Listen for Capacitor back button events
    const anyWin: any = globalThis as any;
    const App = anyWin?.Capacitor?.Plugins?.App;
    if (App) {
      App.addListener('backButton', handleBackButton);
      return () => {
        App.removeAllListeners();
      };
    }
  }, []);

  // Redirect to onboarding if not onboarded
  useEffect(() => {
    if (isInitialized && !isOnboarded && currentRoute !== '/boot' && currentRoute !== '/onboarding') {
      navigate('/boot');
    }
  }, [isInitialized, isOnboarded, currentRoute, navigate]);

  const value: AppShellContextType = {
    currentRoute,
    navigate: navigateToRoute,
    goBack,
    isOnboarded,
    setIsOnboarded: handleSetIsOnboarded,
    theme,
    userName,
    setUserName: handleSetUserName,
  };

  // Don't render until initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  );
}

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function BottomNav({ currentRoute, onNavigate }: BottomNavProps) {
  const navItems = [
    { route: '/home', icon: Home, label: 'Home' },
    { route: '/history', icon: History, label: 'History' },
    { route: '/insights', icon: BarChart3, label: 'Insights' },
    { route: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border backdrop-blur supports-[backdrop-filter]:bg-card/80 z-40">
      {/* Safe area bottom padding */}
      <div 
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex h-20 w-full px-1">
          {navItems.map(({ route, icon: Icon, label }) => {
            const isActive = currentRoute === route;
            return (
              <button
                key={route}
                onClick={() => onNavigate(route)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 min-h-[64px] transition-all duration-300 ease-out ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                }`}
                aria-label={label}
              >
                <div className={`p-3 rounded-2xl transition-all duration-300 ease-out ${
                  isActive 
                    ? 'bg-primary/15 scale-110 shadow-lg shadow-primary/20' 
                    : 'hover:bg-muted/50 active:bg-muted/70'
                }`}>
                  <Icon 
                    size={22} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-primary drop-shadow-sm' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </div>
                <span className={`text-xs font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'text-primary font-bold' 
                    : 'text-muted-foreground font-medium'
                }`}>
                  {label}
                </span>
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface AppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function AppBar({ title, showBack = false, onBack, actions }: AppBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-card/95 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-card/80 w-full">
      {/* Safe area top padding */}
      <div 
        style={{
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="flex items-center justify-between min-h-[64px] px-6 py-4 w-full">
          <div className="flex items-center gap-4 flex-1">
            {showBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-muted/50 active:bg-muted/70 transition-all duration-200 active:scale-95"
                aria-label="Go back"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-foreground"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <h1 className="text-xl font-semibold leading-tight text-foreground">{title}</h1>
          </div>
          {actions && <div className="flex items-center">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
