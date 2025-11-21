import { Capacitor } from "@capacitor/core";

export interface CacheItem<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
  version: number;
}

export interface CacheConfig {
  maxAge: number; // in milliseconds
  maxSize: number; // maximum number of items
  version: number; // cache version for invalidation
}

class OfflineStorageService {
  private dbName = "LovewayLogisticsOfflineDB";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private config: CacheConfig = {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 1000,
    version: 1,
  };

  /**
   * Initialize IndexedDB
   */
  async initialize(): Promise<void> {
    if (!this.isIndexedDBSupported()) {
      console.warn("IndexedDB not supported, using localStorage fallback");
      return;
    }

    try {
      this.db = await this.openDatabase();
      console.log("Offline storage initialized");
    } catch (error) {
      console.error("Failed to initialize offline storage:", error);
    }
  }

  /**
   * Check if IndexedDB is supported
   */
  private isIndexedDBSupported(): boolean {
    return typeof window !== "undefined" && "indexedDB" in window;
  }

  /**
   * Open IndexedDB database
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("cache")) {
          const cacheStore = db.createObjectStore("cache", { keyPath: "key" });
          cacheStore.createIndex("timestamp", "timestamp", { unique: false });
          cacheStore.createIndex("expiresAt", "expiresAt", { unique: false });
        }

        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", { keyPath: "key" });
        }

        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };
    });
  }

  /**
   * Store data in cache
   */
  async setItem<T>(key: string, data: T, maxAge?: number): Promise<void> {
    if (!this.db) {
      // Fallback to localStorage
      localStorage.setItem(key, JSON.stringify(data));
      return;
    }

    try {
      const expiresAt = maxAge ? Date.now() + maxAge : undefined;
      const item: CacheItem<T> = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt,
        version: this.config.version,
      };

      const transaction = this.db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      await this.promisifyRequest(store.put(item));

      // Clean up expired items
      await this.cleanupExpiredItems();
    } catch (error) {
      console.error("Error storing item:", error);
    }
  }

  /**
   * Get data from cache
   */
  async getItem<T>(key: string): Promise<T | null> {
    if (!this.db) {
      // Fallback to localStorage
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }

    try {
      const transaction = this.db.transaction(["cache"], "readonly");
      const store = transaction.objectStore("cache");
      const item = await this.promisifyRequest<CacheItem<T>>(store.get(key));

      if (!item) return null;

      // Check if expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error("Error retrieving item:", error);
      return null;
    }
  }

  /**
   * Remove item from cache
   */
  async removeItem(key: string): Promise<void> {
    if (!this.db) {
      localStorage.removeItem(key);
      return;
    }

    try {
      const transaction = this.db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      await this.promisifyRequest(store.delete(key));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    if (!this.db) {
      localStorage.clear();
      return;
    }

    try {
      const transaction = this.db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      await this.promisifyRequest(store.clear());
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }

  /**
   * Store image data
   */
  async storeImage(key: string, imageData: Blob): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(["images"], "readwrite");
      const store = transaction.objectStore("images");
      await this.promisifyRequest(
        store.put({ key, data: imageData, timestamp: Date.now() })
      );
    } catch (error) {
      console.error("Error storing image:", error);
    }
  }

  /**
   * Get image data
   */
  async getImage(key: string): Promise<Blob | null> {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(["images"], "readonly");
      const store = transaction.objectStore("images");
      const result = await this.promisifyRequest<{ data: Blob }>(
        store.get(key)
      );
      return result?.data || null;
    } catch (error) {
      console.error("Error retrieving image:", error);
      return null;
    }
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: any): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(["syncQueue"], "readwrite");
      const store = transaction.objectStore("syncQueue");
      await this.promisifyRequest(
        store.add({
          ...item,
          timestamp: Date.now(),
          status: "pending",
        })
      );
    } catch (error) {
      console.error("Error adding to sync queue:", error);
    }
  }

  /**
   * Get sync queue items
   */
  async getSyncQueue(): Promise<any[]> {
    if (!this.db) return [];

    try {
      const transaction = this.db.transaction(["syncQueue"], "readonly");
      const store = transaction.objectStore("syncQueue");
      const result = await this.promisifyRequest<any[]>(store.getAll());
      return result || [];
    } catch (error) {
      console.error("Error getting sync queue:", error);
      return [];
    }
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(id: number): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(["syncQueue"], "readwrite");
      const store = transaction.objectStore("syncQueue");
      await this.promisifyRequest(store.delete(id));
    } catch (error) {
      console.error("Error removing from sync queue:", error);
    }
  }

  /**
   * Clean up expired items
   */
  private async cleanupExpiredItems(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(["cache"], "readwrite");
      const store = transaction.objectStore("cache");
      const index = store.index("expiresAt");
      const range = IDBKeyRange.upperBound(Date.now());

      const expiredItems = await this.promisifyRequest<any[]>(
        index.getAll(range)
      );

      for (const item of expiredItems) {
        await this.promisifyRequest(store.delete(item.key));
      }
    } catch (error) {
      console.error("Error cleaning up expired items:", error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    size: number;
    oldestItem: number;
    newestItem: number;
  }> {
    if (!this.db) {
      return { size: localStorage.length, oldestItem: 0, newestItem: 0 };
    }

    try {
      const transaction = this.db.transaction(["cache"], "readonly");
      const store = transaction.objectStore("cache");
      const allItems = await this.promisifyRequest<CacheItem[]>(store.getAll());

      if (allItems.length === 0) {
        return { size: 0, oldestItem: 0, newestItem: 0 };
      }

      const timestamps = allItems.map((item) => item.timestamp);
      return {
        size: allItems.length,
        oldestItem: Math.min(...timestamps),
        newestItem: Math.max(...timestamps),
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return { size: 0, oldestItem: 0, newestItem: 0 };
    }
  }

  /**
   * Promisify IndexedDB request
   */
  private promisifyRequest<T = any>(request: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if item exists in cache
   */
  async hasItem(key: string): Promise<boolean> {
    const item = await this.getItem(key);
    return item !== null;
  }

  /**
   * Get all cache keys
   */
  async getAllKeys(): Promise<string[]> {
    if (!this.db) {
      return Object.keys(localStorage);
    }

    try {
      const transaction = this.db.transaction(["cache"], "readonly");
      const store = transaction.objectStore("cache");
      const allItems = await this.promisifyRequest<CacheItem[]>(store.getAll());
      return allItems.map((item) => item.key);
    } catch (error) {
      console.error("Error getting all keys:", error);
      return [];
    }
  }
}

export const offlineStorageService = new OfflineStorageService();
export default offlineStorageService;
