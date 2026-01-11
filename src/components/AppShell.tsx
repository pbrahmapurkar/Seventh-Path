import React, { useEffect, useState, createContext, useContext } from 'react';
import { Home, Plus, BarChart3, Settings, History } from 'lucide-react';

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
  const [currentRoute, setCurrentRoute] = useState('/boot');
  const [routeStack, setRouteStack] = useState<string[]>(['/boot']);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('onboarding-complete');
      return stored === 'true';
    } catch {
      return false;
    }
  });
  // Always use dark theme - no theme switching
  const theme = 'dark' as const;
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

  // Persist onboarding flag
  useEffect(() => {
    try {
      localStorage.setItem('onboarding-complete', isOnboarded ? 'true' : 'false');
    } catch { }
  }, [isOnboarded]);

  // No theme persistence needed - always dark

  // Persist user name
  useEffect(() => {
    try {
      if (userName) localStorage.setItem('user-name', userName);
    } catch { }
  }, [userName]);

  return (
    <AppShellContext.Provider
      value={{
        currentRoute,
        navigate,
        goBack,
        isOnboarded,
        setIsOnboarded,
        theme,
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
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 border-t border-border backdrop-blur-md supports-[backdrop-filter]:bg-card/85 z-40">
      {/* Safe area bottom padding */}
      <div
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex h-20 w-full px-2">
          {navItems.map(({ route, icon: Icon, label }) => {
            const isActive = currentRoute === route;
            return (
              <button
                key={route}
                onClick={() => onNavigate(route)}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-h-[64px] transition-all duration-300 ease-out ${isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                  }`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active pill background */}
                {isActive && (
                  <div
                    className="absolute inset-x-2 top-2 bottom-2 bg-primary/10 rounded-2xl"
                    style={{
                      boxShadow: 'inset 0 0 0 1px rgba(20, 216, 144, 0.15)'
                    }}
                  />
                )}

                <div className={`relative p-2.5 rounded-xl transition-all duration-300 ease-out ${isActive
                    ? 'bg-primary/20 scale-110'
                    : 'hover:bg-muted/50 active:bg-muted/70'
                  }`}
                  style={isActive ? {
                    boxShadow: '0 0 16px rgba(20, 216, 144, 0.35)'
                  } : undefined}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-all duration-300 ${isActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                      }`}
                  />
                </div>
                <span className={`text-xs transition-all duration-300 ${isActive
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground font-medium'
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
