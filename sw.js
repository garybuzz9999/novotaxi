const CACHE_NAME = 'novotaxi-v2';
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

// Fetch - відповідаємо з кешу
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// ========== FCM ФОНОВИЙ ПУШ ==========
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
const VAPID_KEY = 'BCVoguNPGdvdcIC5dLfXQG1ZMM99yZJGXYnFracgxRMYOtlF0pyQbiO2jj8JpL1CMtSZ_l06hvE4NF7lYME7blw';
firebase.initializeApp({
  apiKey: "AIzaSyDixXJ-eggW5gE_VaubAM827lUWG7-v4rU",
  authDomain: "novotaxi-fcb7f.firebaseapp.com",
  databaseURL: "https://novotaxi-fcb7f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "novotaxi-fcb7f",
  storageBucket: "novotaxi-fcb7f.firebasestorage.app",
  messagingSenderId: "6765698996",
  appId: "1:6765698996:web:023685ec3c60250cf7dce1"
});

const messaging = firebase.messaging();

// Обробка фонового пушу — коли екран вимкнений
messaging.onBackgroundMessage(payload => {
  console.log('Фоновий пуш отримано:', payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || '🚕 NovoTaxi', {
    body: body || 'Нове замовлення!',
    icon: icon || '/novotaxi/icon-192.png',
    badge: '/novotaxi/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true, // не зникає поки не натиснув
    data: payload.data || {}
  });
});

// Клік по сповіщенню — відкриває додаток
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/novotaxi/') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/novotaxi/novotaxi.html');
    })
  );
});
