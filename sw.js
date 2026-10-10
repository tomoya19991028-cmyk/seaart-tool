const CACHE_NAME = 'seaart-tool-pwa-v4-stage5e-result-access-v1-http-cache-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cacheWasPresent = (await caches.keys()).includes(CACHE_NAME);
    try {
      const cache = await caches.open(CACHE_NAME);
      // addAll commits the complete shell atomically; only HTML bypasses HTTP cache.
      await cache.addAll(APP_SHELL.map(url =>
        url === './' || url === './index.html' ? new Request(url, { cache: 'reload' }) : url
      ));
      await self.skipWaiting();
    } catch (error) {
      if (!cacheWasPresent) await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isAppHTML = url.origin === self.location.origin && (
    url.pathname === new URL('./', self.registration.scope).pathname ||
    url.pathname === new URL('./index.html', self.registration.scope).pathname
  );
  if (event.request.mode === 'navigate' || isAppHTML) {
    event.respondWith(
      fetch(new Request(event.request, { cache: 'reload' }))
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME)
              .then(cache => cache.put('./index.html', copy)).catch(() => {}));
          }
          return response;
        })
        .catch(() => caches.open(CACHE_NAME).then(cache => cache.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
