import React from 'react';
import { Button } from '../components/ui/button';
import { useAppShell } from '../components/AppShell';

export function ErrorNotFound() {
  const { navigate } = useAppShell();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="mb-8">
        <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
          <span className="text-6xl">🔍</span>
        </div>
        <h1 className="text-3xl font-medium mb-4">Page Not Found</h1>
        <p className="text-muted-foreground text-lg max-w-sm">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="space-y-3">
        <Button onClick={() => navigate('/home')} className="w-full">
          Go Home
        </Button>
        <Button variant="outline" onClick={() => window.history.back()} className="w-full">
          Go Back
        </Button>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Need help? Contact support or check our help documentation.
        </p>
      </div>
    </div>
  );
}