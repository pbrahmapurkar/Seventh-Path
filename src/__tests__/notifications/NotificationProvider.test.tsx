/**
 * Notification Provider Test Suite
 * Tests notification state management and Capacitor integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../../providers/notificationProvider';
import { getPreference, setPreference } from '../../lib/storage/preferences';

// Mock the preferences module
vi.mock('../../lib/storage/preferences', () => ({
  getPreference: vi.fn(),
  setPreference: vi.fn(),
}));

// Mock the habits store
vi.mock('../../store/HabitsStore', () => ({
  useHabitsStore: {
    getState: vi.fn(() => ({
      habitsById: {},
    })),
  },
}));

// Mock the notification system
vi.mock('../../lib/notifications/habitReminderSystem', () => ({
  runMigrationOnce: vi.fn().mockResolvedValue(undefined),
  ensureReminderChannel: vi.fn().mockResolvedValue(undefined),
  requestPermissions: vi.fn().mockResolvedValue('granted'),
  checkPermissions: vi.fn().mockResolvedValue('granted'),
  getPendingCount: vi.fn().mockResolvedValue(0),
  scheduleReminderInstances: vi.fn().mockResolvedValue(undefined),
  rescheduleHabit: vi.fn().mockResolvedValue(undefined),
  cancelAllForHabit: vi.fn().mockResolvedValue(undefined),
  cancelTodayAtTime: vi.fn().mockResolvedValue(undefined),
  toJavaIntId: vi.fn((id: string) => id),
  getNativeSoundName: vi.fn(() => 'default'),
}));

// Test component that uses notifications
function TestComponent() {
  const {
    isEnabled,
    setEnabled,
    permission,
    requestPermission,
    checkAndRequestPermission,
    isLoading,
    error,
  } = useNotifications();

  return (
    <div>
      <div data-testid="enabled">{isEnabled ? 'enabled' : 'disabled'}</div>
      <div data-testid="permission">{permission?.status || 'unknown'}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'idle'}</div>
      <div data-testid="error">{error || 'none'}</div>
      <button
        data-testid="toggle-enabled"
        onClick={() => setEnabled(!isEnabled)}
      >
        Toggle
      </button>
      <button
        data-testid="request-permission"
        onClick={() => requestPermission()}
      >
        Request Permission
      </button>
      <button
        data-testid="check-permission"
        onClick={() => checkAndRequestPermission()}
      >
        Check Permission
      </button>
    </div>
  );
}

describe('NotificationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with enabled state from preferences', async () => {
      vi.mocked(getPreference).mockResolvedValue(true);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('enabled');
      });

      expect(getPreference).toHaveBeenCalledWith('notificationsEnabled', true);
    });

    it('should initialize with disabled state from preferences', async () => {
      vi.mocked(getPreference).mockResolvedValue(false);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('disabled');
      });
    });

    it('should handle preference loading errors gracefully', async () => {
      vi.mocked(getPreference).mockRejectedValue(new Error('Storage error'));

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('enabled'); // Default to enabled
      });
    });
  });

  describe('Toggle Functionality', () => {
    it('should toggle enabled state and save to preferences', async () => {
      vi.mocked(getPreference).mockResolvedValue(false);
      vi.mocked(setPreference).mockResolvedValue(undefined);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('disabled');
      });

      // Toggle to enabled
      fireEvent.click(screen.getByTestId('toggle-enabled'));

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('enabled');
      });

      expect(setPreference).toHaveBeenCalledWith('notificationsEnabled', true);
    });

    it('should handle toggle errors gracefully', async () => {
      vi.mocked(getPreference).mockResolvedValue(false);
      vi.mocked(setPreference).mockRejectedValue(new Error('Storage error'));

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('disabled');
      });

      // Toggle should still work locally even if storage fails
      fireEvent.click(screen.getByTestId('toggle-enabled'));

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('enabled');
      });
    });
  });

  describe('Permission Management', () => {
    it('should request permission successfully', async () => {
      vi.mocked(getPreference).mockResolvedValue(true);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('permission')).toHaveTextContent('granted');
      });

      fireEvent.click(screen.getByTestId('request-permission'));

      await waitFor(() => {
        expect(screen.getByTestId('permission')).toHaveTextContent('granted');
      });
    });

    it('should handle permission request errors', async () => {
      vi.mocked(getPreference).mockResolvedValue(true);
      
      const { requestPermissions } = await import('../../lib/notifications/habitReminderSystem');
      vi.mocked(requestPermissions).mockRejectedValue(new Error('Permission denied'));

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('permission')).toHaveTextContent('granted');
      });

      fireEvent.click(screen.getByTestId('request-permission'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Permission denied');
      });
    });

    it('should check and request permission', async () => {
      vi.mocked(getPreference).mockResolvedValue(true);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('permission')).toHaveTextContent('granted');
      });

      fireEvent.click(screen.getByTestId('check-permission'));

      await waitFor(() => {
        expect(screen.getByTestId('permission')).toHaveTextContent('granted');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during operations', async () => {
      vi.mocked(getPreference).mockResolvedValue(true);

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      // Should show loading initially
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('idle');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      vi.mocked(getPreference).mockRejectedValue(new Error('Storage error'));

      render(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('enabled')).toHaveTextContent('enabled'); // Default fallback
        expect(screen.getByTestId('error')).toHaveTextContent('none');
      });
    });
  });
});
