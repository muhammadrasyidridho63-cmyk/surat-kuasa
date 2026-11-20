const CACHE_NAME = 'esuratkuasa-pwa-v2';
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

// Install: Cache static assets & langsung aktifkan tanpa tunggu restart tab
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate: Bersihkan semua cache lama
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

// Fetch: Network First untuk aset lokal agar selalu mendapatkan tampilan & kode terbaru
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // PENTING: Panggilan ke Google Apps Script TIDAK BOLEH dicache lokal
  if (url.origin.includes('script.google.com') || url.origin.includes('script.googleusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Permintaan CDN eksternal (Tailwind, Google Fonts)
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com') || url.origin.includes('cdn.tailwindcss.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Aset lokal aplikasi: NETWORK FIRST (selalu ambil dari server/disk terbaru saat online, fallback ke cache jika offline)
  event.respondWith(
    fetch(event.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
