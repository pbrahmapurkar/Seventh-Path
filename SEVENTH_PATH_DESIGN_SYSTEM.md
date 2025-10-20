# Seventh Path Design System
## Comprehensive Design Specification & Component Library

---

## 🎨 **Design Philosophy**

Seventh Path follows a **mindful, focused, and accessible** design philosophy that prioritizes:
- **Calm & Focused Experience**: Clean interfaces that reduce cognitive load
- **Accessibility First**: WCAG AA compliance for all users
- **Consistent Patterns**: Predictable interactions across all screens
- **Performance Optimized**: Smooth animations and efficient rendering

---

## 🌈 **Color System**

### **Primary Theme: Emerald Night**
The app uses a sophisticated dark theme with vibrant emerald accents as the primary design language.

#### **Base Colors**
```css
--background: #111827      /* Deep slate background */
--foreground: #F9FAFB      /* High contrast text */
--card: #1F2937           /* Card surfaces */
--card-foreground: #F9FAFB /* Text on cards */
```

#### **Brand Colors**
```css
--primary: #10B981         /* Vibrant emerald - main actions */
--primary-foreground: #FFFFFF
--accent: #10B981          /* Emerald for highlights */
--accent-foreground: #FFFFFF
```

#### **Semantic Colors**
```css
--success: #10B981         /* Emerald green */
--warning: #F59E0B         /* Amber orange */
--destructive: #EF4444     /* Red for errors */
--info: #3B82F6           /* Blue for information */
```

#### **Neutral Palette**
```css
--secondary: #374151       /* Dark gray */
--muted: #374151          /* Muted elements */
--muted-foreground: #9CA3AF /* Muted text */
--border: #374151         /* Subtle borders */
--input: #374151          /* Input borders */
```

### **Alternative Theme Support**
The app includes multiple theme definitions for future expansion:
- **Light Theme**: Clean white interface
- **Blue Theme**: Calming blue palette
- **Green Theme**: Natural green palette

---

## 📝 **Typography**

### **Font Stack**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

### **Type Scale**
```css
/* Headings */
h1: 2xl (24px) - font-semibold, letter-spacing: -0.02em
h2: xl (20px) - font-semibold, letter-spacing: -0.02em
h3: lg (18px) - font-semibold, letter-spacing: -0.02em
h4: base (16px) - font-semibold, letter-spacing: -0.02em

/* Body Text */
p: base (16px) - font-normal, line-height: 1.6
label: base (16px) - font-medium
button: base (16px) - font-medium
input: base (16px) - font-normal
```

### **Font Weights**
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

---

## 📐 **Spacing System**

### **8dp Grid System**
```css
/* Spacing Scale */
xs: 4px   /* 4dp */
sm: 8px   /* 8dp */
md: 16px  /* 16dp */
lg: 24px  /* 24dp */
xl: 32px  /* 32dp */
2xl: 48px /* 48dp */
```

### **Component Spacing**
- **Card Padding**: 24px (lg)
- **Button Padding**: 16px horizontal, 8px vertical
- **Input Padding**: 12px horizontal, 8px vertical
- **Section Margins**: 32px between sections

---

## 🧩 **Component Library**

### **1. Buttons**

