import React from 'react';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';

export function TermsOfUse() {
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
      <AppBar title="Terms of Use" showBack onBack={() => navigate('/settings')} />
      <div className="flex-1 px-6 py-6 pt-20 pb-24 w-full overflow-x-hidden overflow-y-auto">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Terms of Use</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <p className="leading-relaxed">
                Using Seventh Path signifies that you accept these terms; if you do not agree, please uninstall the app.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">App Purpose & Limitations</h2>
              <p className="leading-relaxed">
                The app is designed for habit tracking and mindful wellness support only; it is not medical advice, therapy, or a substitute for professional care.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">User Responsibilities</h2>
              <p className="leading-relaxed">
                You remain responsible for the accuracy of any information you enter (name, habits, reminders, notes) and for maintaining your device's security; the app operates offline, so loss, reset, or uninstalling will erase your data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">Notifications</h2>
              <p className="leading-relaxed">
                Notifications are delivered through your device's native system; you may adjust or revoke permission at any time, but doing so may limit reminder functionality.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">Disclaimer of Warranties</h2>
              <p className="leading-relaxed">
                Seventh Path is provided "as-is"; we do not guarantee uninterrupted operation, error-free behavior, or specific results, and we are not liable for indirect, incidental, or consequential damages arising from use.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-3">Changes to Terms</h2>
              <p className="leading-relaxed">
                We may update the app or these terms periodically; continued use after updates constitutes acceptance. If you have questions about the terms, contact Pratik Prakash Brahmapurkar at{' '}
                <button
                  onClick={() => window.open('https://misterpb.in', '_blank', 'noopener,noreferrer')}
                  className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90 font-medium"
                  aria-label="Open website misterpb.in"
                  role="link"
                >
                  misterpb.in
                </button>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
