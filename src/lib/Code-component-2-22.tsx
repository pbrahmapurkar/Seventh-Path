import { create } from 'zustand';

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  frequency: 'daily' | 'weekly';
  reminderTime?: string;
  createdAt: Date;
  completions: Date[];
}

interface HabitStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date?: Date) => void;
  isHabitCompletedToday: (id: string) => boolean;
  getHabitStreak: (id: string) => number;
  getCompletionPercentage: (id: string, days: number) => number;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [
    {
      id: '1',
      title: 'Drink Water',
      emoji: '💧',
      frequency: 'daily',
      reminderTime: '9:00',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      completions: [
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      ],
    },
    {
      id: '2',
      title: 'Morning Walk',
      emoji: '🚶',
      frequency: 'daily',
      reminderTime: '7:00',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completions: [
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      ],
    },
  ],

  addHabit: (habitData) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date(),
      completions: [],
    };
    set((state) => ({
      habits: [...state.habits, newHabit],
    }));
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

  toggleHabitCompletion: (id, date = new Date()) => {
    set((state) => {
      const habit = state.habits.find((h) => h.id === id);
      if (!habit) return state;

      const dateStr = date.toDateString();
      const existingCompletion = habit.completions.find(
        (completion) => new Date(completion as any).toDateString() === dateStr
      );

      let newCompletions: Date[];
      if (existingCompletion) {
        // Remove completion
        newCompletions = habit.completions.filter(
          (completion) => new Date(completion as any).toDateString() !== dateStr
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
      (completion) => new Date(completion as any).toDateString() === today
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
}));

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
