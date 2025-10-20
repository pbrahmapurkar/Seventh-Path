/**
 * Spiritual Home Screen
 * A mindful, peaceful home that whispers encouragement and supports spiritual growth
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Sparkles, 
  Wind, 
  Sunrise, 
  Sun,
  Moon, 
  BookOpen, 
  Play,
  Quote,
  TreePine,
  Lightbulb,
  Star,
  Calendar,
  Target,
  Flame
} from 'lucide-react';
import { useAppShell } from '../components/AppShellRouter';
import { useHabitsStore } from '../store/HabitsStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { SpiritualGuidance } from '../components/spiritual/SpiritualGuidance';
import { MindfulBreathing } from '../components/spiritual/MindfulBreathing';
import { ReflectionJournal } from '../components/spiritual/ReflectionJournal';
import { MindfulNotifications, useMindfulNotifications } from '../components/spiritual/MindfulNotifications';

const dailyWisdom = [
  {
    text: "Every moment is a fresh beginning",
    author: "T.S. Eliot",
    category: "mindfulness"
  },
  {
    text: "The present moment is the only time over which we have dominion",
    author: "Thích Nhất Hạnh",
    category: "presence"
  },
  {
    text: "Progress, not perfection",
    author: "Unknown",
    category: "growth"
  },
  {
    text: "You are not a drop in the ocean, you are the entire ocean in a drop",
    author: "Rumi",
    category: "wisdom"
  },
  {
    text: "The journey of a thousand miles begins with one step",
    author: "Lao Tzu",
    category: "patience"
  }
];

const mindfulActions = [
  {
    id: 'breathing',
    title: 'Mindful Breathing',
    description: 'Find your center through conscious breath',
    icon: <Wind className="w-6 h-6" />,
    color: 'from-blue-400 to-blue-600',
    action: 'breathing'
  },
  {
    id: 'journal',
    title: 'Reflection Journal',
    description: 'Explore your inner landscape',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-purple-400 to-purple-600',
    action: 'journal'
  },
  {
    id: 'gratitude',
    title: 'Gratitude Practice',
    description: 'Cultivate appreciation for today',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-pink-400 to-pink-600',
    action: 'gratitude'
  },
  {
    id: 'meditation',
    title: 'Meditation',
    description: 'Sit in peaceful awareness',
    icon: <TreePine className="w-6 h-6" />,
    color: 'from-green-400 to-green-600',
    action: 'meditation'
  }
];

export function SpiritualHome() {
  const { navigate } = useAppShell();
  const { habits = [], getCompletionForDateMemoized } = useHabitsStore();
  const [currentWisdom, setCurrentWisdom] = useState(dailyWisdom[0]);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');

  const {
    notifications,
    removeNotification,
    showEncouragement,
    showCelebration,
    showReflectionPrompt,
    showWisdom
  } = useMindfulNotifications();

  // Set time-based greeting and wisdom
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('morning');
      setGreeting('Good morning');
    } else if (hour < 17) {
      setTimeOfDay('afternoon');
      setGreeting('Good afternoon');
    } else {
      setTimeOfDay('evening');
      setGreeting('Good evening');
    }

    // Set random wisdom
    setCurrentWisdom(dailyWisdom[Math.floor(Math.random() * dailyWisdom.length)]);
  }, []);

  // Load user name
  useEffect(() => {
    const name = localStorage.getItem('user-name') || '';
    setUserName(name);
  }, []);

  // Show encouraging notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 30 seconds
        showEncouragement();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [showEncouragement]);

  const todayHabits = habits.filter(habit => {
    if (!getCompletionForDateMemoized) return false;
    const today = new Date().toISOString().split('T')[0];
    return getCompletionForDateMemoized(habit.id, today) !== null;
  });

  const completedToday = todayHabits.filter(habit => {
    if (!getCompletionForDateMemoized) return false;
    const today = new Date().toISOString().split('T')[0];
    return getCompletionForDateMemoized(habit.id, today) === true;
  }).length;

  const handleMindfulAction = (action: string) => {
    switch (action) {
      case 'breathing':
        setShowBreathing(true);
        break;
      case 'journal':
        setShowJournal(true);
        break;
      case 'gratitude':
        showReflectionPrompt();
        break;
      case 'meditation':
        showWisdom();
        break;
    }
  };

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning': return <Sunrise className="w-6 h-6 text-orange-500" />;
      case 'afternoon': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'evening': return <Moon className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/5 via-mist/10 to-sage/5">
      {/* Notifications */}
      <MindfulNotifications
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Breathing Modal */}
      <MindfulBreathing
        isOpen={showBreathing}
        onClose={() => setShowBreathing(false)}
      />

      {/* Journal Modal */}
      <ReflectionJournal
        isOpen={showJournal}
        onClose={() => setShowJournal(false)}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            {getTimeIcon()}
            <h1 className="text-3xl font-light text-sage-900 dark:text-sage-100">
              {greeting}{userName ? `, ${userName}` : ''}
            </h1>
          </div>
          
          <p className="text-lg text-sage-600 dark:text-sage-400 max-w-2xl mx-auto">
            Welcome to your sacred space of growth and reflection. 
            Take a moment to breathe and center yourself.
          </p>
        </motion.div>

        {/* Daily Wisdom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-sage/10 to-mist/10 border-sage/20">
            <CardContent className="p-8 text-center">
              <Quote className="w-8 h-8 text-sage-500 mx-auto mb-4" />
              <blockquote className="text-xl font-light text-sage-900 dark:text-sage-100 mb-4 leading-relaxed">
                "{currentWisdom.text}"
              </blockquote>
              <cite className="text-sage-600 dark:text-sage-400">
                — {currentWisdom.author}
              </cite>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
          <Card className="bg-white/50 dark:bg-sage-900/20 border-sage/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sage-900 dark:text-sage-100">
                <Target className="w-5 h-5" />
                Today's Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-light text-sage-600 dark:text-sage-400 mb-2">
                    {completedToday}
                  </div>
                  <div className="text-sm text-sage-500 dark:text-sage-500">
                    Habits Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-sage-600 dark:text-sage-400 mb-2">
                    {todayHabits.length}
                  </div>
                  <div className="text-sm text-sage-500 dark:text-sage-500">
                    Total Habits
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-sage-600 dark:text-sage-400 mb-2">
                    {todayHabits.length > 0 ? Math.round((completedToday / todayHabits.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-sage-500 dark:text-sage-500">
                    Progress
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mindful Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
        >
          <h2 className="text-2xl font-light text-sage-900 dark:text-sage-100 mb-6 text-center">
            Mindful Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mindfulActions.map((action) => (
              <motion.div
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => handleMindfulAction(action.action)}
              >
                <Card className="bg-white/50 dark:bg-sage-900/20 border-sage/20 hover:border-sage/40 transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center text-white`}>
                      {action.icon}
                    </div>
                    <h3 className="font-medium text-sage-900 dark:text-sage-100 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-sage-600 dark:text-sage-400">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Spiritual Guidance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
        >
          <SpiritualGuidance 
            context="general" 
            category="growth"
            className="max-w-2xl mx-auto"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 1.0 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button
            onClick={() => navigate('/home')}
            variant="secondary"
            className="btn-secondary"
          >
            <Target className="w-4 h-4 mr-2" />
            View Habits
          </Button>
          <Button
            onClick={() => navigate('/history')}
            variant="ghost"
            className="btn-ghost"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Progress
          </Button>
          <Button
            onClick={() => navigate('/insights')}
            variant="ghost"
            className="btn-ghost"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Insights
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
