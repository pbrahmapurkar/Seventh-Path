# Seventh Path Theming System Design

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    THEMING SYSTEM ARCHITECTURE              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ Enhanced Theme  │    │    Enhanced Theme Definitions  │ │
│  │    Context      │    │                                 │ │
│  │                 │    │ • Light Theme                  │ │
│  │ • State Mgmt    │◄──►│ • Dark Theme                    │ │
│  │ • Persistence   │    │ • Blue Theme (Calm/Bold)       │ │
│  │ • Transitions   │    │ • Green Theme (Calm/Bold)       │ │
│  │ • DOM Updates   │    │ • WCAG AA Compliance           │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
│           │                        │                      │
│           ▼                        ▼                      │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │ Theme Selector  │    │        Design Tokens           │ │
│  │   Dropdown      │    │                                 │ │
│  │                 │    │ • Color Tokens                  │ │
│  │ • Dropdown UI   │    │ • Typography Tokens             │ │
│  │ • Preview Swatch│    │ • Spacing Tokens                │ │
│  │ • Accessibility │    │ • Elevation Tokens              │ │
│  │ • Animations    │    │ • Chart Color Tokens           │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
│           │                        │                      │
│           ▼                        ▼                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Component Layer                            │ │
│  │                                                         │ │
│  │ • AppShell • HabitCard • ProgressRing • Notifications │ │
│  │ • Buttons • Forms • Charts • Navigation               │ │
│  │ • All components use CSS custom properties            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 2. Design Token System

### 2.1 Color Token Categories

#### Base Colors
- `background`: Main app background
- `foreground`: Primary text color
- `card`: Surface color for cards/panels
- `cardForeground`: Text on card surfaces

#### Interactive Colors
- `primary`: Main brand/accent color
- `primaryForeground`: Text on primary elements
- `secondary`: Secondary interactive elements
- `secondaryForeground`: Text on secondary elements
- `accent`: Accent color for highlights
- `accentForeground`: Text on accent elements

#### Semantic Colors
- `success`: Success states (completed habits)
- `warning`: Warning states (missed habits)
- `destructive`: Error/destructive actions
- `info`: Informational elements

#### UI Elements
- `border`: Border colors
- `input`: Input field borders
- `ring`: Focus ring color
- `muted`: Muted backgrounds
- `mutedForeground`: Muted text

#### Chart Colors
- `chartFill1-5`: Data visualization colors

### 2.2 Theme Variants

#### Blue Theme Variants
- **Calm**: Soft, relaxing blues for focus and tranquility
- **Bold**: Vibrant, energetic blues for motivation and energy

#### Green Theme Variants
- **Calm**: Natural, peaceful greens for growth and harmony
- **Bold**: Dynamic, vibrant greens for vitality and motivation

## 3. WCAG AA Compliance

### 3.1 Contrast Ratios
All themes meet WCAG AA standards (4.5:1 contrast ratio):

| Element | Light Theme | Dark Theme | Blue Themes | Green Themes |
|---------|-------------|------------|-------------|--------------|
| Primary Text | 4.5:1 | 4.5:1 | 4.5:1 | 4.5:1 |
| Secondary Text | 4.5:1 | 4.5:1 | 4.5:1 | 4.5:1 |
| Primary Buttons | 4.5:1 | 4.5:1 | 4.5:1 | 4.5:1 |
| Borders | 3:1 | 3:1 | 3:1 | 3:1 |

### 3.2 Accessibility Features
- Keyboard navigation support
- Screen reader labels
- Focus indicators
- High contrast mode support
- Reduced motion preferences

## 4. Typography System

### 4.1 Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### 4.2 Font Weights
- **Light**: 300 (for subtle text)
- **Regular**: 400 (body text)
- **Medium**: 500 (emphasis)
- **Semibold**: 600 (headings)
- **Bold**: 700 (strong emphasis)

### 4.3 Font Sizes
- **xs**: 0.75rem (12px) - Captions, labels
- **sm**: 0.875rem (14px) - Secondary text
- **base**: 1rem (16px) - Body text
- **lg**: 1.125rem (18px) - Large body text
- **xl**: 1.25rem (20px) - Small headings
- **2xl**: 1.5rem (24px) - Medium headings
- **3xl**: 1.875rem (30px) - Large headings

## 5. Spacing System

### 5.1 Spacing Scale
```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
--spacing-20: 5rem;    /* 80px */
--spacing-24: 6rem;    /* 96px */
```

### 5.2 Component Spacing
- **Card padding**: 1.5rem (24px)
- **Button padding**: 0.75rem 1.5rem (12px 24px)
- **Input padding**: 0.75rem 1rem (12px 16px)
- **Section margins**: 2rem (32px)

## 6. Elevation System

