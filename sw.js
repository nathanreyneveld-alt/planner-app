// Service worker voor de Weekagenda — zorgt dat de pagina zelf (het "app-omhulsel")
// ook zonder internetverbinding nog opent, met de laatst geladen versie.
//
// Strategie: probeer altijd eerst het netwerk (zodat je bij een goede verbinding
// altijd de nieuwste versie ziet); lukt dat niet, val terug op wat er in de cache
// staat. De agenda-data zelf (afspraken, vakanties) staat sowieso al lokaal in
// localStorage en heeft hier niets mee te maken — dit gaat puur over het laden
// van de pagina zelf.

const CACHE_NAME = "weekagenda-shell-v1";
const APP_SHELL = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
