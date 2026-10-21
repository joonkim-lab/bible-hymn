// 오프라인 캐시: 앱 껍데기만 담당. 성경 본문·찬송 악보는 index.html 안의 getLocked()가 Storage에서 받아 'locked-v1' 캐시에 둠.
const VER = 'v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './data/books.json', './data/split3.json', './data/plans-v1.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open('shell-' + VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => !k.endsWith(VER) && !k.startsWith('locked-')).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) caches.open('shell-' + VER).then(c => c.put(e.request, res.clone()));
    return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
