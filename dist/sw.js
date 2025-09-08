// Service Worker for Seventh Path Habit Tracker
const CACHE_NAME = 'seventh-path-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
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
