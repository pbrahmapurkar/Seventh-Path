import React from 'react';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';

export function PrivacyPolicy() {
  const { navigate } = useAppShell();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar title="Privacy Policy" showBack onBack={() => navigate('/settings')} />
      <div className="p-6 space-y-4 text-sm text-muted-foreground">
        <h1 className="text-xl font-semibold text-foreground">Privacy Policy</h1>
        <p>Last updated: 16 Sep 2025</p>

        <p>
          Your privacy is important to us. This policy explains how we handle your information in our Habit Tracking Application:
        </p>

        <h2 className="text-foreground font-medium mt-4">Data We Collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Basic information you provide, such as your name, habits, and reminders.</li>
          <li>App usage data to improve performance and features.</li>
        </ul>

        <h2 className="text-foreground font-medium mt-4">How We Use Data</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To personalize your experience and track your habits.</li>
          <li>To send you reminders and notifications if enabled.</li>
          <li>To improve and enhance app performance.</li>
        </ul>

        <h2 className="text-foreground font-medium mt-4">Data Storage & Security</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your data is stored securely and is not shared with third parties without your consent.</li>
          <li>We take reasonable measures to protect your information.</li>
        </ul>

        <h2 className="text-foreground font-medium mt-4">Third-Party Services</h2>
        <p>
          If the app integrates with third-party services (e.g., cloud backup), their privacy policies apply.
        </p>

        <h2 className="text-foreground font-medium mt-4">Your Rights</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You can request to delete your data at any time.</li>
          <li>You can disable notifications or tracking features within the app.</li>
        </ul>

        <h2 className="text-foreground font-medium mt-4">Policy Updates</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>This policy may change from time to time.</li>
          <li>We will notify users of significant changes.</li>
        </ul>

        <p>By using this app, you agree to the terms of this Privacy Policy.</p>
      </div>
    </div>
  );
}
