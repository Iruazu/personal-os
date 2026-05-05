const CACHE_NAME = 'health-tracker-v1';
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

function isApiRequest(url) {
  // ポート8000（ローカル開発）またはAPIパスプレフィックス
  return url.port === '8000' ||
         url.pathname.startsWith('/api/') ||
         (url.hostname.includes('localhost') && url.port !== '');
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (isApiRequest(url)) {
    event.respondWith(fetch(event.request).catch(() => {
      return new Response(JSON.stringify({ error: 'offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }));
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
