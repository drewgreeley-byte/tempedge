const CACHE = 'tempedge-v5';
const SHELL = ['/tempedge/', '/tempedge/index.html', '/tempedge/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Always go straight to network for all API calls — never cache these
  if (
    url.includes('anthropic.com') ||
    url.includes('open-meteo.com') ||
    url.includes('kalshi.com') ||
    url.includes('cdnjs.cloudflare.com')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // App shell — cache first, fall back to network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
