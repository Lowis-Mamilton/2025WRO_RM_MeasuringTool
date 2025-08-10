(function () {
  window.addEventListener('beforeinstallprompt', (e) => e.preventDefault());
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        })
        .catch(err => console.warn('[PWA] SW registration failed:', err));
    });
  }
})();
