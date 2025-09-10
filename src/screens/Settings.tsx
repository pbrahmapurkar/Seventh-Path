import React, { useCallback, useMemo, useState } from 'react';
import { ChevronRight, User, Bell, Palette, RotateCcw, Info, Sun, Moon, Monitor, Settings as SettingsIcon, TestTube, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';
import { useNotificationsStore } from '../store/NotificationsStore';
import seventhPathLogo from '../assets/d39dcef0d5c4765688b970ab66912bbb65f81e62.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - vite json import allowed
import pkg from '../../package.json';

export function Settings() {
  const { userName, theme, setTheme, setIsOnboarded, navigate } = useAppShell();
  const {
    permission,
    enabled,
    scheduledCount,
    hydrate,
    requestPermission,
    setEnabled,
    refreshScheduledCount,
    sendTest,
    openSystemSettings,
  } = useNotificationsStore();

  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
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

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

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

        {/* Danger Zone */}
        <SettingsSection title="⚠️ Danger Zone">
          <div className="p-4">
            <Button 
              variant="destructive" 
              className="w-full font-bold"
              onClick={handleRemoveAllHabits}
            >
              <Trash2 size={16} className="mr-2" />
              Remove All Habits
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will permanently delete all habits, completions, and reminders.
            </p>
          </div>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsRow
            icon={<Bell size={20} />}
            title="Notifications"
            description={`Permission: ${permission}`}
            action={
              permission === 'granted' ? (
                <Button size="sm" variant="outline" onClick={openSystemSettings}>System</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleRequestNotificationPermission}>Enable</Button>
              )
            }
          />

          <SettingsRow
            icon={<SettingsIcon size={20} />}
            title="Enabled"
            description={permission === 'granted' ? 'App notifications' : 'Grant permission first'}
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
            icon={<TestTube size={20} />}
            title="Scheduled Count"
            description={`${scheduledCount} scheduled`}
            action={
              <Button size="sm" variant="outline" onClick={refreshScheduledCount}>Refresh</Button>
            }
          />

          <SettingsRow
            icon={<TestTube size={20} />}
            title="Test Notification"
            description={permission === 'granted' ? "Send a test notification" : 'Grant permission first'}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestNotification}
                disabled={isTestingNotification || permission !== 'granted' || !enabled}
              >
                {isTestingNotification ? 'Sending...' : 'Test'}
              </Button>
            }
          />
        </SettingsSection>

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
            description={`Version ${version}`}
            onClick={() => setAboutOpen(true)}
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
                  <img src={seventhPathLogo} alt="Seventh Path Logo" className="w-full h-auto mx-auto" />
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
                  <li>• (Optional) Haptics/Animations: For feedback; respects “Reduce Motion”.</li>
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

              <section className="mb-2">
                <h4 className="font-medium mb-1">Legal</h4>
                <p className="text-sm text-muted-foreground">
                  By using this app, you agree to the app’s Terms of Use and Privacy Policy (link these if routes exist). “Seventh Path” and the logo are trademarks of their respective owner.
                  <br />
                  Made with ❤️ in India
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
