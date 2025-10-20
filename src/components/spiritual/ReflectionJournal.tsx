/**
 * Reflection Journal Component
 * Provides a space for daily reflection and spiritual growth
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Heart, 
  Lightbulb, 
  Star, 
  Calendar, 
  PenTool, 
  Save,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  gratitude: string[];
  reflection: string;
  intention: string;
  mood: 'peaceful' | 'grateful' | 'hopeful' | 'content' | 'inspired';
  isPrivate: boolean;
  createdAt: number;
}

const moodOptions = [
  { value: 'peaceful', label: 'Peaceful', color: 'text-blue-500', icon: '🕊️' },
  { value: 'grateful', label: 'Grateful', color: 'text-green-500', icon: '🙏' },
  { value: 'hopeful', label: 'Hopeful', color: 'text-yellow-500', icon: '✨' },
  { value: 'content', label: 'Content', color: 'text-purple-500', icon: '😌' },
  { value: 'inspired', label: 'Inspired', color: 'text-orange-500', icon: '💫' },
];

const reflectionPrompts = [
  "What brought you joy today?",
  "What challenge did you grow from?",
  "How did you show kindness to yourself?",
  "What are you grateful for in this moment?",
  "What intention will you carry into tomorrow?",
  "How did you honor your values today?",
  "What did you learn about yourself?",
  "What would you like to let go of?",
];

interface ReflectionJournalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReflectionJournal({ isOpen, onClose }: ReflectionJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString().split('T')[0],
    gratitude: [''],
    reflection: '',
    intention: '',
    mood: 'peaceful',
    isPrivate: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showPrivate, setShowPrivate] = useState(false);

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('reflection-journal');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('Error loading journal entries:', error);
      }
    }
  }, []);

  // Save entries to localStorage
  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('reflection-journal', JSON.stringify(newEntries));
  };

  const handleSave = () => {
    if (!currentEntry.reflection?.trim() || !currentEntry.intention?.trim()) {
      return;
    }

    const newEntry: JournalEntry = {
      id: currentEntry.id || Date.now().toString(),
      date: currentEntry.date || new Date().toISOString().split('T')[0],
      gratitude: currentEntry.gratitude?.filter(g => g.trim()) || [],
      reflection: currentEntry.reflection,
      intention: currentEntry.intention,
      mood: currentEntry.mood || 'peaceful',
      isPrivate: currentEntry.isPrivate || false,
      createdAt: currentEntry.createdAt || Date.now(),
    };

    const existingIndex = entries.findIndex(entry => entry.id === newEntry.id);
    let newEntries;
    
    if (existingIndex >= 0) {
      newEntries = [...entries];
      newEntries[existingIndex] = newEntry;
    } else {
      newEntries = [...entries, newEntry];
    }

    saveEntries(newEntries);
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      gratitude: [''],
      reflection: '',
      intention: '',
      mood: 'peaceful',
      isPrivate: false,
    });
    setIsEditing(false);
  };

  const handleEdit = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleDelete = (entryId: string) => {
    const newEntries = entries.filter(entry => entry.id !== entryId);
    saveEntries(newEntries);
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
    }
  };

  const addGratitudeItem = () => {
    setCurrentEntry(prev => ({
      ...prev,
      gratitude: [...(prev.gratitude || []), '']
    }));
  };

  const updateGratitudeItem = (index: number, value: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      gratitude: prev.gratitude?.map((item, i) => i === index ? value : item) || []
    }));
  };

  const removeGratitudeItem = (index: number) => {
    setCurrentEntry(prev => ({
      ...prev,
      gratitude: prev.gratitude?.filter((_, i) => i !== index) || []
    }));
  };

  const getRandomPrompt = () => {
    return reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)];
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
          className="bg-gradient-to-br from-sage/5 to-mist/10 backdrop-blur-xl border border-sage/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-sage-600" />
              <h2 className="text-2xl font-semibold text-sage-900 dark:text-sage-100">
                Reflection Journal
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrivate(!showPrivate)}
                className="btn-ghost p-2"
              >
                {showPrivate ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="btn-ghost p-2"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Entry Form */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-sage-900 dark:text-sage-100">
                {isEditing ? 'Edit Entry' : 'New Reflection'}
              </h3>

              {/* Date and Mood */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={currentEntry.date || ''}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, date: e.target.value }))}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                    Mood
                  </label>
                  <select
                    value={currentEntry.mood || 'peaceful'}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, mood: e.target.value as any }))}
                    className="input w-full"
                  >
                    {moodOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gratitude */}
              <div>
                <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                  Gratitude (3 things you're grateful for)
                </label>
                <div className="space-y-2">
                  {currentEntry.gratitude?.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateGratitudeItem(index, e.target.value)}
                        placeholder={`Gratitude ${index + 1}...`}
                        className="input flex-1"
                      />
                      {currentEntry.gratitude!.length > 1 && (
                        <button
                          onClick={() => removeGratitudeItem(index)}
                          className="btn-ghost p-2 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {currentEntry.gratitude!.length < 3 && (
                    <button
                      onClick={addGratitudeItem}
                      className="btn-ghost text-sage-600 hover:text-sage-800"
                    >
                      + Add gratitude
                    </button>
                  )}
                </div>
              </div>

              {/* Reflection */}
              <div>
                <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                  Reflection
                </label>
                <textarea
                  value={currentEntry.reflection || ''}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, reflection: e.target.value }))}
                  placeholder={getRandomPrompt()}
                  rows={4}
                  className="input w-full resize-none"
                />
              </div>

              {/* Intention */}
              <div>
                <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                  Tomorrow's Intention
                </label>
                <input
                  type="text"
                  value={currentEntry.intention || ''}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, intention: e.target.value }))}
                  placeholder="What will you focus on tomorrow?"
                  className="input w-full"
                />
              </div>

              {/* Privacy */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={currentEntry.isPrivate || false}
                  onChange={(e) => setCurrentEntry(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-sage-300"
                />
                <label htmlFor="private" className="text-sm text-sage-700 dark:text-sage-300">
                  Keep this entry private
                </label>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={!currentEntry.reflection?.trim() || !currentEntry.intention?.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isEditing ? 'Update Entry' : 'Save Reflection'}
              </button>
            </div>

            {/* Entries List */}
            <div className="space-y-4 overflow-y-auto">
              <h3 className="text-lg font-medium text-sage-900 dark:text-sage-100">
                Past Reflections
              </h3>
              
              {entries
                .filter(entry => showPrivate || !entry.isPrivate)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry) => {
                  const mood = moodOptions.find(m => m.value === entry.mood);
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/50 dark:bg-sage-900/20 rounded-xl p-4 border border-sage-200 dark:border-sage-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-sage-500" />
                          <span className="text-sm text-sage-600 dark:text-sage-400">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          {mood && (
                            <span className="text-lg">
                              {mood.icon}
                            </span>
                          )}
                          {entry.isPrivate && (
                            <EyeOff className="w-4 h-4 text-sage-500" />
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="btn-ghost p-1 text-sage-600"
                          >
                            <PenTool className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="btn-ghost p-1 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {entry.gratitude.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-sage-700 dark:text-sage-300 mb-1">
                              Gratitude:
                            </h4>
                            <ul className="text-sm text-sage-600 dark:text-sage-400 space-y-1">
                              {entry.gratitude.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Star className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-sm font-medium text-sage-700 dark:text-sage-300 mb-1">
                            Reflection:
                          </h4>
                          <p className="text-sm text-sage-600 dark:text-sage-400">
                            {entry.reflection}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-sage-700 dark:text-sage-300 mb-1">
                            Intention:
                          </h4>
                          <p className="text-sm text-sage-600 dark:text-sage-400">
                            {entry.intention}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              
              {entries.length === 0 && (
                <div className="text-center py-8 text-sage-500 dark:text-sage-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reflections yet. Start your journey of self-discovery.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
