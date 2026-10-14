// Service worker: l'app funziona anche offline. La pagina si aggiorna da sola quando sei online.
const V = 'palestra-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  const isPage = r.mode === 'navigate' || u.pathname === '/' || u.pathname.endsWith('/index.html');
  if (isPage) {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(ca => ca.put('index.html', c)); return res; }).catch(() => caches.match('index.html')));
  } else {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(ca => ca.put(r, c)); return res; })));
  }
});
