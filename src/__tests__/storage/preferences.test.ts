/**
 * Preferences Storage Test Suite
 * Tests Capacitor Preferences integration and fallbacks
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getPreference, setPreference, removePreference, hasPreference, getAllPreferenceKeys, clearAllPreferences } from '../../lib/storage/preferences';

// Mock Capacitor
const mockPreferences = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  clear: vi.fn(),
  keys: vi.fn(),
};

// Mock global Capacitor object
Object.defineProperty(globalThis, 'Capacitor', {
  value: {
    getPlatform: () => 'web',
    Plugins: {
      Preferences: mockPreferences,
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

describe('Preferences Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPreference', () => {
    it('should get preference from Capacitor on native platforms', async () => {
      // Mock native platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'ios',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      mockPreferences.get.mockResolvedValue({ value: '{"test": "value"}' });

      const result = await getPreference('test-key', { default: 'value' });

      expect(mockPreferences.get).toHaveBeenCalledWith({ key: 'test-key' });
      expect(result).toEqual({ test: 'value' });
    });

    it('should get preference from localStorage on web', async () => {
      // Mock web platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'web',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      localStorageMock.getItem.mockReturnValue('{"test": "value"}');

      const result = await getPreference('test-key', { default: 'value' });

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toEqual({ test: 'value' });
    });

    it('should return default value when key does not exist', async () => {
      mockPreferences.get.mockResolvedValue({ value: undefined });

      const result = await getPreference('nonexistent-key', { default: 'value' });

      expect(result).toEqual({ default: 'value' });
    });

    it('should handle JSON parsing errors gracefully', async () => {
      mockPreferences.get.mockResolvedValue({ value: 'invalid json' });

      const result = await getPreference('invalid-key', { default: 'value' });

      expect(result).toEqual({ default: 'value' });
    });

    it('should handle storage errors gracefully', async () => {
      mockPreferences.get.mockRejectedValue(new Error('Storage error'));

      const result = await getPreference('error-key', { default: 'value' });

      expect(result).toEqual({ default: 'value' });
    });
  });

  describe('setPreference', () => {
    it('should set preference in Capacitor on native platforms', async () => {
      // Mock native platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'ios',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      mockPreferences.set.mockResolvedValue(undefined);

      await setPreference('test-key', { test: 'value' });

      expect(mockPreferences.set).toHaveBeenCalledWith({
        key: 'test-key',
        value: '{"test":"value"}',
      });
    });

    it('should set preference in localStorage on web', async () => {
      // Mock web platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'web',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      await setPreference('test-key', { test: 'value' });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        '{"test":"value"}'
      );
    });

    it('should handle JSON stringification errors gracefully', async () => {
      const circularRef: any = {};
      circularRef.self = circularRef;

      await setPreference('circular-key', circularRef);

      // Should not throw, but should log error
      expect(mockPreferences.set).not.toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      mockPreferences.set.mockRejectedValue(new Error('Storage error'));

      await setPreference('error-key', { test: 'value' });

      // Should not throw
      expect(mockPreferences.set).toHaveBeenCalled();
    });
  });

  describe('removePreference', () => {
    it('should remove preference from Capacitor on native platforms', async () => {
      // Mock native platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'ios',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      mockPreferences.remove.mockResolvedValue(undefined);

      await removePreference('test-key');

      expect(mockPreferences.remove).toHaveBeenCalledWith({ key: 'test-key' });
    });

    it('should remove preference from localStorage on web', async () => {
      // Mock web platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'web',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      await removePreference('test-key');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should handle storage errors gracefully', async () => {
      mockPreferences.remove.mockRejectedValue(new Error('Storage error'));

      await removePreference('error-key');

      // Should not throw
      expect(mockPreferences.remove).toHaveBeenCalled();
    });
  });

  describe('hasPreference', () => {
    it('should check if preference exists in Capacitor on native platforms', async () => {
      // Mock native platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'ios',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      mockPreferences.get.mockResolvedValue({ value: '{"test": "value"}' });

      const result = await hasPreference('test-key');

      expect(mockPreferences.get).toHaveBeenCalledWith({ key: 'test-key' });
      expect(result).toBe(true);
    });

    it('should check if preference exists in localStorage on web', async () => {
      // Mock web platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'web',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      localStorageMock.getItem.mockReturnValue('{"test": "value"}');

      const result = await hasPreference('test-key');

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });

    it('should return false when preference does not exist', async () => {
      mockPreferences.get.mockResolvedValue({ value: undefined });

      const result = await hasPreference('nonexistent-key');

      expect(result).toBe(false);
    });

    it('should handle storage errors gracefully', async () => {
      mockPreferences.get.mockRejectedValue(new Error('Storage error'));

      const result = await hasPreference('error-key');

      expect(result).toBe(false);
    });
  });

  describe('getAllPreferenceKeys', () => {
    it('should get all keys from Capacitor on native platforms', async () => {
      // Mock native platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'ios',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      mockPreferences.keys.mockResolvedValue({ keys: ['key1', 'key2'] });

      const result = await getAllPreferenceKeys();

      expect(mockPreferences.keys).toHaveBeenCalled();
      expect(result).toEqual(['key1', 'key2']);
    });

    it('should get all keys from localStorage on web', async () => {
      // Mock web platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'web',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      Object.defineProperty(localStorageMock, 'length', { value: 2 });
      localStorageMock.key.mockReturnValueOnce('key1').mockReturnValueOnce('key2');

      const result = await getAllPreferenceKeys();

      expect(localStorageMock.key).toHaveBeenCalledTimes(2);
      expect(result).toEqual(['key1', 'key2']);
    });

    it('should handle storage errors gracefully', async () => {
      mockPreferences.keys.mockRejectedValue(new Error('Storage error'));

      const result = await getAllPreferenceKeys();

      expect(result).toEqual([]);
    });
  });

  describe('clearAllPreferences', () => {
    it('should clear all preferences in Capacitor on native platforms', async () => {
      // Mock native platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'ios',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      mockPreferences.clear.mockResolvedValue(undefined);

      await clearAllPreferences();

      expect(mockPreferences.clear).toHaveBeenCalled();
    });

    it('should clear all preferences in localStorage on web', async () => {
      // Mock web platform
      Object.defineProperty(globalThis, 'Capacitor', {
        value: {
          getPlatform: () => 'web',
          Plugins: {
            Preferences: mockPreferences,
          },
        },
        writable: true,
      });

      await clearAllPreferences();

      expect(localStorageMock.clear).toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      mockPreferences.clear.mockRejectedValue(new Error('Storage error'));

      await clearAllPreferences();

      // Should not throw
      expect(mockPreferences.clear).toHaveBeenCalled();
    });
  });
});
