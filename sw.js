const CACHE_NAME = 'esuratkuasa-pwa-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/config.js',
  './js/app.js',
  './icon-192.png',
  './icon-512.png'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for GAS API, Stale-While-Revalidate for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // PENTING: Panggilan ke Google Apps Script TIDAK BOLEH dicache lokal
  if (url.origin.includes('script.google.com') || url.origin.includes('script.googleusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Permintaan font atau CDN eksternal (Tailwind, Google Fonts)
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com') || url.origin.includes('cdn.tailwindcss.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((res) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  // Aset lokal aplikasi (Cache First, fallback ke Network)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => {
        // Fallback untuk navigasi offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
