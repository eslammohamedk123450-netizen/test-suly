// SULY AI Service Worker
const CACHE_NAME = 'suly-ai-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle API requests directly
  if (event.request.url.includes('/api/')) {
    return;
  }
  // Optional cache-first strategy for static assets can be added if needed
});
