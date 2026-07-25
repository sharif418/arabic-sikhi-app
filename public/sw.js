/// <reference lib="webworker" />

/**
 * Service Worker for Arabic Sikhi (আরবি শিখি)
 * Provides offline-first caching for the PWA.
 *
 * Caching strategy:
 * - App shell (HTML, JS, CSS): stale-while-revalidate
 * - Static assets (images, fonts): cache-first
 * - API requests: network-first with cache fallback
 */

const SW_VERSION = "v1.0.0";
const STATIC_CACHE = `as-static-${SW_VERSION}`;
const RUNTIME_CACHE = `as-runtime-${SW_VERSION}`;
const API_CACHE = `as-api-${SW_VERSION}`;

// Assets to pre-cache on install
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/app-icon.png",
];

// Install: pre-cache app shell
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {
      // If pre-cache fails, continue anyway
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, API_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: route requests to appropriate caching strategy
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests (except fonts/images from Google)
  if (url.origin !== self.location.origin && !url.hostname.includes("googleapis.com")) return;

  // API requests: network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static assets (images, fonts): cache-first
  if (request.destination === "image" || request.destination === "font" || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2?)$/)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    return;
  }

  // Navigation requests (HTML): stale-while-revalidate
  if (request.mode === "navigate") {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Default: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
});

/** Cache-first strategy: serve from cache, fallback to network */
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

/** Network-first strategy: try network, fallback to cache */
async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/** Stale-while-revalidate: serve cache immediately, update in background */
async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached || new Response("Offline", { status: 503 }));

  return cached || fetchPromise;
}

// Handle messages from the client
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
