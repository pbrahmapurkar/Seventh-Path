/**
 * Seventh Path Zen Design System Demo
 * Comprehensive showcase of the mindful design system
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { ProgressRing } from '../ui/ProgressRing';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { BreathingAnimation } from '../animations/BreathingAnimation';
import { CelebrationAnimation } from '../animations/CelebrationAnimation';
import { MindfulNavigation } from '../navigation/MindfulNavigation';
import { CalmModeToggle } from '../accessibility/CalmModeToggle';
import { ZenThemeSelector } from '../ThemeSelector/ZenThemeSelector';
import { useZenTheme } from '../../contexts/ZenThemeContext';

export function ZenDesignSystemDemo() {
  const { theme } = useZenTheme();
  const [progress, setProgress] = useState(75);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: '3',
    },
    {
      id: 'meditation',
      label: 'Meditation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  const handleProgressComplete = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleLoadingToggle = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-heading text-primary">
            Seventh Path Zen Design System
          </h1>
          <p className="text-lg text-mindful max-w-2xl mx-auto">
            A mindful, spiritual design system for peaceful habit tracking and personal growth
          </p>
        </div>

        {/* Theme Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Selection</CardTitle>
            <CardDescription>
              Choose from our collection of peaceful, spiritual themes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ZenThemeSelector />
          </CardContent>
        </Card>

        {/* Accessibility Features */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Features</CardTitle>
            <CardDescription>
              Enhanced accessibility with Calm Mode and gentle interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalmModeToggle variant="card" />
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>
              Mindful button designs with gentle interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="completed">Completed</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Card Components</CardTitle>
            <CardDescription>
              Peaceful card designs with soft shadows and gentle gradients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regular Card</CardTitle>
                  <CardDescription>
                    A standard card with mindful spacing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-secondary">
                    This card demonstrates the peaceful design principles of our Zen system.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="primary" size="sm">
                    Action
                  </Button>
                </CardFooter>
              </Card>

              <Card className="card-completed">
                <CardHeader>
                  <CardTitle>Completed Card</CardTitle>
                  <CardDescription>
                    A card celebrating completion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-secondary">
                    This card shows the special treatment for completed items.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="completed" size="sm">
                    Completed
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Breathing Card</CardTitle>
                  <CardDescription>
                    A card with gentle breathing animation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BreathingAnimation intensity="subtle">
                    <p className="text-sm text-secondary">
                      This card gently breathes to create a calming effect.
                    </p>
                  </BreathingAnimation>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Progress Rings */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Rings</CardTitle>
            <CardDescription>
              Organic progress indicators with celebration effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center space-y-2">
                <ProgressRing
                  value={progress}
                  size={80}
                  strokeWidth={6}
                  breathing={true}
                />
                <p className="text-sm text-muted">Breathing Progress</p>
              </div>

              <div className="text-center space-y-2">
                <ProgressRing
                  value={100}
                  size={80}
                  strokeWidth={6}
                  celebration={true}
                />
                <p className="text-sm text-muted">Completed</p>
              </div>

              <div className="text-center space-y-2">
                <ProgressRing
                  value={60}
                  size={80}
                  strokeWidth={6}
                  showValue={false}
                />
                <p className="text-sm text-muted">Simple</p>
              </div>

              <div className="text-center space-y-2">
                <ProgressRing
                  value={progress}
                  size={80}
                  strokeWidth={6}
                  animated={true}
                />
                <p className="text-sm text-muted">Animated</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={() => setProgress(Math.min(progress + 10, 100))}
                variant="secondary"
                size="sm"
              >
                Increase
              </Button>
              <Button
                onClick={() => setProgress(Math.max(progress - 10, 0))}
                variant="secondary"
                size="sm"
              >
                Decrease
              </Button>
              <Button
                onClick={handleProgressComplete}
                variant="primary"
                size="sm"
              >
                Complete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>
              Mindful loading indicators for peaceful waiting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center space-y-2">
                <LoadingSpinner variant="spinner" size="md" />
                <p className="text-sm text-muted">Spinner</p>
              </div>

              <div className="text-center space-y-2">
                <LoadingSpinner variant="dots" size="md" />
                <p className="text-sm text-muted">Dots</p>
              </div>

              <div className="text-center space-y-2">
                <LoadingSpinner variant="breathing" size="md" />
                <p className="text-sm text-muted">Breathing</p>
              </div>

              <div className="text-center space-y-2">
                <LoadingSpinner variant="meditation" size="md" />
                <p className="text-sm text-muted">Meditation</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button onClick={handleLoadingToggle} variant="primary">
                {isLoading ? 'Loading...' : 'Start Loading'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>
              Mindful input fields with focus states and gentle interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="label">Regular Input</label>
                  <Input placeholder="Enter your mindful thought..." />
                </div>
                
                <div>
                  <label className="label">Focused Input</label>
                  <Input placeholder="This input has focus" className="ring-2 ring-sage" />
                </div>
                
                <div>
                  <label className="label">Disabled Input</label>
                  <Input placeholder="This input is disabled" disabled />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Large Input</label>
                  <Input placeholder="Large input for important text" className="h-12 text-lg" />
                </div>
                
                <div>
                  <label className="label">Input with Icon</label>
                  <div className="relative">
                    <Input placeholder="Search for habits..." className="pl-10" />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Components</CardTitle>
            <CardDescription>
              Mindful navigation with breathing transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-medium text-primary mb-4">Tab Navigation</h4>
                <MindfulNavigation
                  items={navigationItems}
                  activeItem="habits"
                  variant="tabs"
                />
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-primary mb-4">Bottom Navigation</h4>
                <MindfulNavigation
                  items={navigationItems}
                  activeItem="meditation"
                  variant="bottom"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Celebrations */}
        <Card>
          <CardHeader>
            <CardTitle>Celebration Animations</CardTitle>
            <CardDescription>
              Gentle celebration effects for habit completions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CelebrationAnimation type="pulse" intensity="gentle">
                <Button variant="primary">Pulse</Button>
              </CelebrationAnimation>
              
              <CelebrationAnimation type="glow" intensity="gentle">
                <Button variant="secondary">Glow</Button>
              </CelebrationAnimation>
              
              <CelebrationAnimation type="bounce" intensity="gentle">
                <Button variant="ghost">Bounce</Button>
              </CelebrationAnimation>
              
              <CelebrationAnimation type="rotate" intensity="gentle">
                <Button variant="completed">Rotate</Button>
              </CelebrationAnimation>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Zen Color Palette</CardTitle>
            <CardDescription>
              Our peaceful color system inspired by nature and spirituality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center space-y-2">
                <div 
                  className="w-16 h-16 rounded-full mx-auto border border-subtle"
                  style={{ backgroundColor: theme.colors.sage }}
                />
                <p className="text-sm font-medium">Sage</p>
                <p className="text-xs text-muted">Primary</p>
              </div>
              
              <div className="text-center space-y-2">
                <div 
                  className="w-16 h-16 rounded-full mx-auto border border-subtle"
                  style={{ backgroundColor: theme.colors.lavender }}
                />
                <p className="text-sm font-medium">Lavender</p>
                <p className="text-xs text-muted">Secondary</p>
              </div>
              
              <div className="text-center space-y-2">
                <div 
                  className="w-16 h-16 rounded-full mx-auto border border-subtle"
                  style={{ backgroundColor: theme.colors.amber }}
                />
                <p className="text-sm font-medium">Amber</p>
                <p className="text-xs text-muted">Accent</p>
              </div>
              
              <div className="text-center space-y-2">
                <div 
                  className="w-16 h-16 rounded-full mx-auto border border-subtle"
                  style={{ backgroundColor: theme.colors.mist }}
                />
                <p className="text-sm font-medium">Mist</p>
                <p className="text-xs text-muted">Background</p>
              </div>
              
              <div className="text-center space-y-2">
                <div 
                  className="w-16 h-16 rounded-full mx-auto border border-subtle"
                  style={{ backgroundColor: theme.colors.stone }}
                />
                <p className="text-sm font-medium">Stone</p>
                <p className="text-xs text-muted">Neutral</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography System</CardTitle>
            <CardDescription>
              Mindful typography with spiritual serif accents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-heading text-primary mb-2">
                  Heading 1 - Crimson Text
                </h1>
                <p className="text-sm text-muted">Font: Crimson Text, Size: 2.25rem, Line-height: 1.75</p>
              </div>
              
              <div>
                <h2 className="text-3xl font-heading text-primary mb-2">
                  Heading 2 - Spiritual Accent
                </h2>
                <p className="text-sm text-muted">Font: Crimson Text, Size: 1.875rem, Line-height: 1.7</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-heading text-primary mb-2">
                  Heading 3 - Mindful Design
                </h3>
                <p className="text-sm text-muted">Font: Crimson Text, Size: 1.5rem, Line-height: 1.7</p>
              </div>
              
              <div>
                <p className="text-base text-secondary mb-2">
                  Body text with comfortable line spacing and mindful reading experience. 
                  This paragraph demonstrates the peaceful typography system designed for 
                  spiritual growth and personal reflection.
                </p>
                <p className="text-sm text-muted">Font: System UI, Size: 1rem, Line-height: 1.6</p>
              </div>
              
              <div>
                <p className="text-mindful">
                  "The present moment is the only time over which we have dominion."
                </p>
                <p className="text-sm text-muted">Font: Crimson Text Italic, Special mindful text</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ZenDesignSystemDemo;
