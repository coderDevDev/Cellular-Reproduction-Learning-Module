'use client';

// IndexedDB wrapper for offline data storage
export class OfflineDB {
  private dbName = 'SCIMS_OfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Define object stores
  private stores = {
    seniors: 'seniors',
    announcements: 'announcements',
    pendingSync: 'pendingSync',
    userPreferences: 'userPreferences',
    offlineQueue: 'offlineQueue'
  };

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        // console.log('IndexedDB initialized successfully'); // Silenced for cleaner console
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    // Seniors store
    if (!db.objectStoreNames.contains(this.stores.seniors)) {
      const seniorsStore = db.createObjectStore(this.stores.seniors, {
        keyPath: 'id'
      });
      seniorsStore.createIndex('barangay', 'barangay', { unique: false });
      seniorsStore.createIndex('status', 'status', { unique: false });
      seniorsStore.createIndex('lastModified', 'lastModified', {
        unique: false
      });
    }

    // Announcements store
    if (!db.objectStoreNames.contains(this.stores.announcements)) {
      const announcementsStore = db.createObjectStore(
        this.stores.announcements,
        {
          keyPath: 'id'
        }
      );
      announcementsStore.createIndex('createdAt', 'createdAt', {
        unique: false
      });
      announcementsStore.createIndex('urgent', 'isUrgent', { unique: false });
    }

    // Pending sync store for operations that need to be synced
    if (!db.objectStoreNames.contains(this.stores.pendingSync)) {
      const pendingSyncStore = db.createObjectStore(this.stores.pendingSync, {
        keyPath: 'id',
        autoIncrement: true
      });
      pendingSyncStore.createIndex('operation', 'operation', { unique: false });
      pendingSyncStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // User preferences store
    if (!db.objectStoreNames.contains(this.stores.userPreferences)) {
      db.createObjectStore(this.stores.userPreferences, {
        keyPath: 'key'
      });
    }

    // Offline queue for failed network requests
    if (!db.objectStoreNames.contains(this.stores.offlineQueue)) {
      const queueStore = db.createObjectStore(this.stores.offlineQueue, {
        keyPath: 'id',
        autoIncrement: true
      });
      queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      queueStore.createIndex('priority', 'priority', { unique: false });
    }
  }

  // Generic CRUD operations
  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Senior Citizens specific methods
  async saveSenior(senior: any): Promise<void> {
    const seniorWithTimestamp = {
      ...senior,
      lastModified: new Date().toISOString(),
      offlineCreated: !navigator.onLine
    };

    await this.put(this.stores.seniors, seniorWithTimestamp);

    // If offline, add to sync queue
    if (!navigator.onLine) {
      await this.addToSyncQueue('CREATE_SENIOR', seniorWithTimestamp);
    }
  }

  async updateSenior(senior: any): Promise<void> {
    const seniorWithTimestamp = {
      ...senior,
      lastModified: new Date().toISOString(),
      offlineModified: !navigator.onLine
    };

    await this.put(this.stores.seniors, seniorWithTimestamp);

    // If offline, add to sync queue
    if (!navigator.onLine) {
      await this.addToSyncQueue('UPDATE_SENIOR', seniorWithTimestamp);
    }
  }

  async deleteSenior(seniorId: string): Promise<void> {
    await this.delete(this.stores.seniors, seniorId);

    // If offline, add to sync queue
    if (!navigator.onLine) {
      await this.addToSyncQueue('DELETE_SENIOR', { id: seniorId });
    }
  }

  async getSeniors(filters?: {
    barangay?: string;
    status?: string;
  }): Promise<any[]> {
    const allSeniors = await this.getAll(this.stores.seniors);

    if (!filters) return allSeniors;

    return allSeniors.filter(senior => {
      if (filters.barangay && senior.barangay !== filters.barangay)
        return false;
      if (filters.status && senior.status !== filters.status) return false;
      return true;
    });
  }

  // Sync queue methods
  async addToSyncQueue(
    operation: string,
    data: any,
    priority: number = 1
  ): Promise<void> {
    const queueItem = {
      operation,
      data,
      priority,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3
    };

    await this.put(this.stores.pendingSync, queueItem);
  }

  async getPendingSyncItems(): Promise<any[]> {
    return this.getAll(this.stores.pendingSync);
  }

  async removeSyncItem(id: number): Promise<void> {
    await this.delete(this.stores.pendingSync, id.toString());
  }

  async updateSyncItem(item: any): Promise<void> {
    await this.put(this.stores.pendingSync, item);
  }

  // Announcements methods
  async saveAnnouncements(announcements: any[]): Promise<void> {
    const transaction = this.db!.transaction(
      [this.stores.announcements],
      'readwrite'
    );
    const store = transaction.objectStore(this.stores.announcements);

    // Clear existing and add new
    await store.clear();

    for (const announcement of announcements) {
      await store.put({
        ...announcement,
        cachedAt: new Date().toISOString()
      });
    }
  }

  async getAnnouncements(): Promise<any[]> {
    return this.getAll(this.stores.announcements);
  }

  // User preferences
  async savePreference(key: string, value: any): Promise<void> {
    await this.put(this.stores.userPreferences, { key, value });
  }

  async getPreference(key: string): Promise<any> {
    const result = await this.get(this.stores.userPreferences, key);
    return result ? (result as any).value : null;
  }

  // Offline queue for failed requests
  async addToOfflineQueue(request: {
    url: string;
    method: string;
    headers: any;
    body: any;
    priority?: number;
  }): Promise<void> {
    const queueItem = {
      ...request,
      timestamp: new Date().toISOString(),
      priority: request.priority || 1,
      retryCount: 0
    };

    await this.put(this.stores.offlineQueue, queueItem);
  }

  async getOfflineQueue(): Promise<any[]> {
    return this.getAll(this.stores.offlineQueue);
  }

  async removeFromOfflineQueue(id: number): Promise<void> {
    await this.delete(this.stores.offlineQueue, id.toString());
  }

  // Utility methods
  async getDatabaseSize(): Promise<{ storeName: string; count: number }[]> {
    const sizes = [];

    for (const storeName of Object.values(this.stores)) {
      const count = (await this.getAll(storeName)).length;
      sizes.push({ storeName, count });
    }

    return sizes;
  }

  async clearAllData(): Promise<void> {
    for (const storeName of Object.values(this.stores)) {
      await this.clear(storeName);
    }
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
let offlineDBInstance: OfflineDB | null = null;

export const getOfflineDB = async (): Promise<OfflineDB> => {
  if (!offlineDBInstance) {
    offlineDBInstance = new OfflineDB();
    await offlineDBInstance.init();
  }
  return offlineDBInstance;
};

// Types for offline operations
export interface OfflineSeniorCitizen {
  id: string;
  firstName: string;
  lastName: string;
  barangay: string;
  status: 'active' | 'inactive' | 'deceased';
  lastModified: string;
  offlineCreated?: boolean;
  offlineModified?: boolean;
  [key: string]: any;
}

export interface SyncQueueItem {
  id?: number;
  operation:
    | 'CREATE_SENIOR'
    | 'UPDATE_SENIOR'
    | 'DELETE_SENIOR'
    | 'CREATE_ANNOUNCEMENT';
  data: any;
  priority: number;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineQueueItem {
  id?: number;
  url: string;
  method: string;
  headers: any;
  body: any;
  timestamp: string;
  priority: number;
  retryCount: number;
}
