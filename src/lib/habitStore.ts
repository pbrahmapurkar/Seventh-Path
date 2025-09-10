import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  frequency: 'daily' | 'weekly';
  reminderEnabled?: boolean;
  reminderTime?: string; // legacy single time
  reminderTimes?: string[]; // multiple times per day
  createdAt: Date;
  completions: Date[];
}

interface HabitStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => string;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  clearAllHabits: () => void;
  toggleHabitCompletion: (id: string, date?: Date) => void;
  isHabitCompletedToday: (id: string) => boolean;
  getHabitStreak: (id: string) => number;
  getCompletionPercentage: (id: string, days: number) => number;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
  habits: [],

  addHabit: (habitData) => {
    const newHabit: Habit = {
      ...habitData,
      reminderEnabled: habitData.reminderEnabled ?? Boolean(habitData.reminderTime),
      id: (globalThis.crypto && 'randomUUID' in globalThis.crypto)
        ? (globalThis.crypto as Crypto).randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date(),
      completions: [],
    };
    set((state) => ({
      habits: [...state.habits, newHabit],
    }));
    return newHabit.id;
  },

  updateHabit: (id, updates) => {
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === id ? { ...habit, ...updates } : habit
      ),
    }));
  },

  deleteHabit: (id) => {
    set((state) => ({
      habits: state.habits.filter((habit) => habit.id !== id),
    }));
  },

  clearAllHabits: () => {
    set(() => ({ habits: [] }));
  },

  toggleHabitCompletion: (id, date = new Date()) => {
    set((state) => {
      const habit = state.habits.find((h) => h.id === id);
      if (!habit) return state;

      const dateStr = date.toDateString();
      const existingCompletion = habit.completions.find(
        (completion) => {
          try {
            const completionDate = completion instanceof Date ? completion : new Date(completion);
            return completionDate.toDateString() === dateStr;
          } catch {
            return false;
          }
        }
      );

      let newCompletions: Date[];
      if (existingCompletion) {
        // Remove completion
        newCompletions = habit.completions.filter(
          (completion) => {
            try {
              const completionDate = completion instanceof Date ? completion : new Date(completion);
              return completionDate.toDateString() !== dateStr;
            } catch {
              return true; // Keep invalid dates
            }
          }
        );
      } else {
        // Add completion
        newCompletions = [...habit.completions, date];
      }

      return {
        habits: state.habits.map((h) =>
          h.id === id ? { ...h, completions: newCompletions } : h
        ),
      };
    });
  },

  isHabitCompletedToday: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return false;
    
    const today = new Date().toDateString();
    return habit.completions.some(
      (completion) => {
        try {
          const completionDate = completion instanceof Date ? completion : new Date(completion);
          return completionDate.toDateString() === today;
        } catch {
          return false;
        }
      }
    );
  },

  getHabitStreak: (id) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return 0;

    const sortedCompletions = habit.completions
      .map((date) => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sortedCompletions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i]);
      completionDate.setHours(0, 0, 0, 0);

      if (i === 0) {
        // First completion
        const daysDiff = Math.floor(
          (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff > 1) break; // Streak broken
        if (daysDiff === 0 || daysDiff === 1) {
          streak = 1;
          currentDate = new Date(completionDate.getTime() - 24 * 60 * 60 * 1000);
        }
      } else {
        const expectedDate = currentDate;
        if (completionDate.getTime() === expectedDate.getTime()) {
          streak++;
          currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
        } else {
          break; // Streak broken
        }
      }
    }

    return streak;
  },

  getCompletionPercentage: (id, days) => {
    const habit = get().habits.find((h) => h.id === id);
    if (!habit) return 0;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    
    const completionsInRange = habit.completions.filter((completion) => {
      const compDate = new Date(completion);
      return compDate >= startDate && compDate <= endDate;
    });

    return Math.round((completionsInRange.length / days) * 100);
  },
    }),
    {
      name: 'habit-store',
      partialize: (state) => ({ habits: state.habits }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          // Ensure dates are restored as Date objects
          const hydrated = state.habits.map((h) => ({
            ...h,
            createdAt: new Date(h.createdAt),
            completions: h.completions.map((d) => new Date(d as any)),
          }));
          // Replace state with hydrated dates
          // Using set here is safe inside onRehydrateStorage
          set({ habits: hydrated as any });
        } catch {
          // ignore hydration errors
        }
      },
    }
  )
);

export const starterHabits = [
  { title: 'Drink Water', emoji: '💧' },
  { title: 'Morning Walk', emoji: '🚶' },
  { title: 'Read 20 mins', emoji: '📚' },
  { title: 'Meditate', emoji: '🧘' },
  { title: 'Exercise', emoji: '💪' },
  { title: 'Write Journal', emoji: '📝' },
  { title: 'Healthy Meal', emoji: '🥗' },
  { title: 'Call Family', emoji: '📞' },
];