#### **Primary Button**
```tsx
<Button variant="default" size="default">
  Primary Action
</Button>
```
- **Background**: `--primary` (#10B981)
- **Text**: `--primary-foreground` (#FFFFFF)
- **Hover**: 90% opacity
- **Focus**: Ring with primary color

#### **Secondary Button**
```tsx
<Button variant="outline" size="default">
  Secondary Action
</Button>
```
- **Background**: Transparent
- **Border**: `--border` (#374151)
- **Text**: `--foreground` (#F9FAFB)
- **Hover**: `--accent` background

#### **Button Sizes**
- **Small**: `h-8` (32px)
- **Default**: `h-9` (36px)
- **Large**: `h-10` (40px)
- **Icon**: `size-9` (36px square)

### **2. Floating Action Button (FAB)**

#### **Primary FAB**
```tsx
<FloatingActionButton 
  size="medium" 
  variant="primary"
  onClick={handleAdd}
/>
```
- **Size**: 56dp (14 × 14)
- **Background**: `--primary` (#10B981)
- **Position**: Fixed bottom-right
- **Shadow**: Material 3 elevation
- **Safe Area**: Respects device safe areas

#### **Extended FAB**
```tsx
<ExtendedFAB 
  label="Add Habit"
  showLabel={true}
  size="medium"
/>
```
- **Height**: 56dp
- **Padding**: 24px horizontal
- **Icon + Label**: Horizontal layout

### **3. Cards**

#### **Standard Card**
```tsx
<Card className="p-6">
  <CardContent>
    Card content
  </CardContent>
</Card>
```
- **Background**: `--card` (#1F2937)
- **Border**: 1px solid `--border`
- **Border Radius**: 12px (xl)
- **Padding**: 24px (lg)

#### **Elevated Card**
```tsx
<Card className="shadow-lg">
  Elevated content
</Card>
```
- **Shadow**: Enhanced elevation
- **Background**: Same as standard card

### **4. Input Fields**

#### **Text Input**
```tsx
<Input 
  placeholder="Enter text"
  className="w-full"
/>
```
- **Background**: `--background` (#111827)
- **Border**: 1px solid `--input` (#374151)
- **Focus**: `--ring` color (#10B981)
- **Padding**: 12px horizontal, 8px vertical

#### **Input States**
- **Default**: Gray border
- **Focus**: Emerald ring + border
- **Error**: Red ring + border
- **Disabled**: 50% opacity

### **5. Navigation**

#### **App Bar**
```tsx
<AppBar 
  title="Screen Title"
  showBack={true}
  onBack={handleBack}
/>
```
- **Background**: `--card` with 95% opacity
- **Backdrop Blur**: Supports backdrop-filter
- **Height**: 64px minimum
- **Safe Area**: Respects top safe area
- **Border**: Bottom border

#### **Bottom Navigation**
```tsx
<BottomNav 
  currentRoute="/home"
  onNavigate={handleNavigate}
/>
```
- **Background**: `--card` with 95% opacity
- **Height**: 80px (20px + 60px content)
- **Safe Area**: Respects bottom safe area
- **Active State**: Primary color + scale + shadow

#### **Navigation Items**
- **Home**: House icon
- **History**: Clock icon
- **Insights**: Bar chart icon
- **Settings**: Gear icon

### **6. Habit Cards**

#### **Habit Card Layout**
```tsx
<HabitCard
  title="Morning Exercise"
  emoji="🏃‍♂️"
  streak={7}
  onClick={handleClick}
/>
```
- **Background**: `--card` (#1F2937)
- **Border**: 1px solid `--border`
- **Padding**: 16px
- **Border Radius**: 12px
- **Hover**: Subtle scale + shadow

#### **Card Elements**
- **Emoji**: 24px size
- **Title**: Semibold text
- **Streak**: Badge with primary color
- **Progress**: Visual progress indicator

### **7. Progress Components**

#### **Progress Ring**
```tsx
<ProgressRing
  progress={75}
  size={120}
  strokeWidth={8}
/>
```
- **Colors**: Primary emerald
- **Animation**: Smooth transitions
- **Sizes**: 80px, 120px, 160px

#### **Completion Calendar**
- **Grid**: 7×7 day grid
- **Colors**: Primary for completed days
- **Hover**: Tooltip with date info

---

## 🎭 **Animation System**

### **Transition Timing**
```css
/* Standard Transitions */
transition: all 150ms ease-in-out;

/* Fast Transitions */
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Slow Transitions */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### **Animation Classes**
```css
.animate-fade-in        /* 250ms fade in */
.animate-slide-in-up    /* 250ms slide up */
.animate-slide-in-down  /* 250ms slide down */
.animate-scale-in       /* 200ms scale in */
.animate-pulse-slow     /* 2s pulse animation */
```

### **Interactive Animations**
- **Button Press**: `active:scale-95`
- **Card Hover**: `hover:scale-105`
- **FAB Hover**: `hover:scale-105`
- **Navigation**: `active:scale-95`

---

## 📱 **Layout Patterns**

### **Screen Structure**
```
┌─────────────────────────┐
│      App Bar (64px)     │
├─────────────────────────┤
│                         │
│      Main Content       │
│                         │
│                         │
├─────────────────────────┤
│   Bottom Nav (80px)     │
└─────────────────────────┘
```

### **Content Areas**
- **Padding**: 24px (lg) horizontal
- **Margins**: 16px (md) between sections
- **Max Width**: Responsive with proper margins

### **Safe Areas**
- **Top**: `env(safe-area-inset-top)`
- **Bottom**: `env(safe-area-inset-bottom)`
- **Left/Right**: `env(safe-area-inset-left/right)`

---

## 🎯 **Interactive States**

### **Button States**
- **Default**: Base styling
- **Hover**: 90% opacity or accent background
- **Active**: Scale down (0.95)
- **Focus**: Ring outline
- **Disabled**: 50% opacity + no pointer events

### **Card States**
- **Default**: Base styling
- **Hover**: Scale up (1.05) + shadow
- **Active**: Scale down (0.95)
- **Focus**: Ring outline

### **Input States**
- **Default**: Gray border
- **Focus**: Primary ring + border
- **Error**: Destructive ring + border
- **Disabled**: 50% opacity

---

## ♿ **Accessibility**

### **Color Contrast**
- **Text**: 4.5:1 minimum contrast ratio
- **Interactive Elements**: 3:1 minimum
- **Focus Indicators**: 2px solid ring

### **Touch Targets**
- **Minimum Size**: 44×44 points
- **FAB Size**: 56×56 points
- **Button Height**: 36px minimum

### **Screen Reader Support**
- **ARIA Labels**: All interactive elements
- **Semantic HTML**: Proper heading hierarchy
- **Focus Management**: Logical tab order

### **Motion Preferences**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📊 **Data Visualization**

### **Chart Colors**
```css
--chart-fill-1: #10B981    /* Primary emerald */
--chart-fill-2: #3B82F6    /* Blue */
--chart-fill-3: #F59E0B    /* Amber */
--chart-fill-4: #8B5CF6    /* Purple */
--chart-fill-5: #EF4444    /* Red */
```

### **Progress Indicators**
- **Completion**: Primary emerald
- **Incomplete**: Muted gray
- **Streak**: Success green
- **Missed**: Warning amber

---

## 🔧 **Implementation Details**

### **CSS Custom Properties**
All colors are defined as CSS custom properties for easy theming:
```css
:root {
  --background: #111827;
  --foreground: #F9FAFB;
  --primary: #10B981;
  /* ... */
}
```

### **Tailwind Integration**
The design system integrates with Tailwind CSS:
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        background: 'hsl(var(--background))',
        // ...
      }
    }
  }
}
```

### **Component Variants**
Uses `class-variance-authority` for component variants:
```tsx
const buttonVariants = cva(
  "base-styles",
  {
    variants: {
      variant: { default: "...", outline: "..." },
      size: { sm: "...", md: "...", lg: "..." }
    }
  }
);
```

---

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### **Mobile-First Approach**
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-optimized interactions

### **Adaptive Layouts**
- **Cards**: Stack on mobile, grid on desktop
- **Navigation**: Bottom nav on mobile, sidebar on desktop
- **Typography**: Responsive font sizes

---

## 🎨 **Design Tokens**

### **Spacing Tokens**
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

### **Border Radius Tokens**
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### **Shadow Tokens**
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

---

## 🚀 **Performance Considerations**

### **Hardware Acceleration**
```css
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### **Will-Change Optimization**
```css
.will-change-transform {
  will-change: transform;
}
.will-change-opacity {
  will-change: opacity;
}
```

### **Animation Performance**
- Use `transform` and `opacity` for animations
- Avoid animating layout properties
- Use `requestAnimationFrame` for complex animations

---

## 📋 **Usage Guidelines**

### **Do's**
- ✅ Use consistent spacing (8dp grid)
- ✅ Maintain proper contrast ratios
- ✅ Include focus indicators
- ✅ Test with screen readers
- ✅ Respect motion preferences

### **Don'ts**
- ❌ Use arbitrary colors outside the system
- ❌ Create custom spacing values
- ❌ Skip accessibility considerations
- ❌ Animate layout properties
- ❌ Ignore touch target sizes

---

## 🔄 **Maintenance**

### **Regular Updates**
- Review color contrast ratios
- Update component documentation
- Test with new devices
- Validate accessibility compliance

### **Version Control**
- Document breaking changes
- Maintain backward compatibility
- Tag releases with semantic versioning

---

This design system provides a comprehensive foundation for building consistent, accessible, and performant user interfaces in the Seventh Path app. All components follow these guidelines to ensure a cohesive user experience across all platforms and devices.
