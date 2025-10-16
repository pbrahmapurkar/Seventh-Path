# History Calendar Enhancement - Visual Mockups

## Mobile Layout (375px width)

### 1. Calendar View - Default State
```
┌─────────────────────────────────────┐
│ ← History                    [FAB] │ ← App Bar
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
│ │ 📅 Calendar View  📋 List View  │ │ ← Tabs
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │  M   T   W   T   F   S   S      │ │
│ │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐    │ │
│ │ │15│ │16│ │17│ │18│ │19│ │20│ │21│ │ ← Calendar Chips
│ │ │85%│ │0%│ │100│ │60%│ │100│ │0%│ │100│ │
│ │ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘    │ │
│ │  🔒   🔒   🔒   ✏️   ✏️   🔒   🔒 │ │ ← Icons
│ │                                 │ │
│ │ Today  Perfect  Partial  None   │ │ ← Legend
│ │  ●      ●        ●        ●     │ │
│ │                                 │ │
│ │ 🔒 Locked                       │ │
│ │                                 │ │
│ │ ✏️ You can only update the      │ │ ← Helper Text
│ │    last 2 days. Tap Yesterday   │ │
│ │    or Day Before Yesterday to   │ │
│ │    edit habits.                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Calendar View - Hover States
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
│ │  M   T   W   T   F   S   S      │ │
│ │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐    │ │
│ │ │15│ │16│ │17│ │18│ │19│ │20│ │21│ │
│ │ │85%│ │0%│ │100│ │60%│ │100│ │0%│ │100│ │
│ │ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘    │ │
│ │  🔒   🔒   🔒   ✏️   ✏️   🔒   🔒 │ │
│ │                                 │ │
│ │     ↑ Hover on Yesterday        │ │ ← Hover State
│ │     (Scale 105%, Cursor pointer)│ │
│ │                                 │ │
│ │ Today  Perfect  Partial  None   │ │
│ │  ●      ●        ●        ●     │ │
│ │                                 │ │
│ │ 🔒 Locked                       │ │
│ │                                 │ │
│ │ ✏️ You can only update the      │ │
│ │    last 2 days. Tap Yesterday   │ │
│ │    or Day Before Yesterday to   │ │
│ │    edit habits.                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 3. Habit Editor Bottom Sheet - Open
```
┌─────────────────────────────────────┐
│                                     │ ← Backdrop (50% black)
│ ┌─────────────────────────────────┐ │
│ │ Edit Yesterday              ✕   │ │ ← Header
│ │ Mark habits as completed for    │ │
│ │ this day                        │ │
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 🏃‍♂️ Exercise              │ │ │ ← Habit Item
│ │ │ 2 reminders        [✓] ON   │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 📚 Reading                  │ │ │
│ │ │ Single reminder    [ ] OFF  │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 💧 Water                    │ │ │
│ │ │ 3 reminders        [✓] ON   │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 🧘‍♀️ Meditation             │ │ │
│ │ │ Single reminder    [ ] OFF  │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ 🍎 Healthy Snack            │ │ │
│ │ │ Single reminder    [✓] ON   │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ ├─────────────────────────────────┤ │
│ │            [Done]               │ │ ← Action Button
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 4. Habit Editor - Empty State
```
┌─────────────────────────────────────┐
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Edit Day Before Yesterday   ✕   │ │
│ │ Mark habits as completed for    │ │
│ │ this day                        │ │
│ ├─────────────────────────────────┤ │
│ │                                 │ │
│ │                                 │ │
│ │            📅                   │ │ ← Empty State Icon
│ │                                 │ │
│ │      No habits scheduled        │ │
│ │         for this day            │ │
│ │                                 │ │
│ │                                 │ │
│ │                                 │ │
│ ├─────────────────────────────────┤ │
│ │            [Done]               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Interaction States

### 1. Locked Date Chip
```
┌─────────┐
│ 15  🔒  │ ← Locked icon
│  85%    │ ← Muted text
└─────────┘
   ↓
