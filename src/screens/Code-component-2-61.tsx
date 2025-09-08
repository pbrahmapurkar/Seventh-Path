import React from 'react';
import { ChevronRight, User, Bell, Palette, RotateCcw, Info, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';

export function Settings() {
  const { userName, theme, setTheme, setIsOnboarded, navigate } = useAppShell();

  const handleResetOnboarding = () => {
    if (confirm('This will clear your profile and habits. Are you sure?')) {
      setIsOnboarded(false);
      navigate('/onboarding');
    }
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="font-medium text-sm text-muted-foreground mb-3 px-4">{title}</h3>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );

  const SettingsRow = ({ 
    icon, 
    title, 
    description, 
    action, 
    onClick 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    description?: string; 
    action?: React.ReactNode; 
    onClick?: () => void;
  }) => (
    <div 
      className={`flex items-center gap-3 p-4 border-b border-border last:border-b-0 ${
        onClick ? 'cursor-pointer hover:bg-muted/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
      {onClick && <ChevronRight size={20} className="text-muted-foreground" />}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <AppBar title="Settings" />

      <div className="flex-1 p-6">
        {/* Profile Section */}
        <SettingsSection title="Profile">
          <SettingsRow
            icon={<User size={20} />}
            title="Name"
            description={userName || 'Not set'}
            onClick={() => navigate('/onboarding/name')}
          />
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingsRow
            icon={<Bell size={20} />}
            title="Notifications"
            description="Daily habit reminders"
            action={<Switch defaultChecked />}
          />
          <SettingsRow
            icon={<Palette size={20} />}
            title="Theme"
            description="Choose your preferred theme"
            action={
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor size={16} />
                      System
                    </div>
                  </SelectItem>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun size={16} />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon size={16} />
                      Dark
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </SettingsSection>

        {/* Data Section */}
        <SettingsSection title="Data">
          <SettingsRow
            icon={<RotateCcw size={20} />}
            title="Reset Onboarding"
            description="Go through the setup process again"
            onClick={handleResetOnboarding}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingsRow
            icon={<Info size={20} />}
            title="About HabitFlow"
            description="Version 1.0.0"
            onClick={() => {}}
          />
        </SettingsSection>

        {/* App Info */}
        <div className="mt-8 text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="font-medium mb-2">HabitFlow</h3>
          <p className="text-sm text-muted-foreground mb-1">
            Building better habits, one day at a time
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for your success
          </p>
        </div>
      </div>
    </div>
  );
}