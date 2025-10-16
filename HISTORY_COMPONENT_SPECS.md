# History Screen Component Specifications

## Component Architecture

### 1. WeeklyOverviewCard
**Purpose:** Display weekly progress with visual donut ring and key statistics

#### Props
```typescript
interface WeeklyOverviewProps {
  completedDays: number;
  averageCompletion: number;
  totalHabits: number;
}
```

#### Visual Specifications
- **Container:** Card with gradient background (`from-primary/5 via-primary/3 to-transparent`)
- **Progress Ring:** 20x20 SVG with 3px stroke width
- **Animation:** 500ms ease-in-out stroke-dasharray transition
- **Glow Effect:** `drop-shadow(0 0 8px rgba(110, 168, 254, 0.3))`
- **Layout:** Flex row with ring on left, stats grid on right

#### Accessibility
- **ARIA Label:** "Weekly overview: {averageCompletion}% average completion, {completedDays} perfect days, {totalHabits} total habits"
- **Focus:** Not focusable (display only)
- **Screen Reader:** Announces all statistics clearly

---

### 2. CalendarView
**Purpose:** Display 7-day rolling calendar with color-coded completion states

#### Props
```typescript
interface CalendarViewProps {
  rollingHistory: DayHistoryEntry[];
  onDayClick?: (day: DayHistoryEntry) => void;
}
```

#### Visual Specifications
- **Grid:** 7 columns, equal width
- **Chip Size:** Aspect square with 2px border
- **Spacing:** 8px gap between chips
- **Hover Effect:** Scale to 105% with 200ms transition

#### Color States
```typescript
type CalendarChipState = 'today' | 'perfect' | 'partial' | 'none';

const chipStyles: Record<CalendarChipState, ChipStyle> = {
  today: {
    ring: 'ring-2 ring-primary/50',
    shadow: 'shadow-lg',
    scale: 'scale-105',
    bg: 'bg-primary/10',
    border: 'border-primary',
    text: 'text-primary font-semibold'
  },
  perfect: {
    bg: 'bg-green-500/20',
    border: 'border-green-500',
    text: 'text-green-700 dark:text-green-300'
  },
  partial: {
    bg: 'bg-orange-400/20',
    border: 'border-orange-400',
    text: 'text-orange-700 dark:text-orange-300'
  },
  none: {
    bg: 'bg-muted/30',
    border: 'border-muted',
    text: 'text-muted-foreground'
  }
};
```

#### Accessibility
- **ARIA Label:** `{formatHistoryDate(day.date)} - {completionRate}% complete, {day.habits.length} habits`
- **Role:** `button`
- **Tab Index:** 0
- **Keyboard:** Enter/Space to activate

---

### 3. ListView
**Purpose:** Display detailed day-by-day history with progress bars and habit details

#### Props
```typescript
interface ListViewProps {
  rollingHistory: DayHistoryEntry[];
  habits: HabitDef[];
  onHabitClick?: (habitId: string) => void;
}
```

#### Visual Specifications
- **Card Spacing:** 16px between cards
- **Today Highlighting:** Ring, gradient background, enhanced styling
- **Progress Bar:** Full width, 8px height, rounded corners
- **Animation:** 500ms ease-out width transition

#### Today Card Styling
```typescript
const todayCardStyles = {
  container: 'ring-2 ring-primary/50 shadow-lg bg-gradient-to-r from-primary/5 to-transparent border-primary/30',
  icon: 'bg-primary/20 ring-2 ring-primary/30',
  title: 'text-primary',
  badge: 'bg-primary/20 text-primary px-2 py-1 rounded-full text-xs'
};
```

#### Progress Bar Specifications
```typescript
interface ProgressBarProps {
  completionRate: number;
  className?: string;
}

const progressBarStyles = {
  container: 'w-full bg-muted/50 rounded-full h-2 overflow-hidden',
  bar: {
    perfect: 'bg-gradient-to-r from-green-500 to-green-400',
    partial: 'bg-gradient-to-r from-orange-400 to-orange-300',
    none: 'bg-muted'
  }
};
```

#### Accessibility
- **ARIA Label:** `{formatHistoryDate(day.date)} - {completionRate}% complete`
- **Progress Bar:** `role="progressbar"` with `aria-valuenow` and `aria-valuemax`
- **Habit Pills:** Individual ARIA labels for each habit

---

### 4. HabitChangeBadges
**Purpose:** Display habit additions and removals for each day

#### Props
```typescript
interface HabitChangeBadgesProps {
  changes: {
    added: HabitDef[];
    removed: HabitDef[];
  };
}
```

#### Visual Specifications
- **Added Badge:** Green background with green text
- **Removed Badge:** Red background with red text
- **Size:** Small (text-xs)
- **Spacing:** 8px gap between badges

