import React, { useCallback, useMemo, useState } from 'react';
import { ChevronRight, User, Bell, Palette, RotateCcw, Info, Sun, Moon, Monitor, Settings as SettingsIcon, TestTube, Trash2, FileText, Shield, Edit2, Check, X, Sparkles, Zap, Heart, ShieldCheck, AlertTriangle, CheckCircle2, History, BarChart3, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';
import { useNotificationsStore } from '../store/NotificationsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - vite json import allowed
import pkg from '../../package.json';

export function Settings() {
  const { userName, theme, setTheme, setIsOnboarded, navigate, setUserName } = useAppShell();
  const {
    permission,
    enabled,
    hydrate,
    requestPermission,
    setEnabled,
    refreshScheduledCount,
    sendTest,
  } = useNotificationsStore();

  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const version = useMemo(() => (pkg?.version as string) || '1.0.0', []);

  const openLink = useCallback(async (url: string) => {
    try {
      const anyWin: any = globalThis as any;
      const Browser = anyWin?.Capacitor?.Plugins?.Browser;
      if (Browser) {
        await Browser.open({ url });
        return;
      }
    } catch {}
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleResetOnboarding = () => {
    if (confirm('This will clear your profile and habits. Are you sure?')) {
      setIsOnboarded(false);
      navigate('/onboarding');
    }
  };

  const handleRemoveAllHabits = () => {
    navigate('/confirm-remove-habits');
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
      await sendTest();
      await refreshScheduledCount();
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleStartEditingName = () => {
    setTempName(userName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEditingName = () => {
    setTempName(userName);
    setIsEditingName(false);
  };

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Sync tempName with userName when userName changes
  React.useEffect(() => {
    setTempName(userName);
  }, [userName]);

  const SettingsSection = ({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6 px-2">
        {icon && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
      </div>
      <Card className="bg-gradient-to-br from-card to-card/50 border border-border shadow-sm">
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );

  const SettingsRow = ({ 
    icon, 
    title, 
    description, 
    action, 
    onClick,
    variant = 'default'
  }: { 
    icon: React.ReactNode; 
    title: string; 
    description?: string; 
    action?: React.ReactNode; 
    onClick?: () => void;
    variant?: 'default' | 'danger' | 'success';
  }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'danger':
          return 'hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800';
        case 'success':
          return 'hover:bg-green-50 dark:hover:bg-green-950/20 border-green-200 dark:border-green-800';
        default:
          return 'hover:bg-muted/50 border-border';
      }
    };

    return (
      <div 
        className={`flex items-center gap-4 p-5 border-b border-border last:border-b-0 transition-all duration-200 ${
          onClick ? `cursor-pointer ${getVariantStyles()}` : ''
        }`}
        onClick={onClick}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' :
          variant === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
          'bg-muted/50'
        }`}>
          <div className={`${
            variant === 'danger' ? 'text-red-600 dark:text-red-400' :
            variant === 'success' ? 'text-green-600 dark:text-green-400' :
            'text-muted-foreground'
          }`}>
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-base ${
            variant === 'danger' ? 'text-red-700 dark:text-red-300' :
            variant === 'success' ? 'text-green-700 dark:text-green-300' :
            'text-foreground'
          }`}>{title}</p>
          {description && (
            <p className={`text-sm mt-1 ${
              variant === 'danger' ? 'text-red-600 dark:text-red-400' :
              variant === 'success' ? 'text-green-600 dark:text-green-400' :
              'text-muted-foreground'
            }`}>{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
        {onClick && (
          <div className="flex-shrink-0">
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar title="Settings" />

      <div className="flex-1 px-6 py-6 pb-32 pb-safe-area-bottom overflow-y-auto">
        {/* Enhanced Profile Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/20 rounded-2xl mb-8 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {userName ? `Hello, ${userName}!` : 'Welcome!'}
                </h2>
                <p className="text-muted-foreground">
                  {userName ? 'Manage your account and preferences' : 'Set up your profile to get started'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Seventh Path
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Privacy First
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Section */}
        <SettingsSection title="Profile" icon={<User className="w-4 h-4 text-primary" />}>
          {isEditingName ? (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Edit Name</h4>
                  <p className="text-sm text-muted-foreground">Update your display name</p>
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12 text-lg"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveName();
                    } else if (e.key === 'Escape') {
                      handleCancelEditingName();
                    }
                  }}
                />
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleSaveName} 
                    disabled={!tempName.trim()}
                    className="flex-1 h-11 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEditingName}
                    className="h-11"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <SettingsRow
              icon={<User className="w-5 h-5" />}
              title="Display Name"
              description={userName || 'Tap to set your name'}
              action={
                <Button size="sm" variant="outline" onClick={handleStartEditingName} className="hover:scale-105 transition-transform">
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              }
            />
          )}
        </SettingsSection>

        {/* Enhanced Notifications Section */}
        <SettingsSection title="Notifications" icon={<Bell className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<Bell className="w-5 h-5" />}
            title="Notification Permission"
            description={permission === 'granted' ? 'Notifications are enabled' : 'Enable to receive reminders'}
            action={
              permission === 'granted' ? (
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Granted
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={handleRequestNotificationPermission} className="hover:scale-105 transition-transform">
                  <Bell className="w-4 h-4 mr-1" />
                  Enable
                </Button>
              )
            }
          />

          <SettingsRow
            icon={<SettingsIcon className="w-5 h-5" />}
            title="App Notifications"
            description={permission === 'granted' ? 'Toggle app notifications on/off' : 'Grant permission first'}
            action={
              <Switch
                checked={enabled}
                onCheckedChange={async (on) => {
                  try { await setEnabled(on); } catch (e) { console.error(e); }
                }}
                disabled={permission !== 'granted'}
              />
            }
          />

          <SettingsRow
            icon={<TestTube className="w-5 h-5" />}
            title="Test Notification"
            description={permission === 'granted' ? "Send a test notification" : 'Grant permission first'}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestNotification}
                disabled={isTestingNotification || permission !== 'granted' || !enabled}
                className="hover:scale-105 transition-transform"
              >
                {isTestingNotification ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1" />
                    Test
                  </>
                )}
              </Button>
            }
          />
        </SettingsSection>

        {/* Enhanced Preferences Section */}
        <SettingsSection title="Preferences" icon={<Palette className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<Palette className="w-5 h-5" />}
            title="Theme"
            description="Choose your preferred appearance"
            action={
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-36 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      System
                    </div>
                  </SelectItem>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </SettingsSection>

        {/* Enhanced Data Section */}
        <SettingsSection title="Data & Storage" icon={<RotateCcw className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<RotateCcw className="w-5 h-5" />}
            title="Reset Onboarding"
            description="Go through the setup process again"
            onClick={handleResetOnboarding}
          />
        </SettingsSection>

        {/* Enhanced About Section */}
        <SettingsSection title="About" icon={<Info className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<Info className="w-5 h-5" />}
            title="About Seventh Path"
            description={`Version ${version} • Learn more about the app`}
            onClick={() => setAboutOpen(true)}
          />
        </SettingsSection>

        {/* Enhanced Legal Section */}
        <SettingsSection title="Legal" icon={<Shield className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<FileText className="w-5 h-5" />}
            title="Terms of Use"
            description="Read our terms and conditions"
            onClick={() => navigate('/terms')}
          />
          <SettingsRow
            icon={<Shield className="w-5 h-5" />}
            title="Privacy Policy"
            description="How we protect your data"
            onClick={() => navigate('/privacy')}
          />
        </SettingsSection>

        {/* Enhanced Danger Zone */}
        <SettingsSection title="Danger Zone" icon={<AlertTriangle className="w-4 h-4 text-red-500" />}>
          <div className="p-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 dark:text-red-300">Remove All Habits</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">This action cannot be undone</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                onClick={handleRemoveAllHabits}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Remove All Habits
              </Button>
              <p className="text-xs text-red-600 dark:text-red-400 mt-3 text-center">
                This will permanently delete all habits, completions, and reminders from your device.
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Enhanced App Info */}
        <div className="mt-12 mb-8 text-center">
          <div className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-12 translate-x-12" />
            
            <div className="relative">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-lg">
                <img src="/icon-192.png" alt="Seventh Path Logo" className="w-16 h-16 object-contain" />
              </div>
              <h3 className="font-bold text-2xl mb-2 text-foreground">Seventh Path</h3>
              <p className="text-muted-foreground mb-4 text-lg">
                Journey of mindful habits
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge variant="secondary" className="px-3 py-1">
                  <Heart className="w-3 h-3 mr-1" />
                  Made with Love
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Privacy First
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Version {version} • Built for mindful living
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Modal */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="p-0 max-w-md w-[92vw] overflow-hidden">
          <div className="flex flex-col max-h-[85vh] bg-background">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
              <div className="px-5 pt-5 pb-3 text-center">
                <div className="mx-auto mb-3" style={{ width: 'min(100px, 28vw)' }}>
                  <img src="/icon-192.png" alt="Seventh Path Logo" className="w-full h-auto mx-auto" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">About Seventh Path</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">Journey of mindful habits</p>
                <p className="text-xs text-muted-foreground mt-1">Version {version} (build 1)</p>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="px-5 py-4 overflow-auto">
              <section className="mb-4">
                <h4 className="font-medium mb-1">What is Seventh Path?</h4>
                <p className="text-sm text-muted-foreground">
                  Seventh Path is a mindful habit tracker that turns small, consistent actions into long-term change. It helps you set clear reminders, build streaks, and see your progress at a glance—without clutter or distractions.
                </p>
              </section>

              <section className="mb-4">
                <h4 className="font-medium mb-1">Key Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Track Progress: Daily/weekly habits with a simple completion flow.</li>
                  <li>• Smart Reminders: Multiple custom times per habit (e.g., 08:00, 14:00, 21:00).</li>
                  <li>• Streaks & Best Streak: Stay motivated with current and all-time best streaks.</li>
                  <li>• Weekly Insights: Quick view of last 7 days and completion rates.</li>
                  <li>• Offline-first: Works without internet; data is stored on your device.</li>
                  <li>• Privacy-friendly: No account required by default.</li>
                </ul>
              </section>

              <section className="mb-4">
                <h4 className="font-medium mb-1">How Reminders Work</h4>
                <p className="text-sm text-muted-foreground">
                  Set one or more times for each habit. When you mark a reminder as done, the app cancels that time’s notification for today. If you don’t mark it, the notification still fires at the scheduled time so you don’t miss it.
                </p>
              </section>

              <section className="mb-4">
                <h4 className="font-medium mb-1">Streaks & Completion</h4>
                <p className="text-sm text-muted-foreground">
                  A day counts as completed when all reminders for that habit are done. Your current streak increases with each consecutive completed day; best streak is your longest run ever.
                </p>
              </section>

              <section className="mb-4">
                <h4 className="font-medium mb-1">Data & Privacy</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your habit data is stored locally using @capacitor/preferences.</li>
                  <li>• Notifications use @capacitor/local-notifications and require your permission.</li>
                  <li>• We do not sell or share your data.</li>
                  <li>• If you reset or uninstall the app, local data is removed from the device.</li>
                </ul>
              </section>

              <section className="mb-4">
                <h4 className="font-medium mb-1">Permissions Used</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Notifications: To send scheduled reminders at your chosen times.</li>
                </ul>
              </section>

              <section className="mb-4">
                <h4 className="font-medium mb-1">Credits</h4>
                <p className="text-sm text-muted-foreground">
                  Seventh Path is designed and built by Pratik Prakash Brahmapurkar. Brand, UI, and product strategy are crafted with care to support mindful living.
                </p>
              </section>

              {/* New: About the Author */}
              <section className="mb-4">
                <h4 className="font-medium mb-1">About the Author</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Author: Pratik Prakash Brahmapurkar</p>
                  <p>Pratik is a product strategist, developer, and yoga teacher passionate about creating calm, useful software.</p>
                  <p>Creator of Seventh Path—blending mindful living with minimal UX.</p>
                  <p>
                    Connect at{' '}
                    <button
                      onClick={() => openLink('https://misterpb.in')}
                      className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90"
                      aria-label="Open website misterpb.in"
                      role="link"
                    >
                      misterpb.in
                    </button>
                    {' '}or{' '}
                    <button
                      onClick={() => openLink('https://instagram.com/mister.pb')}
                      className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90"
                      aria-label="Open Instagram profile @mister.pb"
                      role="link"
                    >
                      Instagram @mister.pb
                    </button>
                    .
                  </p>
                </div>
              </section>

              <section className="mb-4">
                <h4 className="font-medium mb-1">Support & Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Questions or suggestions? Reach out at{' '}
                  <button
                    onClick={() => openLink('mailto:pbrahmapurkar@gmail.com')}
                    className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90"
                    aria-label="Email support at pbrahmapurkar@gmail.com"
                    role="link"
                  >
                    pbrahmapurkar@gmail.com
                  </button>
                  {' '}or visit{' '}
                  <button
                    onClick={() => openLink('https://misterpb.in')}
                    className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90"
                    aria-label="Open misterpb.in website"
                    role="link"
                  >
                    misterpb.in
                  </button>
                  . We’d love to hear from you.
                </p>
              </section>

              
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border px-4 py-3 flex items-center justify-between">
              <Button variant="ghost" onClick={() => {/* placeholder for Licenses route */}} aria-label="Open licenses">
                Licenses
              </Button>
              <Button onClick={() => setAboutOpen(false)} aria-label="Close About">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
