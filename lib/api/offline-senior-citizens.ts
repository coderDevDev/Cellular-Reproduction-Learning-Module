'use client';

import { getOfflineDB } from '@/lib/db/offline-db';
import type { SeniorCitizen } from '@/types/property';

export interface OfflineResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  offline?: boolean;
  synced?: boolean;
}

export class OfflineSeniorCitizensAPI {
  private static async getDB() {
    return await getOfflineDB();
  }

  // Check if we're online
  private static isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : false;
  }

  // Create a senior citizen (works offline)
  static async createSeniorCitizen(
    data: any
  ): Promise<OfflineResponse<SeniorCitizen>> {
    const db = await this.getDB();

    try {
      // Generate temporary ID if offline
      const id =
        data.id ||
        `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const seniorData = {
        ...data,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        offline: !this.isOnline()
      };

      if (this.isOnline()) {
        try {
          // Try online first
          const { SeniorCitizensAPI } = await import('./senior-citizens');
          const result = await SeniorCitizensAPI.createSeniorCitizen(data);

          if (result.success && result.data) {
            // Save to offline storage for caching
            await db.saveSenior(result.data);
            return {
              success: true,
              data: result.data,
              offline: false,
              synced: true
            };
          }
        } catch (error) {
          console.log('Online create failed, falling back to offline storage');
        }
      }

      // Fallback to offline storage
      await db.saveSenior(seniorData);

      return {
        success: true,
        data: seniorData,
        offline: true,
        synced: false
      };
    } catch (error) {
      console.error('Failed to create senior citizen:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        offline: !this.isOnline()
      };
    }
  }

  // Update a senior citizen (works offline)
  static async updateSeniorCitizen(
    id: string,
    data: any
  ): Promise<OfflineResponse<SeniorCitizen>> {
    const db = await this.getDB();

    try {
      const updatedData = {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
        offline: !this.isOnline()
      };

      if (this.isOnline()) {
        try {
          // Try online first
          const { SeniorCitizensAPI } = await import('./senior-citizens');
          const result = await SeniorCitizensAPI.updateSeniorCitizen(id, data);

          if (result.success && result.data) {
            // Update offline cache
            await db.updateSenior(result.data);
            return {
              success: true,
              data: result.data,
              offline: false,
              synced: true
            };
          }
        } catch (error) {
          console.log('Online update failed, falling back to offline storage');
        }
      }

      // Fallback to offline storage
      await db.updateSenior(updatedData);

      return {
        success: true,
        data: updatedData,
        offline: true,
        synced: false
      };
    } catch (error) {
      console.error('Failed to update senior citizen:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        offline: !this.isOnline()
      };
    }
  }

  // Delete a senior citizen (works offline)
  static async deleteSeniorCitizen(
    id: string
  ): Promise<OfflineResponse<boolean>> {
    const db = await this.getDB();

    try {
      if (this.isOnline()) {
        try {
          // Try online first
          const { SeniorCitizensAPI } = await import('./senior-citizens');
          const result = await SeniorCitizensAPI.deleteSeniorCitizen(id);

          if (result.success) {
            // Remove from offline cache
            await db.deleteSenior(id);
            return {
              success: true,
              data: true,
              offline: false,
              synced: true
            };
          }
        } catch (error) {
          console.log('Online delete failed, falling back to offline storage');
        }
      }

      // Fallback to offline storage
      await db.deleteSenior(id);

      return {
        success: true,
        data: true,
        offline: true,
        synced: false
      };
    } catch (error) {
      console.error('Failed to delete senior citizen:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        offline: !this.isOnline()
      };
    }
  }

  // Get a single senior citizen
  static async getSeniorCitizen(
    id: string
  ): Promise<OfflineResponse<SeniorCitizen>> {
    const db = await this.getDB();

    try {
      if (this.isOnline()) {
        try {
          // Try online first
          const { SeniorCitizensAPI } = await import('./senior-citizens');
          const result = await SeniorCitizensAPI.getSeniorCitizen(id);

          if (result.success && result.data) {
            // Update offline cache
            await db.saveSenior(result.data);
            return {
              success: true,
              data: result.data,
              offline: false,
              synced: true
            };
          }
        } catch (error) {
          console.log('Online get failed, falling back to offline storage');
        }
      }

      // Fallback to offline storage
      const offlineData = await db.get('seniors', id);

      if (offlineData) {
        return {
          success: true,
          data: offlineData as SeniorCitizen,
          offline: true,
          synced: false
        };
      }

      return {
        success: false,
        error: 'Senior citizen not found',
        offline: !this.isOnline()
      };
    } catch (error) {
      console.error('Failed to get senior citizen:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        offline: !this.isOnline()
      };
    }
  }

  // Get all senior citizens with optional filtering
  static async getAllSeniorCitizens(
    barangay?: string
  ): Promise<OfflineResponse<SeniorCitizen[]>> {
    const db = await this.getDB();

    try {
      if (this.isOnline()) {
        try {
          // Try online first
          const { SeniorCitizensAPI } = await import('./senior-citizens');
          const result = await SeniorCitizensAPI.getAllSeniorCitizens(barangay);

          if (result.success && result.data) {
            // Update offline cache
            for (const senior of result.data) {
              await db.saveSenior(senior);
            }

            const filteredData = barangay
              ? result.data.filter(s => s.barangay === barangay)
              : result.data;

            return {
              success: true,
              data: filteredData,
              offline: false,
              synced: true
            };
          }
        } catch (error) {
          console.log('Online getAll failed, falling back to offline storage');
        }
      }

      // Fallback to offline storage
      const filters = barangay ? { barangay } : undefined;
      const offlineData = await db.getSeniors(filters);

      return {
        success: true,
        data: offlineData,
        offline: true,
        synced: false
      };
    } catch (error) {
      console.error('Failed to get senior citizens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        offline: !this.isOnline(),
        data: []
      };
    }
  }

  // Get offline statistics
  static async getOfflineStats(): Promise<{
    totalOfflineRecords: number;
    pendingSyncItems: number;
    lastSyncTime: string | null;
    offlineQueueSize: number;
  }> {
    const db = await this.getDB();

    try {
      const [seniors, pendingSync, offlineQueue, lastSync] = await Promise.all([
        db.getAll('seniors'),
        db.getPendingSyncItems(),
        db.getOfflineQueue(),
        db.getPreference('lastSyncTime')
      ]);

      return {
        totalOfflineRecords: seniors.length,
        pendingSyncItems: pendingSync.length,
        lastSyncTime: lastSync,
        offlineQueueSize: offlineQueue.length
      };
    } catch (error) {
      console.error('Failed to get offline stats:', error);
      return {
        totalOfflineRecords: 0,
        pendingSyncItems: 0,
        lastSyncTime: null,
        offlineQueueSize: 0
      };
    }
  }

  // Manual sync with server
  static async syncWithServer(): Promise<
    OfflineResponse<{ syncedItems: number }>
  > {
    if (!this.isOnline()) {
      return {
        success: false,
        error: 'Cannot sync while offline',
        offline: true
      };
    }

    const db = await this.getDB();

    try {
      const pendingItems = await db.getPendingSyncItems();
      let syncedCount = 0;

      for (const item of pendingItems) {
        try {
          // Process each pending sync item
          switch (item.operation) {
            case 'CREATE_SENIOR':
              const createResult = await this.createSeniorCitizen(item.data);
              if (createResult.success) syncedCount++;
              break;

            case 'UPDATE_SENIOR':
              const updateResult = await this.updateSeniorCitizen(
                item.data.id,
                item.data
              );
              if (updateResult.success) syncedCount++;
              break;

            case 'DELETE_SENIOR':
              const deleteResult = await this.deleteSeniorCitizen(item.data.id);
              if (deleteResult.success) syncedCount++;
              break;
          }

          // Remove successfully synced item
          await db.removeSyncItem(item.id);
        } catch (error) {
          console.error('Failed to sync item:', item, error);
        }
      }

      // Update last sync time
      await db.savePreference('lastSyncTime', new Date().toISOString());

      return {
        success: true,
        data: { syncedItems: syncedCount },
        offline: false,
        synced: true
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        offline: false
      };
    }
  }

  // Clear offline data
  static async clearOfflineData(): Promise<OfflineResponse<boolean>> {
    const db = await this.getDB();

    try {
      await db.clearAllData();
      return {
        success: true,
        data: true,
        offline: !this.isOnline()
      };
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear data',
        offline: !this.isOnline()
      };
    }
  }
}

