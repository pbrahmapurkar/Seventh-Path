import React, { useEffect, useState, createContext, useContext } from 'react';
import { Home, Plus, BarChart3, Settings, History } from 'lucide-react';

type BackHandler = () => boolean | Promise<boolean>;

interface AppShellContextType {
  currentRoute: string;
  navigate: (route: string) => void;
  goBack: () => void;
  registerBackHandler: (handler: BackHandler) => () => void;
  handleBack: () => Promise<boolean>;
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
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
  const [currentRoute, setCurrentRoute] = useState('/boot');
  const [routeStack, setRouteStack] = useState<string[]>(['/boot']);
  const [backHandlers, setBackHandlers] = useState<BackHandler[]>([]);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('onboarding-complete');
      return stored === 'true';
    } catch {
      return false;
    }
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      return (localStorage.getItem('app-theme') as 'light' | 'dark' | 'system') || 'system';
    } catch {
      return 'system';
    }
  });
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('user-name') || '';
    } catch {
      return '';
    }
  });

  const navigate = (route: string) => {
    setCurrentRoute(route);
    setRouteStack((prev) => {
      if (prev[prev.length - 1] === route) return prev;
      return [...prev, route];
    });
  };

  const goBack = () => {
    setRouteStack((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      const prevRoute = next[next.length - 1] || '/home';
      setCurrentRoute(prevRoute);
      return next;
    });
  };

  const registerBackHandler = (handler: BackHandler) => {
    setBackHandlers((prev) => [...prev, handler]);
    return () => setBackHandlers((prev) => prev.filter((h) => h !== handler));
  };

  const handleBack = async () => {
    const handler = backHandlers[backHandlers.length - 1];
    if (handler) {
      try {
        const res = await Promise.resolve(handler());
        if (res) return true; // handled
      } catch {}
    }
    goBack();
    return true;
  };

  // Persist onboarding flag
  useEffect(() => {
    try {
      localStorage.setItem('onboarding-complete', isOnboarded ? 'true' : 'false');
    } catch {}
  }, [isOnboarded]);

  // Persist theme
  useEffect(() => {
    try {
      localStorage.setItem('app-theme', theme);
    } catch {}
  }, [theme]);

  // Persist user name
  useEffect(() => {
    try {
      if (userName) localStorage.setItem('user-name', userName);
    } catch {}
  }, [userName]);

  return (
    <AppShellContext.Provider
      value={{
        currentRoute,
        navigate,
        goBack,
        registerBackHandler,
        handleBack,
        isOnboarded,
        setIsOnboarded,
        theme,
        setTheme,
        userName,
        setUserName,
      }}
    >
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
      <div className="pb-safe-area-bottom">
        <div className="flex h-16 max-w-md mx-auto px-2">
          {navItems.map(({ route, icon: Icon, label }) => {
            const isActive = currentRoute === route;
            return (
              <button
                key={route}
                onClick={() => onNavigate(route)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 min-h-[48px] transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={label}
              >
                <div className={`p-2 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-primary/10 scale-110' : 'hover:bg-muted/50'
                }`}>
                  <Icon size={20} className={isActive ? 'text-primary' : ''} />
                </div>
                <span className={`text-xs font-medium transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {label}
                </span>
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
    <div className="sticky top-0 z-30 bg-card/95 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Safe area top padding */}
      <div className="pt-safe-area-top">
        <div className="flex items-center justify-between min-h-[56px] px-4 py-4">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={onBack}
                className="touch-target rounded-full hover:bg-muted transition-colors"
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
            <h1 className="text-xl font-medium leading-none">{title}</h1>
          </div>
          {actions && <div className="flex items-center">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
