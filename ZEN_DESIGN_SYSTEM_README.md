# Seventh Path Zen Design System

A mindful, spiritual design system for peaceful habit tracking and personal growth. Built with tranquility, accessibility, and spiritual connection in mind.

## 🌿 Philosophy

The Zen Design System embodies:

- **Tranquility**: Every interaction feels peaceful and unhurried
- **Spiritual Connection**: Visual elements evoke nature, growth, and inner peace
- **Mindful Motion**: Animations that breathe and flow organically
- **Gentle Guidance**: UI that nurtures rather than demands

## 🎨 Color Palette

### Primary Colors
- **Sage** (`#A8B5A0`): Primary calm green for main actions
- **Lavender** (`#E6E6FA`): Secondary spiritual purple for highlights
- **Amber** (`#F4E4BC`): Accent warmth for warnings and progress
- **Mist** (`#F5F7F5`): Background serenity for calm interfaces
- **Stone** (`#6B7280`): Neutral grounding for text and borders

### Semantic Colors
- **Completed**: `linear-gradient(135deg, #A8B5A0 0%, #E6E6FA 100%)`
- **In Progress**: `linear-gradient(135deg, #F4E4BC 0%, #A8B5A0 100%)`
- **Gentle Warning**: `#F4E4BC`
- **Affirming**: `#A8B5A0`

## 📝 Typography

### Font Stack
- **Headings**: `'Crimson Text', Georgia, serif`
- **Body**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
- **Accent**: `'Crimson Text', serif` (for special moments)

### Scale
- **xs**: 0.75rem (line-height: 1.6)
- **sm**: 0.875rem (line-height: 1.6)
- **base**: 1rem (line-height: 1.6)
- **lg**: 1.125rem (line-height: 1.65)
- **xl**: 1.25rem (line-height: 1.65)
- **2xl**: 1.5rem (line-height: 1.7)
- **3xl**: 1.875rem (line-height: 1.7)
- **4xl**: 2.25rem (line-height: 1.75)

## 🎭 Motion System

### Easing Curves
- **Mindful**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- **Breathing**: `cubic-bezier(0.4, 0.0, 0.2, 1)`
- **Gentle**: `cubic-bezier(0.33, 1, 0.68, 1)`
- **Organic**: `cubic-bezier(0.65, 0, 0.35, 1)`

### Durations
- **Instant**: 150ms
- **Quick**: 250ms
- **Standard**: 400ms
- **Slow**: 600ms
- **Breathing**: 4000ms

## 🧩 Components

### Buttons
```tsx
import { Button } from './components/ui/button';

// Primary button with spiritual gradient
<Button variant="primary">Mindful Action</Button>

// Secondary button with soft outline
<Button variant="secondary">Gentle Choice</Button>

// Ghost button for minimal interactions
<Button variant="ghost">Subtle Option</Button>

// Completed button with celebration glow
<Button variant="completed">Achievement</Button>
```

### Cards
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Peaceful Card</CardTitle>
    <CardDescription>Gentle description with mindful spacing</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content with breathing room and tranquil design</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

### Progress Rings
```tsx
import { ProgressRing } from './components/ui/ProgressRing';

// Basic progress ring
<ProgressRing value={75} />

// With breathing animation
<ProgressRing value={60} breathing={true} />

// With celebration on completion
<ProgressRing value={100} celebration={true} />

// Habit-specific progress ring
<ProgressRing value={progress} max={7} breathing={true} celebration={progress >= 7} />
```

### Breathing Animations
```tsx
import { BreathingAnimation } from './components/animations/BreathingAnimation';

// Gentle breathing effect
<BreathingAnimation intensity="gentle" duration={4000}>
  <div>This element breathes peacefully</div>
</BreathingAnimation>

// Specialized components
<BreathingCard>Card with breathing</BreathingCard>
<BreathingButton>Button with pulse</BreathingButton>
<BreathingIcon>Icon with rotation</BreathingIcon>
```

### Celebration Animations
```tsx
import { CelebrationAnimation } from './components/animations/CelebrationAnimation';

// Gentle celebration
<CelebrationAnimation type="pulse" intensity="gentle">
  <Button>Celebrate!</Button>
</CelebrationAnimation>

// Habit completion celebration
<HabitCompletionCelebration>
  <div>Habit completed!</div>
</HabitCompletionCelebration>
```

