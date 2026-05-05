const CACHE_NAME = 'health-tracker-v5';
const STATIC_URLS = ['/', '/workout', '/inbody', '/nutrition', '/english'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const API_PREFIXES = ['/workout/', '/inbody/', '/nutrition/', '/english/', '/health/', '/api/'];

function isApiRequest(url) {
  return url.port === '8000' ||
         API_PREFIXES.some((p) => url.pathname.startsWith(p)) ||
         (url.hostname.includes('localhost') && url.port !== '');
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (isApiRequest(url)) {
    // API requests are not intercepted to avoid iOS Safari SW + Authorization header issues
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
