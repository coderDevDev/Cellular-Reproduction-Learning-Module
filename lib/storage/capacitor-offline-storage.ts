'use client';

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { getOfflineDB } from '@/lib/db/offline-db';
import type { SeniorCitizen } from '@/types/property';

/**
 * Enhanced offline storage that combines IndexedDB (web) with Capacitor Filesystem (native)
 * for maximum offline capability across all platforms
 */
export class CapacitorOfflineStorage {
  private static isNative = Capacitor.isNativePlatform();
  private static storageDir = Directory.Data;

  // Initialize storage
  static async init(): Promise<void> {
    if (this.isNative) {
      try {
        // Ensure storage directory exists
        await Filesystem.mkdir({
          path: 'scims-data',
          directory: this.storageDir,
          recursive: true
        });
      } catch (error) {
        console.log('Storage directory already exists or created');
      }
    }
  }

  // Senior Citizens Storage
  static async saveSeniors(seniors: SeniorCitizen[]): Promise<boolean> {
    try {
      if (this.isNative) {
        // Save to native filesystem
        await Filesystem.writeFile({
          path: 'scims-data/seniors.json',
          data: JSON.stringify(seniors),
          directory: this.storageDir,
          encoding: Encoding.UTF8
        });
      }

      // Also save to IndexedDB for web compatibility
      const db = await getOfflineDB();
      for (const senior of seniors) {
        await db.saveSenior(senior);
      }

      return true;
    } catch (error) {
      console.error('Failed to save seniors:', error);
      return false;
    }
  }

  static async loadSeniors(): Promise<SeniorCitizen[]> {
    try {
      if (this.isNative) {
        // Load from native filesystem first
        try {
          const result = await Filesystem.readFile({
            path: 'scims-data/seniors.json',
            directory: this.storageDir,
            encoding: Encoding.UTF8
          });
          return JSON.parse(result.data as string);
        } catch (error) {
          console.log('No native seniors data found, checking IndexedDB...');
        }
      }

      // Fallback to IndexedDB
      const db = await getOfflineDB();
      return await db.getSeniors();
    } catch (error) {
      console.error('Failed to load seniors:', error);
      return [];
    }
  }

  static async saveSenior(senior: SeniorCitizen): Promise<boolean> {
    try {
      // Load existing seniors
      const seniors = await this.loadSeniors();

      // Update or add the senior
      const existingIndex = seniors.findIndex(s => s.id === senior.id);
      if (existingIndex >= 0) {
        seniors[existingIndex] = senior;
      } else {
        seniors.push(senior);
      }

      // Save back to storage
      return await this.saveSeniors(seniors);
    } catch (error) {
      console.error('Failed to save senior:', error);
      return false;
    }
  }

  static async deleteSenior(seniorId: string): Promise<boolean> {
    try {
      // Load existing seniors
      const seniors = await this.loadSeniors();

      // Remove the senior
      const filteredSeniors = seniors.filter(s => s.id !== seniorId);

      // Save back to storage
      return await this.saveSeniors(filteredSeniors);
    } catch (error) {
      console.error('Failed to delete senior:', error);
      return false;
    }
  }

  // Image Storage
  static async saveImage(
    imageData: string,
    fileName: string
  ): Promise<string | null> {
    try {
      if (this.isNative) {
        // Save to native filesystem
        const result = await Filesystem.writeFile({
          path: `scims-data/images/${fileName}`,
          data: imageData,
          directory: this.storageDir,
          encoding: Encoding.UTF8
        });
        return result.uri;
      } else {
        // For web, store in IndexedDB or localStorage
        localStorage.setItem(`scims-image-${fileName}`, imageData);
        return `local://${fileName}`;
      }
    } catch (error) {
      console.error('Failed to save image:', error);
      return null;
    }
  }

