# History Calendar Enhancement - State Management

## Overview
This document describes how completion updates propagate from the History Calendar to Home and Insights screens, ensuring perfect synchronization across all views.

## Data Flow Architecture

### 1. User Action Flow
```
User taps Yesterday/Day-Before chip
    ↓
History Screen opens habit editor
    ↓
User toggles habit completion
    ↓
handleHabitToggle() called
    ↓
toggleTime() in HabitsStore
    ↓
Store updates habitDaysByKey
    ↓
EventBus.emit('habit:completion-changed')
    ↓
All screens re-render with new data
```

### 2. State Update Propagation
```
HabitsStore.toggleTime()
    ↓
Optimistic update to habitDaysByKey
    ↓
Persist to storage (setDayEntry)
    ↓
Emit 'habit:completion-changed' event
    ↓
Home Today: Recalculates today's progress
    ↓
History Calendar: Recalculates 7-day rolling history
    ↓
Insights: Recalculates weekly/monthly stats
```

## Store Integration

### Existing Functions Used
```typescript
// Already exists in HabitsStore
toggleTime: (habitId: string, time: string, date?: string) => Promise<void>
```

**Key Features:**
- Supports retroactive editing via `date` parameter
- Optimistic updates for immediate UI feedback
- Event broadcasting for cross-screen sync
- Automatic stats recomputation

### Event Broadcasting
```typescript
// In toggleTime function
EventBus.emit('habit:completion-changed', { 
  habitId, 
  date, 
  completedTimes: nextEntry.reminders.filter(r=>r.done).map(r=>r.time) 
});
```

**Event Payload:**
- `habitId`: ID of the habit that changed
- `date`: Date in YYYY-MM-DD format
- `completedTimes`: Array of completed reminder times

## Screen-Specific Updates

### 1. Home Today Screen
**Data Source:** `getTodayProgress()` function
**Update Trigger:** Store state change + EventBus event
**Recalculation:** Real-time as user toggles habits

```typescript
// In HomeToday.tsx
const completedCount = habitList.filter(h => getTodayProgress(h.id).complete).length;
const totalCount = habitList.length;
const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
```

**What Updates:**
- Progress ring percentage
- "X of Y completed" text
- Individual habit card states
- Motivational messages

### 2. History Calendar Screen
**Data Source:** `generateRollingHistory()` function
**Update Trigger:** Store state change + EventBus event
**Recalculation:** Real-time as user toggles habits

```typescript
// In History.tsx
const rollingHistory = useMemo(() => {
  return generateRollingHistory(habits, habitDaysByKey, 7);
}, [habits, habitDaysByKey]);
```

**What Updates:**
- Calendar chip colors and percentages
- Weekly overview donut ring
- List view progress bars
- Today highlighting

### 3. Insights Screen
**Data Source:** Custom calculation in `useMemo`
**Update Trigger:** Store state change + EventBus event
**Recalculation:** Real-time as user toggles habits

```typescript
// In Insights.tsx
const stats = useMemo(() => {
  // ... calculation logic
  const completedCount = scheduledHabits.filter(h => {
    const key = `habit:${h.id}:day:${id}`;
    const entry = habitDaysByKey[key];
    return entry ? entry.reminders.length > 0 && entry.reminders.every(r => r.done) : false;
  }).length;
  // ...
}, [habitsById, statsById, habitDaysByKey, timeFilter]);
```

**What Updates:**
- "This Week" completion percentage
- "This Month" completion percentage
- Completion calendar dots
- Habit leaderboard rankings
- Key metrics cards

## Completion Calculation Consistency

### Unified Logic
All screens use the same completion calculation:

```typescript
const isHabitCompleted = (dayEntry: DayEntry): boolean => {
  return dayEntry ? (dayEntry.reminders.length > 0 && dayEntry.reminders.every(r => r.done)) : false;
};
```

**Key Points:**
- Habit must have at least one reminder scheduled
- ALL reminders must be marked as done
- Consistent across Home, History, and Insights
- No mismatched numerators/denominators

### Data Structure
```typescript
interface DayEntry {
  reminders: Array<{
    time: string;
    done: boolean;
  }>;
  updatedAt: string;
}

interface HabitDef {
  id: string;
  name: string;
  emoji: string;
  reminderTimes: string[];
  frequency: 'daily' | 'weekly';
  weeklyDays?: number[];
}
```

