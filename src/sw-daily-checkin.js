/* SSBJJ Daily Check-in Offline Service Worker */
const CACHE_NAME = 'ssbjj-checkin-v1';
const PRECACHE_URLS = [
  '/daily-checkin',
  '/daily-checkin.html',
  '/js/daily-checkin.js?v=mat-v1'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Pre-cache error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key.startsWith('ssbjj-checkin-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle requests in our origin
  if (url.origin !== self.location.origin) return;

  // Handle /daily-checkin navigation
  if (event.request.mode === 'navigate' && url.pathname.startsWith('/daily-checkin')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/daily-checkin.html') || caches.match('/daily-checkin');
      })
    );
    return;
  }

  // Handle JS and assets
  if (url.pathname.includes('/daily-checkin.js')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }
});
