const CACHE_NAME = 'scims-v1.0.0';
const STATIC_CACHE = 'scims-static-v1.0.0';
const DYNAMIC_CACHE = 'scims-dynamic-v1.0.0';
const API_CACHE = 'scims-api-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
  // Add your critical CSS and JS files here
];

// API endpoints to cache
const API_ENDPOINTS = ['/api/auth', '/api/seniors', '/api/announcements'];

// Install event - cache static assets
self.addEventListener('install', event => {
  // console.log('Service Worker installing...'); // Silenced for cleaner console

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        // console.log('Caching static assets...'); // Silenced for cleaner console
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  // console.log('Service Worker activating...'); // Silenced for cleaner console

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with different strategies
  if (request.method === 'GET') {
    // API requests - Network First with fallback to cache
    if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
      event.respondWith(networkFirstWithFallback(request, API_CACHE));
    }
    // Static assets - Cache First
    else if (
      STATIC_ASSETS.some(asset => url.pathname === asset) ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/_next/static/')
    ) {
      event.respondWith(cacheFirstWithFallback(request, STATIC_CACHE));
    }
    // Pages - Stale While Revalidate
    else if (request.destination === 'document') {
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    }
    // Other resources - Network First
    else {
      event.respondWith(networkFirstWithFallback(request, DYNAMIC_CACHE));
    }
  }
  // POST/PUT/DELETE requests - Network only with background sync
  else {
    event.respondWith(handleMutatingRequest(request));
  }
});

// Background Sync for offline form submissions
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'senior-citizen-sync') {
    event.waitUntil(syncSeniorCitizens());
  } else if (event.tag === 'announcement-sync') {
    event.waitUntil(syncAnnouncements());
  }
});

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.urgent || false,
    tag: data.tag || 'default'
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      // Otherwise open new window
      if (clients.openWindow) {
        const url = action ? data?.actionUrl || '/' : data?.url || '/';
        return clients.openWindow(url);
      }
    })
  );
});

// Caching Strategies

async function cacheFirstWithFallback(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return await getOfflineFallback(request);
  }
}

async function networkFirstWithFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache...', error);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return await getOfflineFallback(request);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Fetch from network in background
  const networkResponsePromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Otherwise wait for network
  return (await networkResponsePromise) || (await getOfflineFallback(request));
}

async function handleMutatingRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Store request for background sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    };

    // Store in IndexedDB for sync later
    await storeForSync(requestData);

    // Register background sync
    await self.registration.sync.register('senior-citizen-sync');

    // Return custom offline response
    return new Response(
      JSON.stringify({
        success: false,
        offline: true,
        message: 'Request saved for sync when online'
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function getOfflineFallback(request) {
  const url = new URL(request.url);

  // Return offline page for document requests
  if (request.destination === 'document') {
    const cache = await caches.open(STATIC_CACHE);
    return (
      (await cache.match('/offline.html')) ||
      new Response('Offline', { status: 503 })
    );
  }

  // Return minimal JSON for API requests
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({
        success: false,
        offline: true,
        message: 'This feature requires an internet connection'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Return generic error for other requests
  return new Response('Resource not available offline', { status: 503 });
}

// IndexedDB helpers for background sync
async function storeForSync(requestData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('scims-sync', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pending-requests'], 'readwrite');
      const store = transaction.objectStore('pending-requests');

      store.add({
        ...requestData,
        id: Date.now().toString()
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onupgradeneeded = event => {
      const db = event.target.result;
      const store = db.createObjectStore('pending-requests', { keyPath: 'id' });
      store.createIndex('timestamp', 'timestamp');
    };
  });
}

async function syncSeniorCitizens() {
  console.log('Syncing senior citizens...');

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('scims-sync', 1);

    request.onsuccess = async () => {
      const db = request.result;
      const transaction = db.transaction(['pending-requests'], 'readwrite');
      const store = transaction.objectStore('pending-requests');

      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async () => {
        const pendingRequests = getAllRequest.result;

        for (const pendingRequest of pendingRequests) {
          try {
            // Recreate the original request
            const response = await fetch(pendingRequest.url, {
              method: pendingRequest.method,
              headers: pendingRequest.headers,
              body: pendingRequest.body
            });

            if (response.ok) {
              // Remove from pending requests if successful
              store.delete(pendingRequest.id);
              console.log('Synced request:', pendingRequest.id);
            }
          } catch (error) {
            console.error('Failed to sync request:', pendingRequest.id, error);
          }
        }

        resolve();
      };
    };

    request.onerror = () => reject(request.error);
  });
}

async function syncAnnouncements() {
  console.log('Syncing announcements...');
  // Similar implementation for announcements
}

// Utility functions
function isOnline() {
  return navigator.onLine;
}

function broadcastToClients(message) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    });
  });
}

