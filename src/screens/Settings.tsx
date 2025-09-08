import React, { useState } from 'react';
import { ChevronRight, User, Bell, Palette, RotateCcw, Info, Sun, Moon, Monitor, Settings as SettingsIcon, TestTube } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';
import { useNotifications } from '../providers/notificationProvider';
import seventhPathLogo from '../assets/d39dcef0d5c4765688b970ab66912bbb65f81e62.png';

export function Settings() {
  const { userName, theme, setTheme, setIsOnboarded, navigate } = useAppShell();
  const { 
    isPermissionGranted, 
    requestPermission, 
    sendTestNotification, 
    isLoading: notificationLoading,
    error: notificationError 
  } = useNotifications();
  
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const handleResetOnboarding = () => {
    if (confirm('This will clear your profile and habits. Are you sure?')) {
      setIsOnboarded(false);
      navigate('/onboarding');
    }
  };

  const handleRequestNotificationPermission = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      setIsTestingNotification(true);
      await sendTestNotification(
        '🔔 Test Notification',
        'This is a test notification from Seventh Path!'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setIsTestingNotification(false);
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

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsRow
            icon={<Bell size={20} />}
            title="Notification Permission"
            description={
              isPermissionGranted 
                ? "Notifications are enabled" 
                : "Notifications are disabled"
            }
            action={
              <Switch 
                checked={isPermissionGranted} 
                onCheckedChange={handleRequestNotificationPermission}
                disabled={notificationLoading}
              />
            }
          />
          
          {isPermissionGranted && (
            <SettingsRow
              icon={<TestTube size={20} />}
              title="Test Notification"
              description="Send a test notification to verify it's working"
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestNotification}
                  disabled={isTestingNotification}
                >
                  {isTestingNotification ? 'Sending...' : 'Test'}
                </Button>
              }
            />
          )}
          
          {!isPermissionGranted && (
            <SettingsRow
              icon={<SettingsIcon size={20} />}
              title="Enable Notifications"
              description="Tap to enable notifications in system settings"
              onClick={handleRequestNotificationPermission}
            />
          )}
        </SettingsSection>

        {/* Error Display */}
        {notificationError && (
          <SettingsSection title="Error">
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={16} className="text-red-600 dark:text-red-400" />
                <h3 className="font-medium text-red-900 dark:text-red-100">Notification Error</h3>
              </div>
              <p className="text-sm text-red-800 dark:text-red-200">{notificationError}</p>
            </div>
          </SettingsSection>
        )}

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
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
            title="About Seventh Path"
            description="Version 1.0.0"
            onClick={() => {}}
          />
        </SettingsSection>

        {/* App Info */}
        <div className="mt-8 text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <img src={seventhPathLogo} alt="Seventh Path Logo" className="w-16 h-16 object-contain" />
          </div>
          <h3 className="font-medium mb-2">Seventh Path</h3>
          <p className="text-sm text-muted-foreground mb-1">
            Journey of mindful habits
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for your transformation
          </p>
        </div>
      </div>
    </div>
  );
}