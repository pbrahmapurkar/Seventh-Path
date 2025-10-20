/**
 * Mindful Notifications Component
 * Provides gentle, encouraging notifications that whisper rather than shout
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Heart, 
  Sparkles, 
  Sunrise, 
  Moon, 
  Wind, 
  Leaf,
  X,
  CheckCircle2,
  Clock,
  Star
} from 'lucide-react';

interface MindfulNotification {
  id: string;
  type: 'encouragement' | 'reminder' | 'celebration' | 'reflection' | 'wisdom';
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const notificationTemplates = {
  encouragement: [
    {
      title: "Gentle Reminder",
      message: "You're doing beautifully. Take a moment to breathe.",
      icon: <Wind className="w-5 h-5" />,
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "You've Got This",
      message: "Every small step counts. Trust your journey.",
      icon: <Heart className="w-5 h-5" />,
      color: "from-pink-400 to-pink-600"
    },
    {
      title: "Peaceful Moment",
      message: "In this stillness, you find your strength.",
      icon: <Leaf className="w-5 h-5" />,
      color: "from-green-400 to-green-600"
    }
  ],
  reminder: [
    {
      title: "Gentle Nudge",
      message: "Your habit is calling softly. Ready when you are.",
      icon: <Bell className="w-5 h-5" />,
      color: "from-purple-400 to-purple-600"
    },
    {
      title: "Mindful Moment",
      message: "Time for your practice. No pressure, just presence.",
      icon: <Clock className="w-5 h-5" />,
      color: "from-indigo-400 to-indigo-600"
    }
  ],
  celebration: [
    {
      title: "Beautiful Progress",
      message: "Look how far you've come. This is worth celebrating.",
      icon: <Sparkles className="w-5 h-5" />,
      color: "from-yellow-400 to-yellow-600"
    },
    {
      title: "Well Done",
      message: "You showed up for yourself today. That's everything.",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "from-emerald-400 to-emerald-600"
    }
  ],
  reflection: [
    {
      title: "Time to Reflect",
      message: "How are you feeling? Your journal awaits your thoughts.",
      icon: <Sunrise className="w-5 h-5" />,
      color: "from-orange-400 to-orange-600"
    },
    {
      title: "Evening Gratitude",
      message: "What brought light to your day? Take a moment to appreciate.",
      icon: <Moon className="w-5 h-5" />,
      color: "from-violet-400 to-violet-600"
    }
  ],
  wisdom: [
    {
      title: "Gentle Wisdom",
      message: "Progress is not always visible, but it's always happening.",
      icon: <Star className="w-5 h-5" />,
      color: "from-amber-400 to-amber-600"
    },
    {
      title: "Mindful Truth",
      message: "You are exactly where you need to be in this moment.",
      icon: <Heart className="w-5 h-5" />,
      color: "from-rose-400 to-rose-600"
    }
  ]
};

interface MindfulNotificationsProps {
  notifications: MindfulNotification[];
  onRemove: (id: string) => void;
  onAction?: (notification: MindfulNotification) => void;
}

export function MindfulNotifications({ 
  notifications, 
  onRemove, 
  onAction 
}: MindfulNotificationsProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.4, 0.0, 0.2, 1],
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="bg-white/95 dark:bg-sage-900/95 backdrop-blur-xl border border-sage-200 dark:border-sage-700 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${notification.color} p-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="text-white/90">
                    {notification.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(notification.id)}
                  className="text-white/60 hover:text-white/90 transition-colors duration-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {notification.action && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <button
                    onClick={() => {
                      notification.action?.onClick();
                      onAction?.(notification);
                    }}
                    className="text-white/90 hover:text-white text-sm font-medium transition-colors duration-200"
                  >
                    {notification.action.label}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing mindful notifications
export function useMindfulNotifications() {
  const [notifications, setNotifications] = useState<MindfulNotification[]>([]);

  const addNotification = (notification: Omit<MindfulNotification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
    
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showEncouragement = () => {
    const template = notificationTemplates.encouragement[
      Math.floor(Math.random() * notificationTemplates.encouragement.length)
    ];
    return addNotification({
      type: 'encouragement',
      ...template
    });
  };

  const showReminder = (habitName: string) => {
    const template = notificationTemplates.reminder[
      Math.floor(Math.random() * notificationTemplates.reminder.length)
    ];
    return addNotification({
      type: 'reminder',
      title: template.title,
      message: `${template.message} (${habitName})`,
      icon: template.icon,
      color: template.color
    });
  };

  const showCelebration = (achievement: string) => {
    const template = notificationTemplates.celebration[
      Math.floor(Math.random() * notificationTemplates.celebration.length)
    ];
    return addNotification({
      type: 'celebration',
      title: template.title,
      message: `${template.message} ${achievement}`,
      icon: template.icon,
      color: template.color,
      duration: 7000 // Longer for celebrations
    });
  };

  const showReflectionPrompt = () => {
    const template = notificationTemplates.reflection[
      Math.floor(Math.random() * notificationTemplates.reflection.length)
    ];
    return addNotification({
      type: 'reflection',
      ...template,
      action: {
        label: "Open Journal",
        onClick: () => {
          // This would open the reflection journal
          console.log("Opening reflection journal...");
        }
      }
    });
  };

  const showWisdom = () => {
    const template = notificationTemplates.wisdom[
      Math.floor(Math.random() * notificationTemplates.wisdom.length)
    ];
    return addNotification({
      type: 'wisdom',
      ...template,
      duration: 8000 // Longer for wisdom
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showEncouragement,
    showReminder,
    showCelebration,
    showReflectionPrompt,
    showWisdom
  };
}