  static async loadImage(fileName: string): Promise<string | null> {
    try {
      if (this.isNative) {
        // Load from native filesystem
        const result = await Filesystem.readFile({
          path: `scims-data/images/${fileName}`,
          directory: this.storageDir,
          encoding: Encoding.UTF8
        });
        return result.data as string;
      } else {
        // Load from localStorage
        return localStorage.getItem(`scims-image-${fileName}`);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
      return null;
    }
  }

  // Application State Storage
  static async saveAppState(key: string, value: any): Promise<boolean> {
    try {
      if (this.isNative) {
        // Use Capacitor Preferences for simple key-value storage
        await Preferences.set({
          key: `scims-${key}`,
          value: JSON.stringify(value)
        });
      } else {
        localStorage.setItem(`scims-${key}`, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Failed to save app state:', error);
      return false;
    }
  }

  static async loadAppState(key: string): Promise<any | null> {
    try {
      if (this.isNative) {
        const result = await Preferences.get({ key: `scims-${key}` });
        return result.value ? JSON.parse(result.value) : null;
      } else {
        const value = localStorage.getItem(`scims-${key}`);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      console.error('Failed to load app state:', error);
      return null;
    }
  }

  // Sync Queue Storage
  static async saveSyncQueue(queue: any[]): Promise<boolean> {
    try {
      if (this.isNative) {
        await Filesystem.writeFile({
          path: 'scims-data/sync-queue.json',
          data: JSON.stringify(queue),
          directory: this.storageDir,
          encoding: Encoding.UTF8
        });
      }

      // Also save to IndexedDB
      const db = await getOfflineDB();
      for (const item of queue) {
        await db.addToSyncQueue(item.operation, item.data, item.priority);
      }

      return true;
    } catch (error) {
      console.error('Failed to save sync queue:', error);
      return false;
    }
  }

  static async loadSyncQueue(): Promise<any[]> {
    try {
      if (this.isNative) {
        try {
          const result = await Filesystem.readFile({
            path: 'scims-data/sync-queue.json',
            directory: this.storageDir,
            encoding: Encoding.UTF8
          });
          return JSON.parse(result.data as string);
        } catch (error) {
          console.log('No native sync queue found, checking IndexedDB...');
        }
      }

      // Fallback to IndexedDB
      const db = await getOfflineDB();
      return await db.getPendingSyncItems();
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      return [];
    }
  }

  // Announcements Storage
  static async saveAnnouncements(announcements: any[]): Promise<boolean> {
    try {
      if (this.isNative) {
        await Filesystem.writeFile({
          path: 'scims-data/announcements.json',
          data: JSON.stringify(announcements),
          directory: this.storageDir,
          encoding: Encoding.UTF8
        });
      }

      // Also save to IndexedDB
      const db = await getOfflineDB();
      await db.saveAnnouncements(announcements);

      return true;
    } catch (error) {
      console.error('Failed to save announcements:', error);
      return false;
    }
  }

  static async loadAnnouncements(): Promise<any[]> {
    try {
      if (this.isNative) {
        try {
          const result = await Filesystem.readFile({
            path: 'scims-data/announcements.json',
            directory: this.storageDir,
            encoding: Encoding.UTF8
          });
          return JSON.parse(result.data as string);
        } catch (error) {
          console.log('No native announcements found, checking IndexedDB...');
        }
      }

      // Fallback to IndexedDB
      const db = await getOfflineDB();
      return await db.getAnnouncements();
    } catch (error) {
      console.error('Failed to load announcements:', error);
      return [];
    }
  }

  // Storage Statistics
  static async getStorageStats(): Promise<{
    totalSeniors: number;
    totalImages: number;
    totalAnnouncements: number;
    queueSize: number;
    storageSize?: string;
  }> {
    try {
      const seniors = await this.loadSeniors();
      const announcements = await this.loadAnnouncements();
      const queue = await this.loadSyncQueue();

      let imageCount = 0;
      let storageSize = 'Unknown';

      if (this.isNative) {
        try {
          // Try to count images in the images directory
          const imageFiles = await Filesystem.readdir({
            path: 'scims-data/images',
            directory: this.storageDir
          });
          imageCount = imageFiles.files.length;
        } catch (error) {
          console.log('No images directory found');
        }
      } else {
        // Count localStorage images
        const keys = Object.keys(localStorage);
        imageCount = keys.filter(key => key.startsWith('scims-image-')).length;

        // Estimate storage size
        const totalSize = keys.reduce((size, key) => {
          return size + (localStorage.getItem(key)?.length || 0);
        }, 0);
        storageSize = `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
      }

      return {
        totalSeniors: seniors.length,
        totalImages: imageCount,
        totalAnnouncements: announcements.length,
        queueSize: queue.length,
        storageSize
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalSeniors: 0,
        totalImages: 0,
        totalAnnouncements: 0,
        queueSize: 0,
        storageSize: 'Error'
      };
    }
  }

  // Clear all data
  static async clearAllData(): Promise<boolean> {
    try {
      if (this.isNative) {
        // Delete the entire scims-data directory
        try {
          await Filesystem.rmdir({
            path: 'scims-data',
            directory: this.storageDir,
            recursive: true
          });
        } catch (error) {
          console.log('No data directory to clear');
        }

        // Clear preferences
        const keys = ['user-session', 'app-settings', 'sync-status'];
        for (const key of keys) {
          try {
            await Preferences.remove({ key: `scims-${key}` });
          } catch (error) {
            console.log(`Preference ${key} not found`);
          }
        }
      } else {
        // Clear localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('scims-')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Clear IndexedDB
      const db = await getOfflineDB();
      await db.clearAllData();

      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }
}
