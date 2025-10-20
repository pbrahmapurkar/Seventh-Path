import React, { useState } from 'react';
import { Calendar, Share, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { AppBar, useAppShell } from '../components/AppShellRouter';

const gratitudePrompts = [
  "What made you smile today?",
  "Who are you grateful for and why?",
  "What's something beautiful you noticed today?",
];

export function DailyGratitudes() {
  const { navigate } = useAppShell();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [gratitudes, setGratitudes] = useState(['', '', '']);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const goToPreviousDay = () => {
    setCurrentDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
    // Load gratitudes for previous day
    setGratitudes(['', '', '']);
  };

  const goToNextDay = () => {
    const tomorrow = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    const today = new Date();
    
    // Don't allow going beyond today
    if (tomorrow <= today) {
      setCurrentDate(tomorrow);
      // Load gratitudes for next day
      setGratitudes(['', '', '']);
    }
  };

  const updateGratitude = (index: number, value: string) => {
    setGratitudes(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const saveGratitudes = () => {
    // Save gratitudes logic here
    console.log('Saving gratitudes:', gratitudes);
  };

  const shareGratitudes = () => {
    const text = gratitudes
      .filter(g => g.trim())
      .map((g, i) => `${i + 1}. ${g}`)
      .join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'My Daily Gratitudes',
        text: `Today I'm grateful for:\n\n${text}`,
      });
    }
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();
  const isFuture = currentDate > new Date();

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <AppBar
        title="Daily Gratitudes"
        showBack
        onBack={() => navigate('/home')}
      />

      <div className="flex-1 p-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
          >
            <ChevronLeft size={16} />
          </Button>

          <div className="text-center">
            <p className="font-medium">{formatDate(currentDate)}</p>
            {isToday && (
              <p className="text-sm text-primary">Today</p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            disabled={isFuture}
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Gratitude Form */}
        <div className="space-y-6">
          <div className="text-center mb-8">
            <span className="text-4xl">🙏</span>
            <h2 className="text-xl font-medium mt-2">What are you grateful for?</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Take a moment to reflect on the good in your life
            </p>
          </div>

          {gratitudePrompts.map((prompt, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`gratitude-${index}`}>{prompt}</Label>
              <Textarea
                id={`gratitude-${index}`}
                placeholder="Write your thoughts here..."
                value={gratitudes[index]}
                onChange={(e) => updateGratitude(index, e.target.value)}
                className="min-h-20 resize-none"
                disabled={!isToday}
              />
            </div>
          ))}

          {isToday && (
            <div className="flex gap-3 pt-4">
              <Button onClick={saveGratitudes} className="flex-1">
                Save
              </Button>
              <Button
                variant="outline"
                onClick={shareGratitudes}
                disabled={!gratitudes.some(g => g.trim())}
              >
                <Share size={16} />
              </Button>
            </div>
          )}

          {!isToday && (
            <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {isFuture 
                  ? "You can only write gratitudes for today and past days."
                  : "Viewing past gratitudes. You can only edit today's entries."
                }
              </p>
            </div>
          )}
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-8 bg-muted/50 border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            🚧 This feature is coming soon! Get ready for daily gratitude journaling with export options.
          </p>
        </div>
      </div>
    </div>
  );
}