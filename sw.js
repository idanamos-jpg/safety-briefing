// Service worker מינימלי: מאפשר התקנה למסך הבית; תמיד מנסה רשת קודם (הנתונים תמיד עדכניים)
const C = 'sb-shell-v1';
const SHELL = ['w.html', 'worker.js', 'shared.js', 'styles.css', 'config.js', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
