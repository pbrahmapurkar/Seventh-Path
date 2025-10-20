/**
 * Spiritual Guidance Component
 * Provides gentle, encouraging messages and spiritual wisdom throughout the app
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Quote, Lightbulb, TreePine, Sunrise } from 'lucide-react';

interface SpiritualMessage {
  id: string;
  text: string;
  type: 'encouragement' | 'wisdom' | 'reflection' | 'celebration';
  icon: React.ReactNode;
  category: 'growth' | 'patience' | 'gratitude' | 'mindfulness' | 'progress';
}

const spiritualMessages: SpiritualMessage[] = [
  {
    id: '1',
    text: "Every small step is a sacred act of self-love",
    type: 'encouragement',
    icon: <Heart className="w-5 h-5" />,
    category: 'growth'
  },
  {
    id: '2',
    text: "Progress is not always visible, but it's always happening",
    type: 'wisdom',
    icon: <TreePine className="w-5 h-5" />,
    category: 'patience'
  },
  {
    id: '3',
    text: "In this moment, you are exactly where you need to be",
    type: 'reflection',
    icon: <Sunrise className="w-5 h-5" />,
    category: 'mindfulness'
  },
  {
    id: '4',
    text: "Your journey is unique, and that's your greatest strength",
    type: 'encouragement',
    icon: <Sparkles className="w-5 h-5" />,
    category: 'growth'
  },
  {
    id: '5',
    text: "Gratitude transforms ordinary moments into blessings",
    type: 'wisdom',
    icon: <Quote className="w-5 h-5" />,
    category: 'gratitude'
  },
  {
    id: '6',
    text: "Consistency is the gentle art of showing up for yourself",
    type: 'reflection',
    icon: <Lightbulb className="w-5 h-5" />,
    category: 'mindfulness'
  }
];

interface SpiritualGuidanceProps {
  context?: 'habit-completion' | 'habit-creation' | 'reflection' | 'general';
  category?: 'growth' | 'patience' | 'gratitude' | 'mindfulness' | 'progress';
  className?: string;
}

export function SpiritualGuidance({ 
  context = 'general', 
  category,
  className = '' 
}: SpiritualGuidanceProps) {
  const [currentMessage, setCurrentMessage] = useState<SpiritualMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Filter messages based on context and category
  const getFilteredMessages = () => {
    let filtered = spiritualMessages;
    
    if (category) {
      filtered = filtered.filter(msg => msg.category === category);
    }
    
    // Context-specific filtering
    if (context === 'habit-completion') {
      filtered = filtered.filter(msg => 
        msg.type === 'celebration' || msg.type === 'encouragement'
      );
    } else if (context === 'habit-creation') {
      filtered = filtered.filter(msg => 
        msg.type === 'encouragement' || msg.type === 'wisdom'
      );
    } else if (context === 'reflection') {
      filtered = filtered.filter(msg => 
        msg.type === 'reflection' || msg.type === 'wisdom'
      );
    }
    
    return filtered;
  };

  const showMessage = () => {
    const messages = getFilteredMessages();
    if (messages.length === 0) return;
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCurrentMessage(randomMessage);
    setIsVisible(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  useEffect(() => {
    // Show a message on mount
    const timer = setTimeout(showMessage, 1000);
    return () => clearTimeout(timer);
  }, [context, category]);

  if (!currentMessage) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.4, 0.0, 0.2, 1],
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
          className={`spiritual-guidance ${className}`}
        >
          <div className="bg-gradient-to-br from-sage/5 to-mist/10 backdrop-blur-sm border border-sage/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-sage/80">
                {currentMessage.icon}
              </div>
              <div className="flex-1">
                <p className="text-sage-900 dark:text-sage-100 text-lg leading-relaxed font-medium">
                  {currentMessage.text}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-sage-600 dark:text-sage-400 uppercase tracking-wide font-medium">
                    {currentMessage.category}
                  </span>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-sage-400 hover:text-sage-600 transition-colors duration-200"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easy access to spiritual guidance
export function useSpiritualGuidance() {
  const showGuidance = (context?: SpiritualGuidanceProps['context'], category?: SpiritualGuidanceProps['category']) => {
    // This would trigger the guidance component to show a message
    // Implementation would depend on how you want to manage state
  };

  return { showGuidance };
}
