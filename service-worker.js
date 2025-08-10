/* service-worker.js */
const VERSION = 'v1.0.0';           // 每次調整請 +1
const PRECACHE = `precache-${VERSION}`;
const RUNTIME  = `runtime-${VERSION}`;

const ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.webmanifest',
  // 圖示檔放好後再加：
   './img/icon192.png',
   './img/icon512.png',
   './img/ELE.png',
   './img/JUN.png',
   './img/SEN.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE);
    for (const url of ASSETS) {
      try { await cache.add(url); } catch (e) { console.warn('[SW] skip:', url, e); }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => ![PRECACHE, RUNTIME].includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // 導覽：永遠回快取 index.html，避免啟動/重整打到不存在路徑而 404
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('./index.html').then(c => c || fetch('./index.html')));
    return;
  }

  // 其他資產：快取優先 + 背景更新
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchAndUpdate = fetch(req).then(res => {
        if (res && res.ok && res.type === 'basic') {
          caches.open(RUNTIME).then(cache => cache.put(req, res.clone()));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchAndUpdate;
    })
  );
});
