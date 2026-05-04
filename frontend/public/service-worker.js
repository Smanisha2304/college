const CACHE_STATIC = "smartroute-static-v2";
const CACHE_API = "smartroute-api-v2";

const CORE_ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_STATIC && k !== CACHE_API).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function isSuggestionsApiRequest(url) {
  return url.pathname.includes("/traffic/suggestions") && url.search.includes("query=");
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/static/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // SPA shell
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_STATIC).then((cache) => cache.put("/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Suggestion GETs: stale-while-revalidate
  if (isSuggestionsApiRequest(url)) {
    event.respondWith(
      caches.open(CACHE_API).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);

        return cached || networkPromise;
      })
    );
    return;
  }

  // Same-origin static build assets: cache-first
  if (url.origin === self.location.origin && isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
  }
});
