import { AppBar, useAppShell } from '../components/AppShellRouter';
import { Capacitor } from '@capacitor/core';

// Capacitor-safe external link helper
function openExternal(url: string): void {
  // Check if we're in a Capacitor environment
  if (Capacitor.getPlatform() !== 'web') {
    // For mobile platforms, try to use the Capacitor Browser plugin
    // This will be handled by the Capacitor runtime if the plugin is available
    try {
      // Use the global Capacitor object to access plugins
      const anyWin: any = globalThis as any;
      const Browser = anyWin?.Capacitor?.Plugins?.Browser;
      if (Browser) {
        Browser.open({ url });
        return;
      }
    } catch (browserError) {
      console.warn('Browser plugin not available, falling back to window.open:', browserError);
    }
  }
  
  // Fallback to window.open (works on web and as last resort on mobile)
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Failed to open external URL:', url, error);
  }
}

export function PrivacyPolicy() {
  const { navigate } = useAppShell();
  return (
    <div 
      className="flex flex-col min-h-screen bg-background w-full"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <AppBar title="Privacy Policy" showBack onBack={() => navigate('/settings')} />
      <div className="flex-1 px-6 py-6 pt-20 pb-24 w-full overflow-x-hidden overflow-y-auto">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">Data Collection & Storage</h2>
              <p className="leading-relaxed">
                Seventh Path stores everything locally on your device: your name (if provided), habit definitions, reminder times, completion history, and optional notes; no accounts, cloud sync, or analytics are used.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">Permissions & Access</h2>
              <p className="leading-relaxed">
                The app accesses only the permissions you grant—primarily local notifications (to schedule reminders) and haptics/vibration for feedback; it does not track location, contacts, or other personal data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">Data Control & Retention</h2>
              <p className="leading-relaxed">
                Because data never leaves your device, you control retention: delete habits, reset the app, or uninstall to remove information; reinstalling creates a fresh state with no prior records.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">Security Measures</h2>
              <p className="leading-relaxed">
                We safeguard information through minimal collection, on-device storage, and respecting your system's security, but you are responsible for keeping your device updated and protected.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">Third-Party Services</h2>
              <p className="leading-relaxed">
                We do not share or sell any personal information; third parties only include the notification services built into iOS or Android, which deliver alerts you schedule.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">Policy Updates</h2>
              <p className="leading-relaxed">
                This policy may evolve to reflect new features or legal requirements; material changes will appear in-app, and continued use after updates indicates acceptance. For privacy questions, contact Pratik Prakash Brahmapurkar via{' '}
                <button
                  onClick={() => openExternal('https://misterpb.in')}
                  className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90 font-medium"
                  aria-label="Open website misterpb.in"
                  role="link"
                >
                  misterpb.in
                </button>{' '}
                or Instagram{' '}
                <button
                  onClick={() => openExternal('https://instagram.com/mister.pb')}
                  className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90 font-medium"
                  aria-label="Open Instagram profile @mister.pb"
                  role="link"
                >
                  @mister.pb
                </button>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
