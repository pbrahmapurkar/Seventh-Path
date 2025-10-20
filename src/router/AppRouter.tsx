/**
 * App Router Configuration
 * Defines routes and handles navigation for the Seventh Path app
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShellProvider, BottomNav } from '../components/AppShellRouter';
import { useAppShell } from '../components/AppShellRouter';
import { SpiritualNavigation } from '../components/spiritual/SpiritualNavigation';

// Import all screens
import { BootScreen } from '../screens/BootScreen';
import { OnboardingName } from '../screens/OnboardingName';
import { OnboardingHabits } from '../screens/OnboardingHabits';
import { HomeToday } from '../screens/HomeToday';
import { SpiritualHome } from '../screens/SpiritualHome';
import { History } from '../screens/History';
import { Insights } from '../screens/Insights';
import { Settings } from '../screens/Settings';
import { AddHabit } from '../screens/AddHabit';
import { HabitDetail } from '../screens/HabitDetail';
import { HabitDetails } from '../screens/HabitDetails';
import { PrivacyPolicy } from '../screens/Privacy';
import { ErrorNotFound } from '../screens/ErrorNotFound';

// Main app content with routing
function AppContent() {
  const { currentRoute, navigate } = useAppShell();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Routes>
        {/* Boot and Onboarding Routes */}
        <Route path="/boot" element={<BootScreen />} />
        <Route path="/onboarding/name" element={<OnboardingName />} />
        <Route path="/onboarding/habits" element={<OnboardingHabits />} />
        
        {/* Main App Routes */}
        <Route path="/home" element={<SpiritualHome />} />
        <Route path="/habits" element={<HomeToday />} />
        <Route path="/history" element={<History />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Habit Management Routes */}
        <Route path="/add-habit" element={<AddHabit />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
        <Route path="/habit/:id/details" element={<HabitDetails />} />
        
        {/* Settings Sub-routes */}
        <Route path="/settings/privacy" element={<PrivacyPolicy />} />
        
        {/* Error Routes */}
        <Route path="/404" element={<ErrorNotFound />} />
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/boot" replace />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      
      {/* Bottom Navigation - only show on main app routes */}
      {currentRoute.startsWith('/home') || 
       currentRoute.startsWith('/habits') ||
       currentRoute.startsWith('/history') || 
       currentRoute.startsWith('/insights') || 
       currentRoute.startsWith('/settings') ? (
        <SpiritualNavigation currentRoute={currentRoute} onNavigate={navigate} />
      ) : null}
    </div>
  );
}

// Main router component
export function AppRouter() {
  return (
    <BrowserRouter>
      <AppShellProvider>
        <AppContent />
      </AppShellProvider>
    </BrowserRouter>
  );
}