- Cursor: not-allowed
- Opacity: 60%
- No hover effects
- tabIndex: -1
- aria-disabled: true
```

### 2. Editable Date Chip
```
┌─────────┐
│ 19  ✏️  │ ← Edit icon
│  60%    │ ← Normal text
└─────────┘
   ↓
- Cursor: pointer
- Hover: scale(105%)
- tabIndex: 0
- Clickable
```

### 3. Today Date Chip
```
┌─────────┐
│ 21  🔒  │ ← No edit icon (Today)
│ 100%    │ ← Primary color
└─────────┘
   ↓
- Ring glow effect
- Primary colors
- Not editable
- View only
```

## Color Coding Legend

### Completion States
```
┌─────────────────────────────────────┐
│ Today  Perfect  Partial  None  Lock │
│  ●      ●        ●        ●     ●   │
│                                     │
│ 🟢 Perfect Day (100%)              │
│    Green background, green border   │
│                                     │
│ 🟠 Partial (1-99%)                 │
│    Orange background, orange border │
│                                     │
│ ⚪ No Activity (0%)                │
│    Muted background, muted border   │
│                                     │
│ 🔒 Locked                          │
│    60% opacity, muted colors        │
└─────────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (375px)
- Single column calendar
- Full-width bottom sheet
- Touch-optimized tap targets
- Swipe gestures for closing

### Tablet (768px)
- Larger calendar chips
- Wider bottom sheet
- More spacing between elements
- Enhanced hover effects

### Desktop (1024px+)
- Optional: Side-by-side calendar and list
- Larger bottom sheet
- Enhanced keyboard navigation
- Mouse hover states

## Animation Timeline

### Bottom Sheet Opening
```
0ms    → 200ms  → 400ms
Closed → Slide  → Open
       → Up     →
```

### Habit Toggle
```
0ms    → 100ms  → 200ms
Off    → Toggle → On
       → State  →
```

### Calendar Chip Hover
```
0ms    → 100ms  → 200ms
Normal → Scale  → 105%
       → Up     →
```

## Accessibility Indicators

### Focus States
```
┌─────────────────────────────────────┐
│ Focused Editable Chip:              │
│ ┌─────────┐                         │
│ │ 19  ✏️  │ ← Focus ring            │
│ │  60%    │                         │
│ └─────────┘                         │
│                                     │
│ Focused Habit Toggle:               │
│ ┌─────────────────────────────┐     │
│ │ 🏃‍♂️ Exercise              │     │
│ │ 2 reminders    [✓] ON ←──   │     │ ← Focus indicator
│ └─────────────────────────────┘     │
└─────────────────────────────────────┘
```

### Screen Reader Announcements
- **Editable chip**: "Yesterday - 60% complete, 3 habits, editable"
- **Locked chip**: "Monday - 85% complete, locked"
- **Habit toggle**: "Exercise - Completed" / "Exercise - Not completed"
- **Bottom sheet open**: "Edit Yesterday - 3 habits available"
- **Bottom sheet close**: "Editor closed, changes saved"

## Error States

### Network Error
```
┌─────────────────────────────────────┐
│ Edit Yesterday                  ✕   │
│ Mark habits as completed for        │
│ this day                            │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────┐     │
│ │ ⚠️  Connection Error        │     │
│ │                             │     │
│ │ Unable to save changes.     │     │
│ │ Please check your internet  │     │
│ │ connection and try again.   │     │
│ │                             │     │
│ │        [Retry]              │     │
│ └─────────────────────────────┘     │
└─────────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────────┐
│ Edit Yesterday                  ✕   │
│ Mark habits as completed for        │
│ this day                            │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────┐     │
│ │ Loading habits...           │     │
│ │                             │     │
│ │         ⏳                  │     │
│ │                             │     │
│ └─────────────────────────────┘     │
└─────────────────────────────────────┘
```
