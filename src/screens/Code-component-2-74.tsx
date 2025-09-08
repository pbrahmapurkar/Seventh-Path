import React, { useState } from 'react';
import { Heart, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';

const mockAffirmations = [
  {
    id: '1',
    text: "I am capable of creating positive change in my life through small, consistent actions.",
    category: 'self-confidence',
    isFavorite: false,
  },
  {
    id: '2',
    text: "Each day I grow stronger, wiser, and more aligned with my goals.",
    category: 'growth',
    isFavorite: true,
  },
  {
    id: '3',
    text: "I choose progress over perfection and celebrate every small victory.",
    category: 'motivation',
    isFavorite: false,
  },
];

export function Affirmations() {
  const { navigate } = useAppShell();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [affirmations, setAffirmations] = useState(mockAffirmations);

  const currentAffirmation = affirmations[currentIndex];

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % affirmations.length);
  };

  const prevAffirmation = () => {
    setCurrentIndex((prev) => (prev - 1 + affirmations.length) % affirmations.length);
  };

  const toggleFavorite = () => {
    setAffirmations(prev =>
      prev.map(aff =>
        aff.id === currentAffirmation.id
          ? { ...aff, isFavorite: !aff.isFavorite }
          : aff
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <AppBar
        title="Daily Affirmations"
        showBack
        onBack={() => navigate('/home')}
      />

      <div className="flex-1 flex flex-col p-6">
        {/* Card Counter */}
        <div className="text-center mb-6">
          <Badge variant="secondary">
            {currentIndex + 1} of {affirmations.length}
          </Badge>
        </div>

        {/* Affirmation Card */}
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="mb-6">
              <span className="text-4xl">✨</span>
            </div>
            
            <p className="text-lg leading-relaxed mb-6">
              {currentAffirmation.text}
            </p>

            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentAffirmation.category}
              </Badge>
              <button
                onClick={toggleFavorite}
                className={`p-1 rounded-full ${
                  currentAffirmation.isFavorite
                    ? 'text-red-500'
                    : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart size={16} fill={currentAffirmation.isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevAffirmation}
            disabled={affirmations.length <= 1}
          >
            <ChevronLeft size={16} />
          </Button>

          <div className="flex gap-2">
            {affirmations.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={nextAffirmation}
            disabled={affirmations.length <= 1}
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button variant="outline" className="w-full">
            Add to Reminders
          </Button>
          <Button variant="ghost" className="w-full">
            <Plus size={16} className="mr-2" />
            Create Custom Affirmation
          </Button>
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            🚧 This feature is coming soon! Get ready for personalized daily affirmations.
          </p>
        </div>
      </div>
    </div>
  );
}