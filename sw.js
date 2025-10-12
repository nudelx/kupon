// Service worker with caching disabled

self.addEventListener("install", (event) => {
  event.waitUntil(Promise.resolve().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(Promise.resolve().then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  // Disable caching for now - just pass through all requests
  return;
});
