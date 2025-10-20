// Service worker for Kupon PWA - Version-based caching strategy

// Version from package.json - update this when you want to force cache refresh
const APP_VERSION = "0.0.4";
const CACHE_NAME = `kupon-essential-v${APP_VERSION}`;
const ESSENTIAL_ASSETS = [
  "/kupon/manifest.webmanifest",
  "/kupon/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  console.log(`Service worker installing for version ${APP_VERSION}...`);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log(`Caching essential assets for version ${APP_VERSION}`);
        return cache.addAll(ESSENTIAL_ASSETS);
      })
      .then(() => {
        console.log(`Cache created: ${CACHE_NAME}`);
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log(`Service worker activating for version ${APP_VERSION}...`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        console.log(`Found ${cacheNames.length} existing caches:`, cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log(`Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            } else {
              console.log(`Keeping current cache: ${cacheName}`);
            }
          })
        );
      })
      .then(() => {
        console.log(`Cache cleanup complete for version ${APP_VERSION}`);
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Only cache essential assets, let everything else go to network
  const url = new URL(event.request.url);
  const isEssentialAsset = ESSENTIAL_ASSETS.some((asset) =>
    url.pathname.includes(asset.replace("/kupon/", ""))
  );

  if (isEssentialAsset) {
    // Cache essential assets (manifest, icons)
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            // Cache the response for future use
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return fetchResponse;
          })
        );
      })
    );
  } else {
    // For everything else, just fetch from network without caching
    event.respondWith(fetch(event.request));
  }
});
