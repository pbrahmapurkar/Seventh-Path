/**
 * Mindful Breathing Component
 * Provides guided breathing exercises for moments of reflection and calm
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Wind, Heart } from 'lucide-react';

interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  pause: number;
  cycles: number;
  color: string;
}

const breathingPatterns: BreathingPattern[] = [
  {
    id: 'calm',
    name: 'Calm Breath',
    description: 'Gentle breathing for moments of stress',
    inhale: 4,
    hold: 2,
    exhale: 6,
    pause: 1,
    cycles: 4,
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'focus',
    name: 'Focus Breath',
    description: 'Energizing breath for concentration',
    inhale: 3,
    hold: 1,
    exhale: 3,
    pause: 1,
    cycles: 6,
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'sleep',
    name: 'Sleep Breath',
    description: 'Relaxing breath for better rest',
    inhale: 4,
    hold: 4,
    exhale: 8,
    pause: 2,
    cycles: 3,
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'energy',
    name: 'Energy Breath',
    description: 'Invigorating breath for vitality',
    inhale: 2,
    hold: 1,
    exhale: 2,
    pause: 1,
    cycles: 8,
    color: 'from-orange-400 to-orange-600'
  }
];

interface MindfulBreathingProps {
  isOpen: boolean;
  onClose: () => void;
  initialPattern?: string;
}

export function MindfulBreathing({ isOpen, onClose, initialPattern = 'calm' }: MindfulBreathingProps) {
  const [selectedPattern, setSelectedPattern] = useState(initialPattern);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pattern = breathingPatterns.find(p => p.id === selectedPattern) || breathingPatterns[0];

  const getPhaseDuration = (phase: string) => {
    switch (phase) {
      case 'inhale': return pattern.inhale;
      case 'hold': return pattern.hold;
      case 'exhale': return pattern.exhale;
      case 'pause': return pattern.pause;
      default: return 0;
    }
  };

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'pause': return 'Rest';
      default: return '';
    }
  };

  const getPhaseInstruction = (phase: string) => {
    switch (phase) {
      case 'inhale': return 'Slowly fill your lungs with peace';
      case 'hold': return 'Feel the calm within you';
      case 'exhale': return 'Release all tension and worry';
      case 'pause': return 'Rest in this moment of stillness';
      default: return '';
    }
  };

  const startBreathing = () => {
    setIsActive(true);
    setIsComplete(false);
    setCurrentCycle(1);
    setCurrentPhase('inhale');
    setTimeRemaining(getPhaseDuration('inhale'));
  };

  const stopBreathing = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetBreathing = () => {
    stopBreathing();
    setCurrentPhase('inhale');
    setCurrentCycle(1);
    setTimeRemaining(getPhaseDuration('inhale'));
    setIsComplete(false);
  };

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Move to next phase
          const phases = ['inhale', 'hold', 'exhale', 'pause'] as const;
          const currentIndex = phases.indexOf(currentPhase);
          const nextIndex = (currentIndex + 1) % phases.length;
          const nextPhase = phases[nextIndex];
          
          setCurrentPhase(nextPhase);
          
          // Check if we've completed a cycle
          if (nextPhase === 'inhale' && currentPhase === 'pause') {
            setCurrentCycle(prev => {
              if (prev >= pattern.cycles) {
                setIsComplete(true);
                stopBreathing();
                return prev;
              }
              return prev + 1;
            });
          }
          
          return getPhaseDuration(nextPhase);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentPhase, pattern.cycles]);

  const getCircleScale = () => {
    if (!isActive) return 1;
    
    const phaseDuration = getPhaseDuration(currentPhase);
    const progress = (phaseDuration - timeRemaining) / phaseDuration;
    
    switch (currentPhase) {
      case 'inhale':
        return 1 + (progress * 0.3); // Grow during inhale
      case 'hold':
        return 1.3; // Stay expanded
      case 'exhale':
        return 1.3 - (progress * 0.3); // Shrink during exhale
      case 'pause':
        return 1; // Rest at normal size
      default:
        return 1;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-sage/5 to-mist/10 backdrop-blur-xl border border-sage/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wind className="w-6 h-6 text-sage-600" />
              <h2 className="text-2xl font-semibold text-sage-900 dark:text-sage-100">
                Mindful Breathing
              </h2>
            </div>
            <p className="text-sage-600 dark:text-sage-400">
              Find your center through conscious breathing
            </p>
          </div>

          {/* Pattern Selection */}
          {!isActive && !isComplete && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-sage-900 dark:text-sage-100 mb-4">
                Choose Your Practice
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {breathingPatterns.map((pattern) => (
                  <button
                    key={pattern.id}
                    onClick={() => setSelectedPattern(pattern.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedPattern === pattern.id
                        ? 'border-sage-400 bg-sage-50 dark:bg-sage-900/20'
                        : 'border-sage-200 hover:border-sage-300'
                    }`}
                  >
                    <div className="text-left">
                      <h4 className="font-medium text-sage-900 dark:text-sage-100">
                        {pattern.name}
                      </h4>
                      <p className="text-sm text-sage-600 dark:text-sage-400 mt-1">
                        {pattern.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Breathing Circle */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48 mb-6">
              <motion.div
                animate={{ scale: getCircleScale() }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`w-full h-full rounded-full bg-gradient-to-br ${pattern.color} opacity-20`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-light text-sage-900 dark:text-sage-100 mb-2">
                    {timeRemaining}
                  </div>
                  <div className="text-lg font-medium text-sage-700 dark:text-sage-300">
                    {getPhaseText(currentPhase)}
                  </div>
                </div>
              </div>
            </div>

            {isActive && (
              <div className="text-center">
                <p className="text-sage-600 dark:text-sage-400 mb-2">
                  {getPhaseInstruction(currentPhase)}
                </p>
                <div className="text-sm text-sage-500 dark:text-sage-500">
                  Cycle {currentCycle} of {pattern.cycles}
                </div>
              </div>
            )}

            {isComplete && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <Heart className="w-12 h-12 text-sage-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-sage-900 dark:text-sage-100 mb-2">
                  Well Done
                </h3>
                <p className="text-sage-600 dark:text-sage-400">
                  You've completed your breathing practice
                </p>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isActive && !isComplete && (
              <button
                onClick={startBreathing}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                <Play className="w-5 h-5" />
                Begin Practice
              </button>
            )}

            {isActive && (
              <button
                onClick={stopBreathing}
                className="btn-secondary flex items-center gap-2 px-6 py-3"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
            )}

            {(isActive || isComplete) && (
              <button
                onClick={resetBreathing}
                className="btn-ghost flex items-center gap-2 px-6 py-3"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            )}

            <button
              onClick={onClose}
              className="btn-ghost px-6 py-3"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
