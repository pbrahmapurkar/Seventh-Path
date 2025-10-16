// Service Worker for Seventh Path Habit Tracker
const CACHE_NAME = 'seventh-path-v1.0.8';

// Install event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Fetch event - network-first strategy, skip Vite dev requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip service worker for Vite dev server requests
  if (
    event.request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.pathname.startsWith('/@') ||  // Vite special paths
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@react-refresh') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.jsx') ||
    url.pathname.endsWith('.js') && url.searchParams.has('t') // Vite timestamp queries
  ) {
    return; // Let the request pass through
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses for production assets
        if (response.status === 200 && !url.pathname.includes('hot-update')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          }).catch(() => {
            // Ignore cache errors in development
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails (offline support)
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return a simple offline page or error
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const habitId = event.notification.data?.habitId;
  if (habitId) {
    event.waitUntil(
      clients.openWindow(`/habit/${habitId}`)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification actions
self.addEventListener('notificationaction', (event) => {
  const action = event.action;
  const habitId = event.notification.data?.habitId;
  
  event.notification.close();
  
  if (action === 'complete' && habitId) {
    // Handle habit completion
    event.waitUntil(
      clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          clients[0].postMessage({
            type: 'HABIT_COMPLETE',
            habitId: habitId
          });
        }
      })
    );
  } else if (action === 'snooze' && habitId) {
    // Handle snooze
    event.waitUntil(
      clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          clients[0].postMessage({
            type: 'HABIT_SNOOZE',
            habitId: habitId
          });
        }
      })
    );
  }
});
