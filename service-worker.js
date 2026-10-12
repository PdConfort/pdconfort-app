/* PD Comfort — Service Worker
   Guarda a app em cache para funcionar offline e permite "instalar" no
   Windows e no Android. Nunca guarda em cache pedidos ao Google
   (login / Drive) — esses precisam sempre de ligação à internet. */

const CACHE_NAME = 'pdconfort-v13';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // cache:'reload' garante que vai buscar os ficheiros ao servidor e não a uma cópia antiga do navegador
      .then((cache) => cache.addAll(APP_SHELL.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;
  // Nunca intercetar chamadas ao Google (login/Drive) — têm de ir sempre à rede.
  if (url.includes('googleapis.com') || url.includes('accounts.google.com') || url.includes('gstatic.com')) {
    return;
  }

  // Páginas (index.html): primeiro a rede, para abrir sempre a versão mais recente;
  // só usa a cópia guardada se não houver internet.
  if (req.mode === 'navigate' || url.endsWith('/index.html')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Restantes ficheiros (ícones, bibliotecas): cópia guardada primeiro, atualizada em segundo plano.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
