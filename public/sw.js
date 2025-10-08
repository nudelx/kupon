const CACHE_NAME = 'kupon-cache-v1';
const urlsToCache = [
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      const promises = urlsToCache.map((url) => {
        return cache.add(url).catch((error) => {
          console.error(`Failed to cache ${url}:`, error);
        });
      });
      return Promise.all(promises);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
