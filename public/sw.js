// PathWAI Service Worker for Offline Mobility Access
const CACHE_NAMES = {
  STATIC: 'pathwayai-static-v1',
  DATA: 'pathwayai-mobility-data-v1',
  ASSETS: 'pathwayai-assets-v1'
};

const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC).then((cache) => {
      console.log('[ServiceWorker] Pre-caching application shell');
      return cache.addAll(STATIC_URLS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Service Worker Activation & Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log('[ServiceWorker] Removing stale cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interception: Network First for API routes with Cache Fallback, Cache First for Static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or external extensions
  if (event.request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Handle API Requests (Network First, fallback to cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAMES.DATA).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[ServiceWorker] Network request failed. Serving from offline cache:', event.request.url);
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return fallback JSON for API offline status
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'You are currently in offline mode. Displaying cached local mobility state.',
              timestamp: new Date().toISOString()
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Handle Static & Application Shell Navigation (Stale-While-Revalidate / Cache First)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAMES.STATIC).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If navigation HTML request fails and no cache, serve index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Message Receiver for Manual Synchronization from Application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CRITICAL_MOBILITY_DATA') {
    const { payload } = event.data;
    caches.open(CACHE_NAMES.DATA).then((cache) => {
      const dummyRequest = new Request('/api/offline-vault-snapshot');
      const mockResponse = new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      cache.put(dummyRequest, mockResponse);
      console.log('[ServiceWorker] Offline Critical Mobility Vault Snapshot Updated!');
    });
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
