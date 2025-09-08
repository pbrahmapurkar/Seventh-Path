import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAppShell } from '../components/AppShell';

export function OnboardingName() {
  const { navigate, userName, setUserName } = useAppShell();
  const [name, setName] = useState(userName);

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name.trim());
      navigate('/onboarding/habits');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Progress Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div className="flex gap-2">
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-muted rounded-full" />
        </div>
        <span className="text-sm text-muted-foreground">2 of 3</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-4">What's your name?</h1>
          <p className="text-muted-foreground">
            We'll use this to personalize your experience and cheer you on!
          </p>
        </div>

        <div className="space-y-4 mb-12">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12"
            autoFocus
          />
          <p className="text-sm text-muted-foreground">
            This helps us create a more personal experience for you.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 pt-0">
        <Button
          onClick={handleContinue}
          disabled={!name.trim()}
          className="w-full h-12"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}