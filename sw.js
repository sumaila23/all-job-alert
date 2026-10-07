const CACHE_NAME = "all-job-alert-sl-v1";
const FILES_TO_CACHE = [
  "/index.html",
  "/css/style.css",
  "/js/app.js",
  "/js/supabase-client.js",
  "/image/favicon-32.png",
  "/image/favicon-180.png",
  "/image/logo-header.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== CACHE_NAME;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});