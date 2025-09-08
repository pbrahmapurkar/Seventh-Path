import React, { useEffect } from 'react';
import { useAppShell } from '../components/AppShell';
import seventhPathLogo from 'figma:asset/d39dcef0d5c4765688b970ab66912bbb65f81e62.png';

export function BootScreen() {
  const { navigate, isOnboarded } = useAppShell();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      if (isOnboarded) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, isOnboarded]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 flex items-center justify-center">
          <img src={seventhPathLogo} alt="Seventh Path Logo" className="w-20 h-20 object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-medium text-foreground mb-2">Seventh Path</h1>
          <p className="text-muted-foreground">Journey of mindful habits</p>
        </div>
        <div className="flex space-x-1 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}