## Event-Driven Updates

### Event Listener Setup
```typescript
// In each screen component
useEffect(() => {
  const handleCompletionChange = (event: any) => {
    // Force re-render by updating local state or dependencies
    // The useMemo hooks will automatically recalculate
  };

  EventBus.on('habit:completion-changed', handleCompletionChange);
  
  return () => {
    EventBus.off('habit:completion-changed', handleCompletionChange);
  };
}, []);
```

### Automatic Recalculation
- **Home Today**: `getTodayProgress()` recalculates on every render
- **History Calendar**: `generateRollingHistory()` recalculates when dependencies change
- **Insights**: Stats `useMemo` recalculates when `habitDaysByKey` changes

## Performance Optimizations

### Memoization Strategy
```typescript
// History Calendar
const rollingHistory = useMemo(() => {
  return generateRollingHistory(habits, habitDaysByKey, 7);
}, [habits, habitDaysByKey]);

// Insights
const stats = useMemo(() => {
  // ... expensive calculations
}, [habitsById, statsById, habitDaysByKey, timeFilter]);
```

### Optimistic Updates
```typescript
// In toggleTime function
// 1. Update store immediately (optimistic)
set({ habitDaysByKey: { ...state.habitDaysByKey, [dayKey(habit.id, d)]: nextEntry } });

// 2. Persist to storage (async)
await setDayEntry(nextEntry);

// 3. Emit event for other screens
EventBus.emit('habit:completion-changed', { ... });
```

## Error Handling

### Network Failures
```typescript
try {
  await setDayEntry(nextEntry);
} catch (error) {
  // Revert optimistic update
  set({ habitDaysByKey: state.habitDaysByKey });
  // Show error message to user
  showError('Failed to save changes. Please try again.');
}
```

### State Corruption
```typescript
// Validate data before updating
const isValidEntry = (entry: DayEntry): boolean => {
  return entry && 
         Array.isArray(entry.reminders) && 
         entry.reminders.every(r => typeof r.done === 'boolean');
};
```

## Testing State Synchronization

### Test Scenarios
1. **Basic Sync**: Toggle habit in History → Verify Home and Insights update
2. **Rapid Toggles**: Toggle same habit multiple times quickly
3. **Multiple Habits**: Toggle different habits on same date
4. **Cross-Date**: Toggle habits on different dates
5. **Edge Cases**: Toggle when no habits, all habits complete, etc.

### Verification Points
- **Home Today**: Progress ring, completion text, habit cards
- **History Calendar**: Chip colors, percentages, weekly overview
- **Insights**: Completion rates, calendar dots, leaderboard

### Debug Tools
```typescript
// Add to development builds
if (process.env.NODE_ENV === 'development') {
  EventBus.on('habit:completion-changed', (event) => {
    console.log('Completion changed:', event);
  });
}
```

## Future Enhancements

### Real-time Sync
- WebSocket connection for multi-device sync
- Conflict resolution for simultaneous edits
- Offline queue for pending changes

### Advanced Analytics
- Completion trend analysis
- Habit correlation insights
- Predictive completion modeling

### Bulk Operations
- "Mark all as complete" for a date
- Bulk habit editing across dates
- Import/export completion data

## Implementation Checklist

### Core Functionality
- [x] Editable date detection (Yesterday, Day Before Yesterday)
- [x] Visual locked states for non-editable dates
- [x] Habit editor bottom sheet
- [x] Toggle functionality with store integration
- [x] Event broadcasting for cross-screen sync

### State Management
- [x] Optimistic updates for immediate feedback
- [x] Event-driven re-rendering
- [x] Consistent completion calculation
- [x] Error handling and recovery
- [x] Performance optimizations

### Testing
- [ ] Unit tests for completion calculation
- [ ] Integration tests for state sync
- [ ] E2E tests for user workflows
- [ ] Performance tests for large datasets
- [ ] Accessibility tests for all interactions

### Documentation
- [x] Technical implementation docs
- [x] Visual mockups and interaction flows
- [x] State management documentation
- [x] QA checklist and test scenarios
- [ ] API documentation for future developers
