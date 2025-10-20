/**
 * Spiritual Navigation Component
 * A mindful navigation that integrates spiritual practices and gentle guidance
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  History, 
  BarChart3, 
  Settings, 
  Heart, 
  Wind, 
  BookOpen,
  Sparkles,
  Sun,
  Moon,
  Star
} from 'lucide-react';
import { useAppShell } from '../AppShellRouter';
import { MindfulBreathing } from './MindfulBreathing';
import { ReflectionJournal } from './ReflectionJournal';
import { useMindfulNotifications } from './MindfulNotifications';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  description: string;
  color: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Sacred Space',
    icon: <Home className="w-5 h-5" />,
    path: '/home',
    description: 'Your mindful home',
    color: 'text-sage-600'
  },
  {
    id: 'history',
    label: 'Journey',
    icon: <History className="w-5 h-5" />,
    path: '/history',
    description: 'Your progress story',
    color: 'text-blue-600'
  },
  {
    id: 'insights',
    label: 'Wisdom',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/insights',
    description: 'Growth insights',
    color: 'text-purple-600'
  },
  {
    id: 'settings',
    label: 'Sanctuary',
    icon: <Settings className="w-5 h-5" />,
    path: '/settings',
    description: 'Your sacred settings',
    color: 'text-gray-600'
  }
];

const spiritualPractices = [
  {
    id: 'breathing',
    label: 'Breathe',
    icon: <Wind className="w-5 h-5" />,
    description: 'Mindful breathing',
    color: 'text-blue-500',
    action: 'breathing'
  },
  {
    id: 'journal',
    label: 'Reflect',
    icon: <BookOpen className="w-5 h-5" />,
    description: 'Reflection journal',
    color: 'text-purple-500',
    action: 'journal'
  },
  {
    id: 'gratitude',
    label: 'Gratitude',
    icon: <Heart className="w-5 h-5" />,
    description: 'Gratitude practice',
    color: 'text-pink-500',
    action: 'gratitude'
  }
];

interface SpiritualNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function SpiritualNavigation({ currentRoute, onNavigate }: SpiritualNavigationProps) {
  const [showBreathing, setShowBreathing] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showPractices, setShowPractices] = useState(false);
  const { showReflectionPrompt, showWisdom, showEncouragement } = useMindfulNotifications();

  const handleNavigation = (path: string) => {
    onNavigate(path);
  };

  const handleSpiritualPractice = (action: string) => {
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
    }
    setShowPractices(false);
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return <Sun className="w-4 h-4 text-orange-500" />;
    } else if (hour < 17) {
      return <Sun className="w-4 h-4 text-yellow-500" />;
    } else {
      return <Moon className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <>
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

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-sage-900/95 backdrop-blur-xl border-t border-sage-200 dark:border-sage-700 z-40"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Main Navigation */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = currentRoute.startsWith(item.path);
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-sage-100 dark:bg-sage-800/50' 
                        : 'hover:bg-sage-50 dark:hover:bg-sage-800/30'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`${isActive ? item.color : 'text-sage-400 dark:text-sage-500'}`}>
                      {item.icon}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${
                      isActive 
                        ? 'text-sage-700 dark:text-sage-300' 
                        : 'text-sage-500 dark:text-sage-400'
                    }`}>
                      {item.label}
                    </span>
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-sage-500 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Spiritual Practices Button */}
            <div className="relative">
              <motion.button
                onClick={() => setShowPractices(!showPractices)}
                className="relative p-3 rounded-full bg-gradient-to-br from-sage-500 to-sage-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                
                {/* Gentle Pulse Animation */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-white/30"
                />
              </motion.button>

              {/* Practices Dropdown */}
              <AnimatePresence>
                {showPractices && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-sage-800 rounded-2xl shadow-xl border border-sage-200 dark:border-sage-700 overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="text-xs font-medium text-sage-600 dark:text-sage-400 px-3 py-2 border-b border-sage-200 dark:border-sage-700">
                        Mindful Practices
                      </div>
                      {spiritualPractices.map((practice) => (
                        <button
                          key={practice.id}
                          onClick={() => handleSpiritualPractice(practice.action)}
                          className="w-full flex items-center gap-3 px-3 py-3 hover:bg-sage-50 dark:hover:bg-sage-700/50 transition-colors duration-200 text-left"
                        >
                          <div className={practice.color}>
                            {practice.icon}
                          </div>
                          <div>
                            <div className="font-medium text-sage-900 dark:text-sage-100 text-sm">
                              {practice.label}
                            </div>
                            <div className="text-xs text-sage-600 dark:text-sage-400">
                              {practice.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Spiritual Guidance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed top-4 left-4 z-30"
      >
        <motion.button
          onClick={() => {
            const practices = [showReflectionPrompt, showWisdom, showEncouragement];
            practices[Math.floor(Math.random() * practices.length)]();
          }}
          className="p-3 rounded-full bg-gradient-to-br from-mist/20 to-sage/20 backdrop-blur-sm border border-sage/30 text-sage-600 dark:text-sage-400 shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Star className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </>
  );
}
