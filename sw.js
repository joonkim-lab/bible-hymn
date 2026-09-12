// 오프라인 캐시: 앱 껍데기는 네트워크 우선, 데이터·악보 이미지는 캐시 우선
const VER = 'v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './data/books.json', './data/hymns.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open('shell-' + VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => !k.endsWith(VER)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const isStatic = /\/(hymn|data)\//.test(url.pathname);
  if (isStatic) {
    e.respondWith(caches.open('static-' + VER).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }));
  } else {
    e.respondWith(fetch(e.request).then(res => {
      if (res.ok) caches.open('shell-' + VER).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  }
});