## 🌙 Themes

### Available Themes
- **Zen Light**: Serene light interface with mindful green accents
- **Zen Dark**: Peaceful dark interface with gentle green highlights
- **Zen Calm**: Ultra-gentle interface for meditation and mindfulness
- **Zen Meditation**: Deep, contemplative interface for focused meditation

### Theme Usage
```tsx
import { ZenThemeProvider, useZenTheme } from './contexts/ZenThemeContext';

// In your app
<ZenThemeProvider>
  <App />
</ZenThemeProvider>

// In components
const { theme, setTheme, calmMode, setCalmMode } = useZenTheme();
```

## ♿ Accessibility

### Calm Mode
Enhanced accessibility with:
- Expanded spacing (20% increase)
- Slower animations (1.5x duration)
- Enhanced contrast (10% increase)
- Larger touch targets (48px minimum)

### Features
- Voice guidance for habit completions
- High contrast mode support
- Reduced motion preferences
- Focus management
- Screen reader support

### Usage
```tsx
import { CalmModeToggle } from './components/accessibility/CalmModeToggle';

// Toggle component
<CalmModeToggle variant="switch" showLabel={true} />

// Card variant
<CalmModeToggle variant="card" />

// Button variant
<CalmModeToggle variant="button" />
```

## 🎯 Navigation

### Mindful Navigation
```tsx
import { MindfulNavigation } from './components/navigation/MindfulNavigation';

const items = [
  {
    id: 'home',
    label: 'Home',
    icon: <HomeIcon />,
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: <HabitsIcon />,
    badge: '3',
  },
];

// Tab navigation
<MindfulNavigation items={items} variant="tabs" activeItem="home" />

// Bottom navigation
<MindfulNavigation items={items} variant="bottom" activeItem="habits" />

// Sidebar navigation
<MindfulNavigation items={items} variant="sidebar" activeItem="home" />
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Import Design System
```tsx
import './styles/design-system/index.css';
```

### 3. Wrap with Theme Provider
```tsx
import { ZenThemeProvider } from './contexts/ZenThemeContext';

function App() {
  return (
    <ZenThemeProvider>
      <YourApp />
    </ZenThemeProvider>
  );
}
```

### 4. Use Components
```tsx
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { BreathingAnimation } from './components/animations/BreathingAnimation';

function MyComponent() {
  return (
    <Card>
      <BreathingAnimation>
        <Button variant="primary">Mindful Action</Button>
      </BreathingAnimation>
    </Card>
  );
}
```

## 📱 Responsive Design

The design system is fully responsive with:
- Mobile-first approach
- Touch-friendly interactions (44px minimum)
- Adaptive spacing and typography
- Flexible grid systems

## 🎨 Customization

### CSS Variables
All colors and spacing are available as CSS variables:

```css
:root {
  --zen-sage: #A8B5A0;
  --zen-lavender: #E6E6FA;
  --zen-amber: #F4E4BC;
  --zen-mist: #F5F7F5;
  --zen-stone: #6B7280;
  
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  /* ... more spacing variables */
}
```

### Component Classes
Use utility classes for quick styling:

```tsx
<div className="card breathing-glow">
  <h2 className="text-2xl font-heading text-primary">
    Mindful Heading
  </h2>
  <p className="text-mindful">
    Peaceful content with spiritual serif font
  </p>
</div>
```

## 🧪 Testing

### WCAG Compliance
- All colors meet WCAG AA contrast requirements
- Focus states are clearly visible
- Touch targets meet accessibility standards
- Screen reader compatibility

### Performance
- 60fps animations on mid-range devices
- Optimized CSS with minimal bundle size
- Efficient React components with proper memoization

## 📚 Examples

See `src/components/examples/ZenDesignSystemDemo.tsx` for a comprehensive showcase of all components and features.

## 🤝 Contributing

When contributing to the design system:

1. Follow the mindful design principles
2. Ensure accessibility compliance
3. Test with Calm Mode enabled
4. Use the breathing animation system
5. Maintain the spiritual, peaceful aesthetic

## 📄 License

This design system is part of Seventh Path and follows the same licensing terms.

---

*"The present moment is the only time over which we have dominion."* - Thich Nhat Hanh
