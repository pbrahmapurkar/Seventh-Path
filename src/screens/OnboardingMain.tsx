import React, { useCallback } from 'react';
import { Button } from '../components/ui/button';
import { useAppShell } from '../components/AppShell';
import seventhPathLogo from '../assets/d39dcef0d5c4765688b970ab66912bbb65f81e62.png';
import '../styles/onboarding.css';
import { Capacitor } from '@capacitor/core';

export function OnboardingMain() {
  const { navigate } = useAppShell();

  const hapticTap = useCallback(async () => {
    // Best-effort haptic feedback: Capacitor Haptics if present, else vibrate
    try {
      const anyWin: any = globalThis as any;
      const Haptics = anyWin?.Capacitor?.Plugins?.Haptics;
      if (Haptics) {
        await Haptics.impact({ style: 'light' });
        return;
      }
    } catch {}
    if ('vibrate' in navigator) navigator.vibrate(10);
  }, []);

  return (
    <div className="onboarding-intro bg-[#0C1117] dark:bg-[#0C1117] min-h-screen">
      {/* Safe area header with progress */}
      <div className="intro-header">
        <div className="intro-progress-bars" aria-hidden="true">
          <span className="bar bar-active" />
          <span className="bar" />
          <span className="bar" />
        </div>
        <span className="intro-step text-muted-foreground">1 of 3</span>
      </div>

      {/* Scrollable content */}
      <div className="intro-scroll">
        {/* Logo block */}
        <div className="intro-logo-wrap motion-scale-in" role="img" aria-label="Seventh Path logo">
          <img src={seventhPathLogo} alt="Seventh Path Logo" className="intro-logo" />
        </div>

        {/* Headline & Body */}
        <h1 className="intro-headline motion-fade-up" style={{ animationDelay: '60ms' }}>Welcome to Seventh Path</h1>
        <p className="intro-body motion-fade-up" style={{ animationDelay: '120ms' }}>
          Begin your journey of mindful habits. Transform your life with small, consistent actions that lead to lasting change.
        </p>

        {/* Feature cards */}
        <div className="intro-cards">
          {[
            { icon: '📊', label: 'Track Progress' },
            { icon: '🔔', label: 'Smart Reminders' },
            { icon: '🏆', label: 'Build Streaks' },
            { icon: '💫', label: 'Stay Motivated' },
          ].map((c, i) => (
            <button
              key={c.label}
              className="intro-card motion-fade-in"
              style={{ animationDelay: `${200 + i * 80}ms` }}
              aria-label={c.label}
            >
              <span className="intro-card-icon" aria-hidden="true">{c.icon}</span>
              <span className="intro-card-label">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="intro-footer">
        <Button
          onClick={async () => { await hapticTap(); navigate('/onboarding/name'); }}
          className="intro-cta"
          aria-label="Continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
