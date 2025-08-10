// pwa.js
(function () {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker not supported');
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => {
        console.log('[PWA] SW registered with scope:', reg.scope);
        reg.onupdatefound = () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.onstatechange = () => console.log('[PWA] SW state:', nw.state);
        };
      })
      .catch(err => console.error('[PWA] SW register failed:', err));
  });
})();
