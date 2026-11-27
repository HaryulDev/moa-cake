/* 모아의 케이크 만들기 · 서비스 워커
   - 게임 파일(index.html 등)은 "인터넷 먼저": 새 버전이 올라가 있으면 바로 받아요(패치 자동 반영),
     인터넷이 없으면 저장해 둔 것을 써요.
   - 3D 라이브러리(Three.js)와 글꼴은 "저장된 것 먼저": 한 번 받으면 다음부터 휴대폰에서 바로 열려요.
   파일 목록이나 이 파일을 바꿀 때는 VERSION을 올려 주세요. */
const VERSION = 'moa-v23';
const SHELL = ['./', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png', 'icons/icon-maskable-512.png'];
const CDN = /^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// 인터넷 먼저 (3초 안에 안 오면 저장본)
async function networkFirst(req){
  const cache = await caches.open(VERSION);
  try {
    const res = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 3000))]);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req)) || (await cache.match('index.html')) || Response.error();
  }
}
// 저장된 것 먼저 (없으면 받아서 저장)
async function cacheFirst(req){
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (CDN.test(req.url)) { e.respondWith(cacheFirst(req)); return; }
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) { e.respondWith(networkFirst(req)); return; }
  e.respondWith(cacheFirst(req));
});
