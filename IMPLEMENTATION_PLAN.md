# Seventh Path Theming System Implementation Plan

## 1. Implementation Overview

This document outlines the step-by-step implementation of the enhanced theming system for Seventh Path, including the new dropdown selector and Blue/Green theme variants.

## 2. Required Code Updates

### 2.1 Theme Definitions Update

**File**: `src/themes/themeDefinitions.ts`
**Action**: Replace with enhanced definitions
**Changes**:
- Add Blue and Green theme variants (calm/bold)
- Include chart color tokens
- Ensure WCAG AA compliance
- Add theme categorization

### 2.2 Theme Context Enhancement

**File**: `src/contexts/ThemeContext.tsx`
**Action**: Update to support new theme names
**Changes**:
- Support new theme names: `blue-calm`, `blue-bold`, `green-calm`, `green-bold`
- Update storage key handling
- Improve error handling

### 2.3 Settings Screen Update

**File**: `src/screens/Settings.tsx`
**Action**: Replace ThemeSelector with ThemeSelectorDropdown
**Changes**:
- Import new dropdown component
- Replace grid layout with dropdown
- Update theme change handler

### 2.4 CSS Custom Properties

**File**: `src/styles/globals.css`
**Action**: Add CSS custom properties for theme colors
**Changes**:
- Define CSS custom properties for all theme colors
- Add theme-specific classes
- Include transition animations

## 3. Implementation Steps

### Step 1: Create Enhanced Theme Definitions

```typescript
// src/themes/enhancedThemeDefinitions.ts
export type ThemeName = 'light' | 'dark' | 'blue-calm' | 'blue-bold' | 'green-calm' | 'green-bold';

// Include all theme definitions with WCAG AA compliance
// Add chart colors and semantic usage notes
```

### Step 2: Implement Dropdown Selector

```typescript
// src/components/ThemeSelector/ThemeSelectorDropdown.tsx
// Features:
// - Dropdown interface with preview swatches
// - Keyboard navigation support
// - Accessibility compliance
// - Smooth animations
// - Grouped by category (Neutral, Blue, Green)
```

### Step 3: Update Theme Context

```typescript
// src/contexts/EnhancedThemeContext.tsx
// Features:
// - Support for new theme names
// - Improved persistence
// - Better error handling
// - CSS custom property application
```

### Step 4: Update Settings Screen

```typescript
// src/screens/Settings.tsx
// Changes:
// - Replace ThemeSelector with ThemeSelectorDropdown
// - Update imports
// - Maintain existing functionality
```

### Step 5: Add CSS Custom Properties

```css
/* src/styles/globals.css */
:root {
  /* Light theme as default */
  --color-background: hsl(210, 40%, 98%);
  --color-foreground: hsl(222, 47%, 11%);
  /* ... all other color tokens */
}

/* Theme-specific classes */
.theme-dark { /* Dark theme overrides */ }
.theme-blue-calm { /* Blue calm theme overrides */ }
.theme-blue-bold { /* Blue bold theme overrides */ }
.theme-green-calm { /* Green calm theme overrides */ }
.theme-green-bold { /* Green bold theme overrides */ }
```

## 4. Component Integration

### 4.1 AppShell Integration

```typescript
// src/components/AppShell.tsx
// Update to use CSS custom properties
const AppShell = () => {
  return (
    <div 
      className="bg-background text-foreground"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)'
      }}
    >
      {/* AppShell content */}
    </div>
  );
};
```

### 4.2 HabitCard Integration

```typescript
// src/components/HabitCard.tsx
// Update to use theme-aware colors
const HabitCard = ({ completed, theme }) => {
  return (
    <div 
      className={`
        bg-card border-border
        ${completed ? 'bg-success/10 border-success/20' : ''}
      `}
      style={{
        backgroundColor: completed ? 'var(--color-success)' : 'var(--color-card)',
        borderColor: completed ? 'var(--color-success)' : 'var(--color-border)'
      }}
    >
      {/* HabitCard content */}
    </div>
  );
};
```

### 4.3 ProgressRing Integration