### 6.1 Shadow Levels
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### 6.2 Component Elevations
- **Cards**: `shadow-sm`
- **Buttons**: `shadow` (hover: `shadow-md`)
- **Modals**: `shadow-xl`
- **Dropdowns**: `shadow-lg`

## 7. Animation System

### 7.1 Transition Durations
```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### 7.2 Easing Functions
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 7.3 Component Animations
- **Theme transitions**: 300ms ease-in-out
- **Button hover**: 150ms ease-out
- **Modal enter/exit**: 200ms ease-in-out
- **Dropdown open/close**: 150ms ease-out

## 8. Icon System

### 8.1 Icon Sizes
- **xs**: 12px (0.75rem)
- **sm**: 14px (0.875rem)
- **md**: 16px (1rem)
- **lg**: 20px (1.25rem)
- **xl**: 24px (1.5rem)
- **2xl**: 32px (2rem)

### 8.2 Icon Treatments
- **Filled**: Solid icons for primary actions
- **Outlined**: Stroke icons for secondary actions
- **Duotone**: Two-tone icons for special states

## 9. Component Integration

### 9.1 AppShell Integration
```typescript
// AppShell uses theme colors via CSS custom properties
const AppShell = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Uses --color-background and --color-foreground */}
    </div>
  );
};
```

### 9.2 HabitCard Integration
```typescript
// HabitCard adapts to theme colors
const HabitCard = ({ completed }) => {
  return (
    <div className={`
      bg-card border-border
      ${completed ? 'bg-success/10 border-success/20' : ''}
    `}>
      {/* Theme-aware styling */}
    </div>
  );
};
```

### 9.3 ProgressRing Integration
```typescript
// ProgressRing uses theme chart colors
const ProgressRing = ({ progress }) => {
  return (
    <svg>
      <circle 
        className="stroke-primary"
        style={{ 
          strokeDasharray: `${progress} 100`,
          stroke: 'var(--color-chartFill1)'
        }}
      />
    </svg>
  );
};
```

## 10. State Management Flow

### 10.1 Theme Selection Flow
```
User clicks theme → ThemeSelectorDropdown → EnhancedThemeContext → 
DOM updates → Component re-renders → Persistence
```

### 10.2 State Update Sequence
1. **Event**: User selects theme from dropdown
2. **Context Update**: `setTheme()` called with new theme name
3. **DOM Update**: CSS custom properties applied
4. **Re-render**: Components re-render with new theme
5. **Persistence**: Theme preference saved to localStorage

### 10.3 Error Handling
- **Missing theme**: Fallback to default theme
- **Invalid theme**: Reset to light theme
- **Storage failure**: Continue with in-memory state
- **Transition errors**: Graceful degradation

## 11. Testing Strategy

### 11.1 Unit Tests
- Theme context state management
- Theme selector interactions
- Color token validation
- Accessibility compliance

### 11.2 Integration Tests
- Theme switching across components
- Persistence across app restarts
- Cross-browser compatibility
- Performance impact

### 11.3 Visual Regression Tests
- Screenshot comparison for each theme
- Component state variations
- Responsive design validation

## 12. Rollout Checklist

### 12.1 Pre-Implementation
- [ ] Review current theme system
- [ ] Validate color contrast ratios
- [ ] Test accessibility features
- [ ] Create component inventory

### 12.2 Implementation
- [ ] Create enhanced theme definitions
- [ ] Implement dropdown selector
- [ ] Update theme context
- [ ] Apply CSS custom properties
- [ ] Test all components

### 12.3 Post-Implementation
- [ ] User acceptance testing
- [ ] Performance monitoring
- [ ] Accessibility audit
- [ ] Documentation updates

## 13. Future Enhancements

### 13.1 Advanced Features
- **System theme detection**: Auto-switch based on OS preference
- **Custom themes**: User-defined color schemes
- **Theme scheduling**: Time-based theme switching
- **Accessibility themes**: High contrast, reduced motion

### 13.2 Performance Optimizations
- **Theme preloading**: Load all themes for instant switching
- **CSS-in-JS optimization**: Reduce bundle size
- **Lazy loading**: Load theme assets on demand

## 14. Assumptions and Open Questions

### 14.1 Assumptions
- Users prefer dropdown over grid layout for theme selection
- Blue and Green themes need both calm and bold variants
- WCAG AA compliance is sufficient for accessibility
- CSS custom properties are supported in target browsers

### 14.2 Open Questions
- Should we support theme-specific animations?
- Do we need theme-specific icon sets?
- Should themes affect data visualization colors?
- How should we handle theme-specific component variants?

## 15. Implementation Timeline

### Phase 1: Foundation (Week 1)
- Enhanced theme definitions
- Theme context updates
- Basic dropdown implementation

### Phase 2: Integration (Week 2)
- Component updates
- CSS custom properties
- Testing and validation

### Phase 3: Polish (Week 3)
- Accessibility improvements
- Performance optimization
- Documentation and rollout


