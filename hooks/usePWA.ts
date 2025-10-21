'use client';

import { useState, useEffect, useCallback } from 'react';
import { getOfflineDB, OfflineDB } from '@/lib/db/offline-db';

export interface PWAState {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  syncInProgress: boolean;
  offlineQueue: number;
}

export interface PWAActions {
  installPWA: () => Promise<void>;
  updatePWA: () => Promise<void>;
  syncOfflineData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
}

export function usePWA(): PWAState & PWAActions {
  const [state, setState] = useState<PWAState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstallable: false,
    isInstalled: false,
    isUpdateAvailable: false,
    syncInProgress: false,
    offlineQueue: 0
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [db, setDb] = useState<OfflineDB | null>(null);

  // Initialize offline database
  useEffect(() => {
    // ❌ DISABLED: Offline database not needed
    return; // Exit early - don't initialize IndexedDB
    
    const initDB = async () => {
      try {
        const offlineDB = await getOfflineDB();
        setDb(offlineDB);

        // Update offline queue count
        const queueItems = await offlineDB.getOfflineQueue();
        setState(prev => ({ ...prev, offlineQueue: queueItems.length }));
      } catch (error) {
        console.error('Failed to initialize offline database:', error);
      }
    };

    initDB();
  }, []);

  // Register service worker
  useEffect(() => {
    // ❌ DISABLED: Service Worker & PWA features not needed
    return; // Exit early - don't register service worker
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          setRegistration(reg);

          // Check if app is running in standalone mode (installed)
          const isStandalone = window.matchMedia(
            '(display-mode: standalone)'
          ).matches;
          setState(prev => ({ ...prev, isInstalled: isStandalone }));

          // Listen for service worker updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  setState(prev => ({ ...prev, isUpdateAvailable: true }));
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.type === 'SYNC_COMPLETE') {
              setState(prev => ({ ...prev, syncInProgress: false }));
              updateOfflineQueueCount();
            } else if (event.data.type === 'SYNC_STARTED') {
              setState(prev => ({ ...prev, syncInProgress: true }));
            }
          });
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      };

      registerSW();
    }
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false
      }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      // Auto-sync when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateOfflineQueueCount = useCallback(async () => {
    if (db) {
      const queueItems = await db.getOfflineQueue();
      setState(prev => ({ ...prev, offlineQueue: queueItems.length }));
    }
  }, [db]);

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installed successfully');
      }

      setDeferredPrompt(null);
      setState(prev => ({ ...prev, isInstallable: false }));
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  }, [deferredPrompt]);

  const updatePWA = useCallback(async () => {
    if (!registration) return;

    try {
      const waitingWorker = registration.waiting;
      if (waitingWorker) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('PWA update failed:', error);
    }
  }, [registration]);

  const syncOfflineData = useCallback(async () => {
    if (!db || !state.isOnline) return;

    setState(prev => ({ ...prev, syncInProgress: true }));

    try {
      const pendingItems = await db.getPendingSyncItems();

      for (const item of pendingItems) {
        try {
          // Process sync item based on operation
          await processSyncItem(item);

          // Remove from sync queue
          await db.removeSyncItem(item.id);

          // Also remove the actual senior record from local storage after successful sync
          if (
            item.operation === 'CREATE_SENIOR' ||
            item.operation === 'UPDATE_SENIOR'
          ) {
            try {
              await db.delete('seniors', item.data.id);
              console.log(
                'Removed synced senior from local storage:',
                item.data.id
              );
            } catch (deleteError) {
              console.warn(
                'Failed to remove synced senior from local storage:',
                deleteError
              );
            }
          }
        } catch (error) {
          console.error('Failed to sync item:', item, error);

          // Increment retry count
          item.retryCount++;
          if (item.retryCount < item.maxRetries) {
            await db.updateSyncItem(item);
          } else {
            console.error('Max retries reached for sync item:', item);
            await db.removeSyncItem(item.id);
          }
        }
      }

      // Process offline queue
      const queueItems = await db.getOfflineQueue();
      for (const queueItem of queueItems) {
        try {
          const response = await fetch(queueItem.url, {
            method: queueItem.method,
            headers: queueItem.headers,
            body: queueItem.body
          });

          if (response.ok) {
            await db.removeFromOfflineQueue(queueItem.id);
          }
        } catch (error) {
          console.error('Failed to process queue item:', queueItem, error);
        }
      }

      await updateOfflineQueueCount();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setState(prev => ({ ...prev, syncInProgress: false }));
    }
  }, [db, state.isOnline, updateOfflineQueueCount]);

  const clearOfflineData = useCallback(async () => {
    if (!db) return;

    try {
      await db.clearAllData();
      setState(prev => ({ ...prev, offlineQueue: 0 }));
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }, [db]);

  return {
    ...state,
    installPWA,
    updatePWA,
    syncOfflineData,
    clearOfflineData
  };
}

// Helper function to process sync items
async function processSyncItem(item: any): Promise<void> {
  const { operation, data } = item;

  // Directly call the data layer for simulation; replace with API routes if needed
  const { SeniorCitizensAPI } = await import('@/lib/api/senior-citizens');

  switch (operation) {
    case 'CREATE_SENIOR':
      await SeniorCitizensAPI.createSeniorCitizen(data);
      break;

    case 'UPDATE_SENIOR':
      await SeniorCitizensAPI.updateSeniorCitizen(data);
      break;

    case 'DELETE_SENIOR':
      await SeniorCitizensAPI.deleteSeniorCitizen(data.id);
      break;

    default:
      console.warn('Unknown sync operation:', operation);
  }
}