```typescript
// src/components/ProgressRing.tsx
// Update to use chart colors
const ProgressRing = ({ progress, theme }) => {
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

## 5. Testing Strategy

### 5.1 Unit Tests

```typescript
// src/__tests__/themes/
// - themeDefinitions.test.ts
// - themeContext.test.ts
// - themeSelector.test.ts
```

**Test Cases**:
- Theme switching functionality
- Color contrast validation
- Accessibility compliance
- Error handling

### 5.2 Integration Tests

```typescript
// src/__tests__/integration/
// - themeIntegration.test.ts
// - componentTheme.test.ts
```

**Test Cases**:
- Theme persistence across app restarts
- Component re-rendering on theme change
- Cross-browser compatibility
- Performance impact

### 5.3 Visual Regression Tests

```typescript
// src/__tests__/visual/
// - themeScreenshots.test.ts
```

**Test Cases**:
- Screenshot comparison for each theme
- Component state variations
- Responsive design validation

## 6. Accessibility Implementation

### 6.1 Keyboard Navigation

```typescript
// ThemeSelectorDropdown.tsx
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Escape') {
    setIsOpen(false);
    buttonRef.current?.focus();
  }
  // Additional keyboard navigation
};
```

### 6.2 Screen Reader Support

```typescript
// ARIA attributes for accessibility
<button
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  aria-label="Select theme"
  role="combobox"
>
  {/* Dropdown trigger */}
</button>
```

### 6.3 Focus Management

```typescript
// Focus management for dropdown
useEffect(() => {
  if (isOpen) {
    firstOptionRef.current?.focus();
  }
}, [isOpen]);
```

## 7. Performance Considerations

### 7.1 Theme Loading

```typescript
// Lazy load theme definitions
const loadTheme = async (themeName: ThemeName) => {
  const theme = await import(`../themes/${themeName}`);
  return theme.default;
};
```

### 7.2 CSS Custom Properties

```css
/* Use CSS custom properties for better performance */
:root {
  --color-primary: hsl(217, 91%, 60%);
  --color-background: hsl(210, 40%, 98%);
  /* ... */
}

.component {
  background-color: var(--color-background);
  color: var(--color-foreground);
}
```

### 7.3 Transition Optimization

```css
/* Optimize transitions */
.theme-transition {
  transition: background-color 300ms ease-in-out,
              color 300ms ease-in-out,
              border-color 300ms ease-in-out;
}
```

## 8. Error Handling

### 8.1 Theme Loading Errors

```typescript
// Enhanced error handling
const loadThemePreference = (): ThemeName => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isValidTheme(stored)) {
      return stored as ThemeName;
    }
  } catch (error) {
    console.error('Failed to load theme preference:', error);
  }
  return defaultTheme;
};
```

### 8.2 Fallback Mechanisms

```typescript
// Fallback to default theme
const getTheme = (name: ThemeName): Theme => {
  try {
    return themes[name] || themes[defaultTheme];
  } catch (error) {
    console.error('Theme loading failed:', error);
    return themes[defaultTheme];
  }
};
```

## 9. Rollout Strategy

### 9.1 Phase 1: Foundation (Week 1)
- [ ] Create enhanced theme definitions
- [ ] Implement dropdown selector
- [ ] Update theme context
- [ ] Basic testing

### 9.2 Phase 2: Integration (Week 2)
- [ ] Update Settings screen
- [ ] Apply CSS custom properties
- [ ] Component integration
- [ ] Accessibility testing

### 9.3 Phase 3: Polish (Week 3)
- [ ] Performance optimization
- [ ] Visual regression testing
- [ ] Documentation updates
- [ ] User acceptance testing

## 10. Success Metrics

### 10.1 Technical Metrics
- Theme switching time < 300ms
- Zero accessibility violations
- 100% WCAG AA compliance
- Cross-browser compatibility

### 10.2 User Experience Metrics
- Theme selection completion rate
- User preference retention
- Accessibility satisfaction
- Performance satisfaction

## 11. Maintenance Plan

### 11.1 Regular Updates
- Color contrast validation
- Accessibility compliance checks
- Performance monitoring
- User feedback integration

### 11.2 Future Enhancements
- System theme detection
- Custom theme creation
- Theme scheduling
- Advanced accessibility features

## 12. Risk Mitigation

### 12.1 Technical Risks
- **Browser compatibility**: Test across all target browsers
- **Performance impact**: Monitor bundle size and runtime performance
- **Accessibility regression**: Automated accessibility testing

### 12.2 User Experience Risks
- **Theme switching confusion**: Clear visual feedback
- **Accessibility issues**: Comprehensive testing
- **Performance degradation**: Optimize transitions and loading

## 13. Conclusion

This implementation plan provides a comprehensive approach to enhancing the Seventh Path theming system. The phased rollout ensures minimal risk while delivering maximum value to users. The focus on accessibility, performance, and user experience will result in a robust and maintainable theming system.


