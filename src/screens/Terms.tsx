import React from 'react';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';

export function TermsOfUse() {
  const { navigate } = useAppShell();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar title="Terms of Use" showBack onBack={() => navigate('/settings')} />
      <div className="p-6 space-y-4 text-sm text-muted-foreground">
        <h1 className="text-xl font-semibold text-foreground">Terms of Use</h1>
        <p>Last updated: 16 Sep 2025</p>

        <p>
          Welcome to our Habit Tracking Application. By using this app, you agree to the following terms:
        </p>

        <h2 className="text-foreground font-medium mt-4">Use of the App</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>This app is intended for personal use only.</li>
          <li>You agree not to misuse the app, attempt to disrupt its functionality, or access data without authorization.</li>
        </ul>

        <h2 className="text-foreground font-medium mt-4">User Responsibilities</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You are responsible for the accuracy of the information you provide.</li>
          <li>You agree to use the app in a way that complies with all applicable laws.</li>
        </ul>

        <h2 className="text-foreground font-medium mt-4">Intellectual Property</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>All content, designs, and features of this app are owned by the developers unless otherwise stated.</li>
          <li>You may not copy, distribute, or reuse any part of the app without prior permission.</li>
        </ul>

        <h2 className="text-foreground font-medium mt-4">Disclaimer</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>This app is provided “as is” without warranties of any kind.</li>
          <li>We are not responsible for any data loss, health outcomes, or reliance on features of the app.</li>
        </ul>

        <h2 className="text-foreground font-medium mt-4">Changes to Terms</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>We may update these Terms of Use from time to time.</li>
          <li>Continued use of the app means you accept the updated terms.</li>
          <li>If you do not agree with these terms, please stop using the app.</li>
        </ul>
      </div>
    </div>
  );
}
