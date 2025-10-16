# History Screen Visual Mockup

## Mobile Layout (375px width)

```
┌─────────────────────────────────────┐
│ ← History                    [FAB] │ ← App Bar
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📈 Weekly Overview              │ │ ← Card Header
│ │                                 │ │
│ │ ╭─────╮  Perfect Days  Total   │ │
│ │ │ 85% │     3          5       │ │ ← Progress Ring + Stats
│ │ ╰─────╯                         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 Calendar View  📋 List View  │ │ ← Tabs
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │  M   T   W   T   F   S   S      │ │
│ │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐    │ │
│ │ │15│ │16│ │17│ │18│ │19│ │20│ │21│ │ ← Calendar Chips
│ │ │85%│ │0%│ │100│ │60%│ │100│ │0%│ │100│ │
│ │ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘    │ │
│ │                                 │ │
│ │ Today  Perfect  Partial  None   │ │ ← Legend
│ │  ●      ●        ●        ●     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## List View Layout

```
┌─────────────────────────────────────┐
│ ← History                    [FAB] │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📈 Weekly Overview              │ │
│ │ ╭─────╮  Perfect Days  Total   │ │
│ │ │ 85% │     3          5       │ │
│ │ ╰─────╯                         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📅 Calendar View  📋 List View  │ │
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 📅 Today          TODAY 85% │ │ │ ← Today Card (Highlighted)
│ │ │ 3 of 5 habits completed     │ │ │
│ │ │ ████████████░░░░ 85%        │ │ │ ← Progress Bar
│ │ │ 🏃‍♂️ Exercise  ✅ Completed  │ │ │
│ │ │ 📚 Reading  ❌ Pending      │ │ │ ← Habit Pills
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 📅 Yesterday        100%    │ │ │ ← Regular Card
│ │ │ 5 of 5 habits completed     │ │ │
│ │ │ ████████████████ 100%       │ │ │
│ │ │ 🏃‍♂️ Exercise  ✅ Completed  │ │ │
│ │ │ 📚 Reading  ✅ Completed    │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Color Coding Legend

### Calendar Chips
```
┌─────────────────────────────────────┐
│ Today (Ring + Glow)                 │
│ ┌─┐ ← Primary color, ring effect    │
│ │21│                                 │
│ │85%│                                │
│ └─┘                                 │
├─────────────────────────────────────┤
│ Perfect Day (100%)                  │
│ ┌─┐ ← Green background              │
│ │20│                                 │
│ │100│                                │
│ └─┘                                 │
├─────────────────────────────────────┤
│ Partial (1-99%)                     │
│ ┌─┐ ← Orange background             │
│ │19│                                 │
│ │60%│                                │
│ └─┘                                 │
├─────────────────────────────────────┤
│ No Activity (0%)                    │
│ ┌─┐ ← Muted background              │
│ │18│                                 │
│ │0%│                                 │
│ └─┘                                 │
└─────────────────────────────────────┘
```

### Progress Bars
```
┌─────────────────────────────────────┐
│ Perfect Day (100%)                  │
│ ████████████████████ 100%          │ ← Green gradient
├─────────────────────────────────────┤
│ Partial (60%)                       │
│ ████████████░░░░░░░░ 60%           │ ← Orange gradient
├─────────────────────────────────────┤
│ No Activity (0%)                    │
│ ░░░░░░░░░░░░░░░░░░░░ 0%            │ ← Muted color
└─────────────────────────────────────┘
```

## Today Highlighting States

### Zero Habits
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ 📅 Today          TODAY 0%     │ │ ← Primary ring, muted content
│ │ 0 of 0 habits completed         │ │
│ │ ░░░░░░░░░░░░░░░░░░░░ 0%        │ │
│ │ No habits scheduled today       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Partial Completion
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ 📅 Today          TODAY 60%    │ │ ← Primary ring, active content
│ │ 3 of 5 habits completed         │ │
│ │ ████████████░░░░░░░░ 60%       │ │
│ │ 🏃‍♂️ Exercise  ✅ Completed      │ │
│ │ 📚 Reading  ❌ Pending          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Full Completion
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ 📅 Today          TODAY 100%   │ │ ← Primary ring, success content
│ │ 5 of 5 habits completed         │ │
│ │ ████████████████████ 100%      │ │
│ │ 🏃‍♂️ Exercise  ✅ Completed      │ │
│ │ 📚 Reading  ✅ Completed        │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (375px)
- Single column layout
- Full-width cards
- Stacked progress ring and stats

### Tablet (768px)
- Maintain single column for readability
- Slightly larger progress ring
- More spacing between elements

### Desktop (1024px+)
- Optional: Two-column layout for calendar and list
- Larger progress ring
- Enhanced hover effects

## Animation Timeline

### Progress Ring (500ms)
```
0ms    → 100ms  → 200ms  → 300ms  → 400ms  → 500ms
Start  → 20%    → 40%    → 60%    → 80%    → 100%
```

### Progress Bar (500ms)
```
0ms    → 100ms  → 200ms  → 300ms  → 400ms  → 500ms
0%     → 20%    → 40%    → 60%    → 80%    → 100%
```

### Hover Effects (200ms)
```
0ms    → 100ms  → 200ms
Normal → Scale  → 105%
```

## Accessibility Features

### Screen Reader Support
- All interactive elements have ARIA labels
- Progress bars announce current values
- Color information is supplemented with text

### Keyboard Navigation
- Tab order follows logical flow
- Focus indicators are clearly visible
- All interactions work without mouse

### High Contrast Mode
- All colors meet WCAG AA standards
- Text remains readable in high contrast
- Icons and graphics maintain clarity
