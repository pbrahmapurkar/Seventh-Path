# BackNavHandler Component

A robust Android back navigation handler for React + Capacitor apps that provides intelligent back button behavior.

## Features

- ✅ Uses `@capacitor/app`'s `backButton` event
- ✅ Navigates back if there's history (`history.back()` / `navigate(-1)`)
- ✅ Minimizes app on root routes instead of exiting
- ✅ Supports double-press to exit behavior
- ✅ Clean up listeners on unmount
- ✅ Self-contained React component
- ✅ TypeScript support
- ✅ Development mode debugging

## Installation

```bash
npm install @capacitor/app
```

## Usage

### Basic Usage

```tsx
import { BackNavHandler } from './components/BackNavHandler';

function App() {
  return (
    <div>
      <BackNavHandler />
      {/* Your app content */}
    </div>
  );
}
```

### Advanced Configuration

```tsx
import { BackNavHandler } from './components/BackNavHandler';

function App() {
  return (
    <div>
      <BackNavHandler
        enableDoublePressToExit={true}
        doublePressWindow={2000}
        rootRoutes={['/', '/home', '/dashboard']}
        exitMessage="Press back again to exit"
      />
      {/* Your app content */}
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableDoublePressToExit` | `boolean` | `true` | Enable double-press to exit behavior |
| `doublePressWindow` | `number` | `2000` | Time window for double-press detection (ms) |
| `rootRoutes` | `string[]` | `['/', '/home']` | Routes that should minimize app instead of exiting |
| `exitMessage` | `string` | `'Press back again to exit'` | Message shown for double-press to exit |

## Behavior

### Navigation Logic

1. **Has History**: Navigate back using `goBack()` from your routing system
2. **Root Route + No History**: Minimize app (Android) or do nothing (web)
3. **Root Route + Double Press**: Exit app after showing message
4. **Fallback**: Try to navigate back anyway

### Root Routes

Root routes are routes where the app should minimize instead of exiting when there's no history. By default, these are:
- `/` (root)
- `/home` (main app screen)

### Double-Press to Exit

When on a root route:
1. **First Press**: Show toast message and start timer
2. **Second Press** (within window): Exit app
3. **Timeout**: Reset timer

## Integration with Custom Routing

The BackNavHandler works with any routing system that provides:
- `currentRoute`: Current route string
- `goBack()`: Function to navigate back
- `navigate(route)`: Function to navigate to a route

Example with custom routing:

```tsx
// Your custom routing context
const { currentRoute, goBack, navigate } = useCustomRouter();

// BackNavHandler will automatically use these
<BackNavHandler />
```

## Development & Testing

### Debug Information

In development mode, the component logs debug information to the console:

```
BackNavHandler: Current route: /home
BackNavHandler: Route history: ['/boot', '/home']
BackNavHandler: Can go back: true
BackNavHandler: Is root route: true
```

### Test Utilities

Development mode provides test utilities in the browser console:

```javascript
// Show current state and test scenarios
testBackNavHandler();

// Simulate a back button press
simulateBackPress();

// Reset handler state
resetBackNavHandler();
```

### Manual Testing

1. **Navigate to different routes** and test back button behavior
2. **Test double-press to exit** on root routes (`/`, `/home`)
3. **Test single press** on non-root routes
4. **Check console logs** for BackNavHandler events

## Platform Support

- ✅ **Android**: Full support with minimize/exit functionality
- ✅ **iOS**: Basic support (iOS doesn't have hardware back button)
- ✅ **Web**: Graceful fallback (no minimize/exit)

## Error Handling

The component includes comprehensive error handling:
- Graceful fallback if `@capacitor/app` is not available
- Error logging for debugging
- Safe cleanup of event listeners

## Performance

- Minimal memory footprint
- Efficient event listener management
- Automatic cleanup on unmount
- Limited history size (50 routes max)

## Troubleshooting

### Back Button Not Working

1. Check if `@capacitor/app` is installed
2. Verify the component is mounted in your app
3. Check console for error messages
4. Ensure your routing system provides `goBack()` function

### Double-Press Not Working

1. Verify `enableDoublePressToExit` is `true`
2. Check if you're on a root route
3. Ensure `@capacitor/toast` is available for messages

### Development Mode Issues

1. Check if `NODE_ENV === 'development'`
2. Look for debug logs in console
3. Use test utilities: `testBackNavHandler()`

## Example Integration

```tsx
// App.tsx
import React from 'react';
import { AppShellProvider } from './components/AppShell';
import { BackNavHandler } from './components/BackNavHandler';

function AppContent() {
  return (
    <div className="app">
      <BackNavHandler
        enableDoublePressToExit={true}
        rootRoutes={['/', '/home', '/dashboard']}
        exitMessage="Press back again to exit"
      />
      {/* Your app content */}
    </div>
  );
}

export default function App() {
  return (
    <AppShellProvider>
      <AppContent />
    </AppShellProvider>
  );
}
```

## License

MIT License - feel free to use in your projects!
