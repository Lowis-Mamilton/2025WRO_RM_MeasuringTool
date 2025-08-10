/* service-worker.js */
const VERSION = 'v1.0.1'; // 每次改檔請 +1，確保快取更新
const PRECACHE = `precache-${VERSION}`;
const RUNTIME  = `runtime-${VERSION}`;

// App Shell：離線必備
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.webmanifest',
  './img/icon192.png',
  './img/icon512.png',
  './img/ELE.png',
  './img/JUN.png',
  './img/SEN.png'
  // 其餘圖片走 runtime 快取（不用一一列）
];

self.addEventListener('install', (event) => {
  console.log('[SW] install');
  event.waitUntil(
    caches.open(PRECACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(k => ![PRECACHE, RUNTIME].includes(k))
        .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 只處理同源 GET
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // 導覽請求：永遠回快取的 index.html（確保離線可用）
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => {
        if (cached) return cached;
        return fetch('./index.html'); // 首次載入時
      })
    );
    return;
  }

  // 圖片：快取優先 + 背景更新
  if (req.destination === 'image') {
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchAndUpdate = fetch(req).then(res => {
          if (res && res.status === 200) {
            caches.open(RUNTIME).then(cache => cache.put(req, res.clone()));
          }
          return res;
        }).catch(() => cached);
        return cached || fetchAndUpdate;
      })
    );
    return;
  }

  // 其他靜態資產（CSS/JS）：快取優先 + 背景更新
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchAndUpdate = fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          caches.open(RUNTIME).then(cache => cache.put(req, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchAndUpdate;
    })
  );
});
