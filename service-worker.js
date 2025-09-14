// v1 – Ricci Lab no-op SW
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  // passthrough – no caching, just network
  event.respondWith(fetch(event.request));
});
