const CACHE_NAME = 'novotaxi-v1';
const CACHE_URLS = [
  '/novotaxi/novotaxi.html',
  '/novotaxi/manifest.json'
];

// Встановлення - кешуємо основні файли
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Активація - видаляємо старий кеш
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - спочатку мережа, потім кеш
self.addEventListener('fetch', event => {
  // Firebase і зовнішні API — тільки через мережу
  if (event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic') ||
      event.request.url.includes('openstreetmap') ||
      event.request.url.includes('nominatim')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', {status: 503})));
    return;
  }
  // Решта - кеш або мережа
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
