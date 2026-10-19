import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const memoryStore: Record<string, string> = {};

function getNativeStorage() {
  // If we are in web SSR (Node environment where window is undefined), do not invoke AsyncStorage web implementation
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    return null;
  }
  try {
    if (AsyncStorage) {
      if (typeof (AsyncStorage as any).getItem === 'function') {
        return AsyncStorage as any;
      }
      if ((AsyncStorage as any).default && typeof (AsyncStorage as any).default.getItem === 'function') {
        return (AsyncStorage as any).default;
      }
    }
  } catch (e) {
    // fallback
  }
  return null;
}

/**
 * Robust multi-environment persistent storage (Native Android/iOS + Web localStorage + SSR memory)
 */
export const storage = {
  /**
   * Synchronous getter for instant non-blocking hydration in Web / memory
   */
  getItemSync(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return memoryStore[key] ?? null;
  },

  /**
   * Synchronous setter for instant non-blocking updates in Web / memory
   */
  setItemSync(key: string, value: string): void {
    try {
      memoryStore[key] = value;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {}
  },

  /**
   * Universal async getter supporting native AsyncStorage and Web
   */
  async getItem(key: string): Promise<string | null> {
    try {
      // Check web localStorage first if in browser
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }

      // Check native AsyncStorage
      const native = getNativeStorage();
      if (native) {
        const val = await native.getItem(key);
        if (val !== null) return val;
      }

      return memoryStore[key] ?? null;
    } catch (e) {
      return memoryStore[key] ?? null;
    }
  },

  /**
   * Universal async setter saving across native AsyncStorage and Web
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryStore[key] = value;

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }

      const native = getNativeStorage();
      if (native) {
        await native.setItem(key, value);
      }
    } catch (e) {
      console.warn('storage.setItem error:', e);
    }
  },

  /**
   * Universal async remover
   */
  async removeItem(key: string): Promise<void> {
    try {
      delete memoryStore[key];

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }

      const native = getNativeStorage();
      if (native) {
        await native.removeItem(key);
      }
    } catch (e) {
      console.warn('storage.removeItem error:', e);
    }
  },
};