#### Accessibility
- **ARIA Label:** `{added.length} habits added, {removed.length} habits removed`
- **Screen Reader:** Announces changes clearly

---

### 5. HabitPills
**Purpose:** Display individual habits with completion status and change indicators

#### Props
```typescript
interface HabitPillProps {
  habit: {
    id: string;
    name: string;
    emoji: string;
    completed: boolean;
  };
  isNew?: boolean;
  isRemoved?: boolean;
  onClick?: (habitId: string) => void;
}
```

#### Visual Specifications
- **Layout:** 2-column grid
- **Completed:** Green background with border
- **Pending:** Muted background
- **New:** Ring highlight effect
- **Size:** Compact with emoji, name, and status

#### Accessibility
- **ARIA Label:** `{habit.name} - {completed ? 'Completed' : 'Pending'}`
- **Role:** `button` if clickable
- **Keyboard:** Enter/Space to activate

---

## State Management

### Data Flow
```
HabitsStore → generateRollingHistory() → HistoryScreen
     ↓
DayHistoryEntry[] → CalendarView + ListView
     ↓
Individual Day Data → HabitPills + ProgressBars
```

### Completion Calculation
```typescript
// Unified across all screens
const isHabitCompleted = (dayEntry: DayEntry): boolean => {
  return dayEntry ? (dayEntry.reminders.length > 0 && dayEntry.reminders.every(r => r.done)) : false;
};

const calculateCompletionRate = (habits: HabitDef[], habitDaysByKey: Record<string, DayEntry>, date: string): number => {
  const activeHabits = getHabitsActiveOnDate(habits, date);
  const completedCount = activeHabits.filter(habit => {
    const dayKey = `habit:${habit.id}:day:${date}`;
    const dayEntry = habitDaysByKey[dayKey];
    return isHabitCompleted(dayEntry);
  }).length;
  
  return activeHabits.length > 0 ? (completedCount / activeHabits.length) * 100 : 0;
};
```

---

## Animation Specifications

### Progress Ring Animation
```css
.progress-ring {
  transition: stroke-dasharray 0.5s ease-in-out;
}

.progress-ring-path {
  stroke-dasharray: 0, 100;
  animation: progressRing 0.5s ease-in-out forwards;
}

@keyframes progressRing {
  to {
    stroke-dasharray: var(--progress), 100;
  }
}
```

### Progress Bar Animation
```css
.progress-bar {
  transition: width 0.5s ease-out;
}

.progress-bar-fill {
  width: 0%;
  animation: progressBar 0.5s ease-out forwards;
}

@keyframes progressBar {
  to {
    width: var(--progress-percentage);
  }
}
```

### Hover Effects
```css
.calendar-chip {
  transition: transform 0.2s ease-in-out;
}

.calendar-chip:hover {
  transform: scale(1.05);
}

.today-card {
  transition: all 0.2s ease-in-out;
}

.today-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
```

---

## Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  mobile: '375px',
  tablet: '768px',
  desktop: '1024px'
};
```

### Layout Adjustments
- **Mobile:** Single column, full-width cards
- **Tablet:** Maintain single column, larger spacing
- **Desktop:** Optional two-column layout, enhanced hover effects

### Typography Scale
```typescript
const typography = {
  title: 'text-lg font-semibold',
  subtitle: 'text-sm text-muted-foreground',
  percentage: 'text-lg font-bold',
  small: 'text-xs',
  chip: 'text-xs font-medium'
};
```

---

## Testing Requirements

### Unit Tests
- [ ] Completion rate calculation accuracy
- [ ] Color state determination logic
- [ ] Animation trigger conditions
- [ ] Accessibility attribute generation

### Integration Tests
- [ ] Data flow from store to components
- [ ] Tab switching functionality
- [ ] Today highlighting accuracy
- [ ] Progress bar width calculations

### Visual Tests
- [ ] Color contrast compliance
- [ ] Animation smoothness
- [ ] Responsive layout behavior
- [ ] Dark/light theme switching

### Accessibility Tests
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] ARIA label accuracy

---

## Performance Considerations

### Optimization Strategies
- **Memoization:** Use `useMemo` for expensive calculations
- **Lazy Loading:** Load habit details on demand
- **Animation:** Use CSS transforms for smooth performance
- **Debouncing:** Debounce rapid state changes

### Bundle Size
- **SVG Icons:** Inline SVGs for progress ring
- **Animations:** CSS-only animations where possible
- **Dependencies:** Minimal external dependencies

### Memory Management
- **Cleanup:** Proper cleanup of event listeners
- **State:** Efficient state updates
- **Rendering:** Minimize unnecessary re-renders
