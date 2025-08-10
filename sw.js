const APP_CACHE = 'app-cache-v3';
const RUNTIME_CACHE = 'runtime-v3';

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './pwa.js',
  './manifest.webmanifest',
  // mats（請確認就在 /img/）
  './img/ELE.png',
  './img/JUN.png',
  './img/SEN.png',
  // icons
  './img/icon192.png',
  './img/icon192.png',
  './img/icon192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((c) => c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => {
        if (![APP_CACHE, RUNTIME_CACHE].includes(k)) return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  if (req.destination === 'image') {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then(c => c.put(req, copy));
        return res;
      }))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
