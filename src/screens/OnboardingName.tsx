import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAppShell } from '../components/AppShell';
import { User, ArrowRight, Sparkles } from 'lucide-react';

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
      <div className="flex items-center justify-between px-6 py-4 pt-safe-area-top">
        <div className="flex gap-2">
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-primary rounded-full" />
          <div className="w-8 h-1 bg-muted rounded-full" />
          <div className="w-8 h-1 bg-muted rounded-full" />
        </div>
        <span className="text-sm text-muted-foreground">2 of 4</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">What's your name?</h1>
          <p className="text-muted-foreground text-lg">
            We'll use this to personalize your experience and cheer you on!
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-6 mb-12">
          <div className="relative">
            <Label htmlFor="name" className="text-base font-medium mb-2 block">Your name</Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleContinue(); }}
                className="h-14 text-lg pl-4 pr-12 border-2 focus:border-primary transition-colors"
                autoFocus
              />
              {name.trim() && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This helps us create a more personal experience for you.
            </p>
          </div>

          {/* Motivational Message */}
          {name.trim() && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-primary">Nice to meet you, {name.trim()}!</p>
                  <p className="text-sm text-primary/80">Ready to start your journey?</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 pt-0 pb-safe-area-bottom">
        <Button
          onClick={handleContinue}
          disabled={!name.trim()}
          className="w-full h-14 text-lg font-medium group"
        >
          Save & Continue
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
