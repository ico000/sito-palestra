// Service worker: l'app si apre subito e funziona anche senza rete.
// - La pagina viene servita SEMPRE dalla copia salvata sul telefono (apertura immediata, anche con rete debole)
//   e in parallelo viene scaricata la versione nuova: se è cambiata, l'app avvisa di riaprirla.
// - File statici (immagini, librerie): prima la copia salvata, poi la rete.
const V = 'palestra-v11';
const SCOPE = self.registration.scope;
const INDEX = SCOPE;
const CORE = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png', 'icons/icon-maskable-512.png'];
const OPT = ['imgdata.js', 'vendor/pdf.min.js', 'vendor/pdf.worker.min.js'];
const abs = u => new URL(u, SCOPE).href;

// Una risposta "rediretta" non può essere usata per aprire una pagina: la ricreo pulita.
async function clean(r) {
  if (!r.redirected && r.type !== 'opaqueredirect') return r;
  const b = await r.blob();
  return new Response(b, { status: 200, statusText: 'OK', headers: r.headers });
}
async function grab(u) {
  const r = await fetch(new Request(abs(u), { cache: 'reload' }));
  if (!r.ok) throw new Error(u + ' ' + r.status);
  return clean(r);
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.all(CORE.map(async u => c.put(abs(u), await grab(u))));
    await Promise.all(OPT.map(u => grab(u).then(r => c.put(abs(u), r)).catch(() => { })));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function notify() {
  const l = await self.clients.matchAll({ includeUncontrolled: true });
  l.forEach(c => c.postMessage({ t: 'upd' }));
}
async function refreshIndex(c, hit) {
  try {
    const r = await fetch(new Request(INDEX, { cache: 'no-cache' }));
    if (!r.ok) return null;
    const oldTag = hit && (hit.headers.get('etag') || hit.headers.get('content-length'));
    const newTag = r.headers.get('etag') || r.headers.get('content-length');
    const nr = await clean(r);
    await c.put(INDEX, nr.clone());
    if (hit && oldTag && newTag && oldTag !== newTag) notify();
    return nr;
  } catch (_) { return null; }
}
async function pageResponse(e) {
  const c = await caches.open(V);
  const hit = await c.match(INDEX);
  if (hit) { e.waitUntil(refreshIndex(c, hit)); return hit; }
  const r = await refreshIndex(c, null);
  return r || new Response('<!doctype html><meta charset=utf8><meta name=viewport content="width=device-width"><body style="font-family:sans-serif;background:#0f1115;color:#eee;padding:24px"><h2>Offline</h2><p>Apri l\'app una volta con la connessione per scaricarla sul telefono.</p>', { status: 200, headers: { 'Content-Type': 'text/html;charset=utf-8' } });
}

self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  if (r.mode === 'navigate') { e.respondWith(pageResponse(e)); return; }
  e.respondWith((async () => {
    const c = await caches.open(V);
    const hit = await c.match(r);
    if (hit) return hit;
    try {
      const res = await fetch(r);
      if (res.ok) c.put(r, (await clean(res)).clone());
      return res;
    } catch (err) {
      return new Response('', { status: 504 });
    }
  })());
});
