var CACHE = 'attendance-v17';
var ICON_CACHE = 'attendance-custom-icons';
var ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', function (e) {
    e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
    e.waitUntil(caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { if (k !== CACHE && k !== ICON_CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    var isIcon = /\/icon-(180|192|512|maskable-512)\.png$/.test(new URL(e.request.url).pathname);
    e.respondWith(
        (isIcon ? caches.open(ICON_CACHE).then(function (c) { return c.match(e.request, { ignoreSearch: true }); }).then(function (hit) { return hit || caches.match(e.request, { ignoreSearch: true }); }) : caches.match(e.request, { ignoreSearch: true })).then(function (hit) {
            if (hit) return hit;
            return fetch(e.request).then(function (resp) {
                if (resp.ok && new URL(e.request.url).origin === location.origin) {
                    var copy = resp.clone();
                    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
                }
                return resp;
            }).catch(function () {
                if (e.request.mode === 'navigate') return caches.match('index.html');
            });
        })
    );
});
