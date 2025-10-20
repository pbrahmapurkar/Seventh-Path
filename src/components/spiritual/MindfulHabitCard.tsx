/**
 * Mindful Habit Card Component
 * A gentle, encouraging habit card that whispers rather than demands
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Heart, 
  Sparkles, 
  Wind, 
  Flame,
  Clock,
  Target,
  Star,
  Leaf,
  Sunrise,
  Moon
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useHabitsStore } from '../../store/HabitsStore';
import { getCompletionForDateMemoized } from '../../lib/completion';
import { useMindfulNotifications } from './MindfulNotifications';

interface MindfulHabitCardProps {
  habit: {
    id: string;
    name: string;
    emoji: string;
    description?: string;
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    category?: string;
  };
  onComplete?: (habitId: string) => void;
  onEdit?: (habitId: string) => void;
  className?: string;
}

const timeIcons = {
  morning: <Sunrise className="w-4 h-4 text-orange-500" />,
  afternoon: <Sun className="w-4 h-4 text-yellow-500" />,
  evening: <Moon className="w-4 h-4 text-indigo-500" />
};

const categoryIcons = {
  health: <Heart className="w-4 h-4 text-red-500" />,
  mindfulness: <Wind className="w-4 h-4 text-blue-500" />,
  productivity: <Target className="w-4 h-4 text-green-500" />,
  creativity: <Sparkles className="w-4 h-4 text-purple-500" />,
  learning: <Star className="w-4 h-4 text-yellow-500" />,
  nature: <Leaf className="w-4 h-4 text-emerald-500" />,
  default: <Circle className="w-4 h-4 text-sage-500" />
};

const encouragingMessages = [
  "You're doing beautifully",
  "Every step matters",
  "Trust your journey",
  "You've got this",
  "Small actions, big changes",
  "Progress is happening",
  "You're exactly where you need to be",
  "This moment is perfect"
];

export function MindfulHabitCard({ 
  habit, 
  onComplete, 
  onEdit, 
  className = '' 
}: MindfulHabitCardProps) {
  const { toggleHabitCompletion } = useHabitsStore();
  const { showCelebration, showEncouragement } = useMindfulNotifications();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isCompleted = getCompletionForDateMemoized(habit.id, today) === true;
  const categoryIcon = categoryIcons[habit.category as keyof typeof categoryIcons] || categoryIcons.default;

  const handleComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    
    // Gentle animation delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    toggleHabitCompletion(habit.id, today);
    
    if (!isCompleted) {
      // Show celebration
      showCelebration(`Beautiful work on "${habit.name}"`);
      
      // Show encouragement message
      const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }
    
    onComplete?.(habit.id);
    setIsCompleting(false);
  };

  const getCompletionMessage = () => {
    if (isCompleted) {
      return "Well done! You've honored your commitment today.";
    }
    
    const messages = [
      "Ready when you are",
      "No pressure, just presence",
      "Your practice awaits",
      "Gentle reminder",
      "Time for self-care"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`${className}`}
    >
      <Card className={`
        relative overflow-hidden transition-all duration-300
        ${isCompleted 
          ? 'bg-gradient-to-br from-sage/20 to-mist/20 border-sage/40 shadow-lg' 
          : 'bg-white/50 dark:bg-sage-900/20 border-sage/20 hover:border-sage/40'
        }
        ${isCompleting ? 'pointer-events-none' : ''}
      `}>
        {/* Completion Glow Effect */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-sage/10 to-mist/10 pointer-events-none"
          />
        )}

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {habit.emoji}
              </div>
              <div>
                <h3 className="font-medium text-sage-900 dark:text-sage-100 text-lg">
                  {habit.name}
                </h3>
                {habit.description && (
                  <p className="text-sm text-sage-600 dark:text-sage-400 mt-1">
                    {habit.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {habit.timeOfDay && timeIcons[habit.timeOfDay]}
              {categoryIcon}
            </div>
          </div>

          {/* Encouragement Message */}
          <AnimatePresence>
            {showEncouragement && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-gradient-to-r from-sage/10 to-mist/10 rounded-lg border border-sage/20"
              >
                <p className="text-sm text-sage-700 dark:text-sage-300 text-center font-medium">
                  {encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gentle Message */}
          <div className="mb-6">
            <p className="text-sm text-sage-600 dark:text-sage-400 text-center italic">
              {getCompletionMessage()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className={`
                relative overflow-hidden
                ${isCompleted 
                  ? 'btn-completed' 
                  : 'btn-primary'
                }
                ${isCompleting ? 'opacity-50' : ''}
              `}
            >
              <motion.div
                animate={isCompleting ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex items-center gap-2"
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-5 h-5" />
                    {isCompleting ? 'Completing...' : 'Complete'}
                  </>
                )}
              </motion.div>
            </Button>

            {onEdit && (
              <Button
                onClick={() => onEdit(habit.id)}
                variant="ghost"
                size="sm"
                className="btn-ghost"
              >
                Edit
              </Button>
            )}
          </div>

          {/* Completion Celebration */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-6 h-6 text-sage-500" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
