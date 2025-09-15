import React, { useCallback } from 'react';
import { Button } from '../components/ui/button';
import { useAppShell } from '../components/AppShell';
import seventhPathLogo from '../assets/d39dcef0d5c4765688b970ab66912bbb65f81e62.png';
import '../styles/onboarding.css';
import { Capacitor } from '@capacitor/core';
import { ArrowRight, Sparkles, Target, TrendingUp, Heart } from 'lucide-react';

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
      <div className="intro-header pt-safe-area-top">
        <div className="intro-progress-bars" aria-hidden="true">
          <span className="bar bar-active" />
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </div>
        <span className="intro-step text-muted-foreground">1 of 4</span>
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
            { icon: <Target className="w-6 h-6" />, label: 'Track Progress', description: 'Visual insights' },
            { icon: <Sparkles className="w-6 h-6" />, label: 'Smart Reminders', description: 'Never miss a beat' },
            { icon: <TrendingUp className="w-6 h-6" />, label: 'Build Streaks', description: 'Stay consistent' },
            { icon: <Heart className="w-6 h-6" />, label: 'Stay Motivated', description: 'Celebrate wins' },
          ].map((c, i) => (
            <button
              key={c.label}
              className="intro-card motion-fade-in"
              style={{ animationDelay: `${200 + i * 80}ms` }}
              aria-label={c.label}
            >
              <div className="intro-card-icon text-primary" aria-hidden="true">{c.icon}</div>
              <div className="intro-card-content">
                <span className="intro-card-label">{c.label}</span>
                <span className="intro-card-description">{c.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Sticky CTA with safe area */}
      <div className="intro-footer pb-safe-area-bottom">
        <div className="px-6 pb-6">
          <Button
            onClick={async () => { await hapticTap(); navigate('/onboarding/name'); }}
            className="w-full h-16 text-lg font-semibold rounded-2xl group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            aria-label="Get Started"
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              <span>Get Started</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Button>
          
          {/* Motivational text */}
          <p className="text-center text-sm text-muted-foreground mt-4 leading-relaxed">
            Join thousands building better habits, one day at a time
          </p>
        </div>
      </div>
    </div>
  );
}
