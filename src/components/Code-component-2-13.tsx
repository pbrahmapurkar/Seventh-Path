import React, { useState, createContext, useContext } from 'react';
import { Home, Plus, BarChart3, Settings } from 'lucide-react';

interface AppShellContextType {
  currentRoute: string;
  navigate: (route: string) => void;
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
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [userName, setUserName] = useState('');

  const navigate = (route: string) => {
    setCurrentRoute(route);
  };

  return (
    <AppShellContext.Provider
      value={{
        currentRoute,
        navigate,
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
    { route: '/add', icon: Plus, label: 'Add' },
    { route: '/insights', icon: BarChart3, label: 'Insights' },
    { route: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex h-20 max-w-md mx-auto">
        {navItems.map(({ route, icon: Icon, label }) => {
          const isActive = currentRoute === route;
          return (
            <button
              key={route}
              onClick={() => onNavigate(route)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon size={24} />
              </div>
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
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
    <div className="flex items-center justify-between h-16 px-4 bg-card border-b border-border">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-muted"
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
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}