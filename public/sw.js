// Service Worker for Seventh Path Habit Tracker
const CACHE_NAME = 'seventh-path-v1.0.8';

// Install event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Fetch event - network-first strategy for development
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        // Only cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
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
