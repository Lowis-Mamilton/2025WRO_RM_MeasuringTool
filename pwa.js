(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('[PWA] scope:', reg.scope))
      .catch(err => console.error('[PWA] register failed:', err));
  });
})();
