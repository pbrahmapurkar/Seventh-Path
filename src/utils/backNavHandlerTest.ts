/**
 * BackNavHandler Test Utilities
 * 
 * This file provides utilities for testing the BackNavHandler component
 * in development mode.
 */

/**
 * Test the BackNavHandler functionality
 * Call this in the browser console to test the back navigation logic
 */
export function testBackNavHandler() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('BackNavHandler tests are only available in development mode');
    return;
  }

  const handler = (window as any).__BackNavHandler;
  if (!handler) {
    console.error('BackNavHandler not found. Make sure the component is mounted.');
    return;
  }

  console.log('=== BackNavHandler Test Results ===');
  console.log('Current Route:', handler.currentRoute);
  console.log('Route History:', handler.routeHistory);
  console.log('Can Go Back:', handler.canGoBack);
  console.log('Is Root Route:', handler.isRootRoute);
  console.log('Last Back Press:', handler.lastBackPress);
  
  // Test scenarios
  console.log('\n=== Test Scenarios ===');
  
  if (handler.isRootRoute) {
    console.log('✅ On root route - double press should exit app');
  } else {
    console.log('✅ Not on root route - back press should navigate back');
  }
  
  if (handler.canGoBack) {
    console.log('✅ Has navigation history - can go back');
  } else {
    console.log('⚠️ No navigation history - will minimize app or do nothing');
  }
  
  console.log('\n=== Manual Testing ===');
  console.log('1. Navigate to different routes and test back button');
  console.log('2. Test double-press to exit on root routes');
  console.log('3. Test single press on non-root routes');
  console.log('4. Check console logs for BackNavHandler events');
}

/**
 * Simulate back button press for testing
 * Note: This only works in development mode
 */
export function simulateBackPress() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('BackNavHandler simulation is only available in development mode');
    return;
  }

  console.log('Simulating back button press...');
  
  // Dispatch a custom event that the BackNavHandler can listen to
  const event = new CustomEvent('backButton');
  window.dispatchEvent(event);
  
  console.log('Back button press simulated. Check console for BackNavHandler logs.');
}

/**
 * Reset BackNavHandler state for testing
 * Note: This only works in development mode
 */
export function resetBackNavHandler() {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('BackNavHandler reset is only available in development mode');
    return;
  }

  const handler = (window as any).__BackNavHandler;
  if (handler) {
    handler.lastBackPress = 0;
    console.log('BackNavHandler state reset');
  } else {
    console.error('BackNavHandler not found');
  }
}

// Auto-expose test functions in development
if (process.env.NODE_ENV === 'development') {
  (window as any).testBackNavHandler = testBackNavHandler;
  (window as any).simulateBackPress = simulateBackPress;
  (window as any).resetBackNavHandler = resetBackNavHandler;
  
  console.log('BackNavHandler test utilities loaded. Available functions:');
  console.log('- testBackNavHandler() - Show current state and test scenarios');
  console.log('- simulateBackPress() - Simulate a back button press');
  console.log('- resetBackNavHandler() - Reset handler state');
}
