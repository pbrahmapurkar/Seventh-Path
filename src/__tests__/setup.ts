/**
 * Vitest Test Setup
 * Configures testing environment and mocks
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: () => 'web',
    isNativePlatform: () => false,
  },
}));

// Mock Capacitor Plugins
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    schedule: vi.fn().mockResolvedValue({}),
    cancel: vi.fn().mockResolvedValue({}),
    cancelAll: vi.fn().mockResolvedValue({}),
    addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
    registerActionTypes: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
    openUrl: vi.fn().mockResolvedValue({}),
    openSettings: vi.fn().mockResolvedValue({}),
  },
}));

// Mock Capacitor Preferences
const mockPreferences = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  keys: vi.fn(),
};

vi.mock('@capacitor/preferences', () => ({
  Preferences: mockPreferences,
}));

// Mock global Capacitor object
Object.defineProperty(globalThis, 'Capacitor', {
  value: {
    getPlatform: () => 'web',
    isNativePlatform: () => false,
    Plugins: {
      Preferences: mockPreferences,
      LocalNotifications: {
        checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
        requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
        schedule: vi.fn().mockResolvedValue({}),
        cancel: vi.fn().mockResolvedValue({}),
        cancelAll: vi.fn().mockResolvedValue({}),
        addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
        registerActionTypes: vi.fn().mockResolvedValue({}),
      },
      App: {
        addListener: vi.fn().mockResolvedValue({ remove: vi.fn() }),
        openUrl: vi.fn().mockResolvedValue({}),
        openSettings: vi.fn().mockResolvedValue({}),
      },
    },
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true,
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};
