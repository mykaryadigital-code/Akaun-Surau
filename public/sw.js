self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Pass-through fetch handler semata-mata untuk memenuhi syarat pemasangan PWA Chrome/Android
  e.respondWith(fetch(e.request));
});
