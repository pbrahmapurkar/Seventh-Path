import React, { useEffect, useRef, useCallback } from 'react';
import { App } from '@capacitor/app';
import { useAppShell } from './AppShell';

interface BackNavHandlerProps {
  /**
   * Enable double-press to exit behavior
   * @default true
   */
  enableDoublePressToExit?: boolean;
  
  /**
   * Time window for double-press detection in milliseconds
   * @default 2000
   */
  doublePressWindow?: number;
  
  /**
   * Root routes that should minimize app instead of exiting
   * @default ['/', '/home']
   */
  rootRoutes?: string[];
  
  /**
   * Custom message to show for double-press to exit
   * @default 'Press back again to exit'
   */
  exitMessage?: string;
}

/**
 * BackNavHandler - Robust Android back navigation handler
 * 
 * Features:
 * - Uses @capacitor/app's backButton event
 * - Navigates back if there's history, minimizes app if on root route
 * - Supports double-press to exit behavior
 * - Clean up listeners on unmount
 * - Works with custom routing system
 */
export function BackNavHandler({
  enableDoublePressToExit = true,
  doublePressWindow = 2000,
  rootRoutes = ['/', '/home'],
  exitMessage = 'Press back again to exit'
}: BackNavHandlerProps) {
  const { currentRoute, goBack, navigate } = useAppShell();
  const lastBackPressRef = useRef<number>(0);
  const routeHistoryRef = useRef<string[]>([]);
  const isInitialMountRef = useRef(true);

  // Track route history for navigation decisions
  useEffect(() => {
    if (isInitialMountRef.current) {
      // Initialize with current route
      routeHistoryRef.current = [currentRoute];
      isInitialMountRef.current = false;
    } else {
      // Add new route to history (avoid duplicates)
      const lastRoute = routeHistoryRef.current[routeHistoryRef.current.length - 1];
      if (lastRoute !== currentRoute) {
        routeHistoryRef.current.push(currentRoute);
        
        // Limit history size to prevent memory issues
        if (routeHistoryRef.current.length > 50) {
          routeHistoryRef.current = routeHistoryRef.current.slice(-25);
        }
      }
    }
  }, [currentRoute]);

  // Check if current route is a root route
  const isRootRoute = useCallback(() => {
    return rootRoutes.includes(currentRoute);
  }, [currentRoute, rootRoutes]);

  // Check if we can go back in history
  const canGoBack = useCallback(() => {
    return routeHistoryRef.current.length > 1;
  }, []);

  // Handle back navigation logic
  const handleBackPress = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastPress = now - lastBackPressRef.current;

    // If double-press to exit is enabled and we're on a root route
    if (enableDoublePressToExit && isRootRoute()) {
      if (timeSinceLastPress < doublePressWindow) {
        // Double press detected - exit app
        try {
          await App.exitApp();
        } catch (error) {
          console.warn('Failed to exit app:', error);
        }
        return;
      } else {
        // First press on root route - show message and update timestamp
        lastBackPressRef.current = now;
        try {
          // Show toast message (if available)
          const toastModule = await import('@capacitor/toast');
          const Toast = toastModule.Toast;
          if (Toast && Toast.show) {
            await Toast.show({
              text: exitMessage,
              duration: 'short'
            });
          }
        } catch (error) {
          console.warn('Failed to show toast:', error);
          // Fallback: show alert on web
          if (typeof window !== 'undefined') {
            alert(exitMessage);
          }
        }
        return;
      }
    }

    // Reset double-press timer if not on root route
    lastBackPressRef.current = 0;

    // Check if we can navigate back in history
    if (canGoBack()) {
      // Remove current route from history and go back
      routeHistoryRef.current.pop();
      goBack();
    } else if (isRootRoute()) {
      // On root route with no history - minimize app (Android) or do nothing (web)
      try {
        await App.minimizeApp();
      } catch (error) {
        console.warn('Failed to minimize app:', error);
        // On web or if minimize fails, do nothing
      }
    } else {
      // Fallback: try to go back anyway
      goBack();
    }
  }, [
    enableDoublePressToExit,
    doublePressWindow,
    isRootRoute,
    canGoBack,
    goBack,
    exitMessage
  ]);

  // Set up back button listener
  useEffect(() => {
    let backButtonListener: any = null;

    const setupBackButtonListener = async () => {
      try {
        // Add back button listener
        backButtonListener = await App.addListener('backButton', handleBackPress);
        console.log('BackNavHandler: Back button listener registered');
      } catch (error) {
        console.warn('BackNavHandler: Failed to register back button listener:', error);
      }
    };

    setupBackButtonListener();

    // Cleanup function
    return () => {
      if (backButtonListener) {
        try {
          backButtonListener.remove();
          console.log('BackNavHandler: Back button listener removed');
        } catch (error) {
          console.warn('BackNavHandler: Failed to remove back button listener:', error);
        }
      }
    };
  }, [handleBackPress]);

  // Debug logging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('BackNavHandler: Current route:', currentRoute);
      console.log('BackNavHandler: Route history:', routeHistoryRef.current);
      console.log('BackNavHandler: Can go back:', canGoBack());
      console.log('BackNavHandler: Is root route:', isRootRoute());
    }
  }, [currentRoute, canGoBack, isRootRoute]);

  // Expose debug info for testing (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Add debug info to window for testing
      (window as any).__BackNavHandler = {
        currentRoute,
        routeHistory: routeHistoryRef.current,
        canGoBack: canGoBack(),
        isRootRoute: isRootRoute(),
        lastBackPress: lastBackPressRef.current
      };
    }
  }, [currentRoute, canGoBack, isRootRoute]);

  // This component doesn't render anything
  return null;
}

export default BackNavHandler;
