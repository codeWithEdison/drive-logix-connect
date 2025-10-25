import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

/**
 * Secure storage service using Capacitor Preferences
 * Replaces localStorage with native secure storage
 */
export class SecureStorage {
  /**
   * Store a value securely
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({
        key,
        value,
      });
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value securely
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all stored values
   */
  static async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  }

  /**
   * Get all keys
   */
  static async keys(): Promise<string[]> {
    try {
      const result = await Preferences.keys();
      return result.keys;
    } catch (error) {
      console.error("Error getting keys:", error);
      return [];
    }
  }

  /**
   * Store an object (JSON stringify)
   */
  static async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await this.setItem(key, jsonString);
    } catch (error) {
      console.error(`Error storing object ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve an object (JSON parse)
   */
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.getItem(key);
      if (jsonString === null) {
        return null;
      }
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`Error retrieving object ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if a key exists
   */
  static async hasKey(key: string): Promise<boolean> {
    try {
      const keys = await this.keys();
      return keys.includes(key);
    } catch (error) {
      console.error(`Error checking key ${key}:`, error);
      return false;
    }
  }
}

// Fallback to localStorage for web development
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      // Check if we're in a Capacitor environment
      if (Capacitor.isNativePlatform()) {
        return SecureStorage.setItem(key, value);
      } else {
        // Fallback to localStorage for web
        localStorage.setItem(key, value);
      }
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (typeof window !== "undefined" && window.localStorage) {
      if (Capacitor.isNativePlatform()) {
        return SecureStorage.getItem(key);
      } else {
        return localStorage.getItem(key);
      }
    }
    return null;
  },

  async removeItem(key: string): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      if (Capacitor.isNativePlatform()) {
        return SecureStorage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
    }
  },

  async clear(): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      if (Capacitor.isNativePlatform()) {
        return SecureStorage.clear();
      } else {
        localStorage.clear();
      }
    }
  },

  async setObject<T>(key: string, value: T): Promise<void> {
    if (typeof window !== "undefined" && window.localStorage) {
      if (Capacitor.isNativePlatform()) {
        return SecureStorage.setObject(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  },

  async getObject<T>(key: string): Promise<T | null> {
    if (typeof window !== "undefined" && window.localStorage) {
      if (Capacitor.isNativePlatform()) {
        return SecureStorage.getObject<T>(key);
      } else {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    }
    return null;
  },
};

export default storage;
