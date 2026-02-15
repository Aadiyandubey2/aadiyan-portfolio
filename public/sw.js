/// <reference lib="webworker" />

const SW_VERSION = '1.0.0';
const CACHE_NAME = `portfolio-v${SW_VERSION}`;
const RUNTIME_CACHE = 'runtime-v1';
const FONT_CACHE = 'fonts-v1';
const IMAGE_CACHE = 'images-v1';

// Core app shell to precache
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/profile-icon-192.png',
  '/profile-icon-512.png',
];

// Typed self for service worker
const sw = self as unknown as ServiceWorkerGlobalScope;

// Install: precache app shell
sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => sw.skipWaiting())
  );
});

// Activate: clean old caches
sw.addEventListener('activate', (event) => {
  const validCaches = [CACHE_NAME, RUNTIME_CACHE, FONT_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => sw.clients.claim())
  );
});

// Fetch strategies
sw.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Strategy: Cache-first for fonts (they rarely change)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Strategy: Cache-first for images from storage buckets
  if (url.pathname.includes('/storage/') || url.pathname.includes('/object/')) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30 * 24 * 60 * 60)); // 30 days
    return;
  }

  // Strategy: Stale-while-revalidate for API calls (supabase REST)
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/functions/v1/')) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Strategy: Cache-first for static assets (JS, CSS, images in build)
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico|gif)$/) ||
    url.pathname.includes('/assets/')
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Strategy: Network-first for HTML navigations (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Default: network with cache fallback
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// --- Caching strategies ---

async function cacheFirst(request: Request, cacheName: string, _maxAge?: number): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // For navigations, return cached index.html (SPA fallback)
    if (request.mode === 'navigate') {
      const index = await caches.match('/');
      if (index) return index;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached || new Response('Offline', { status: 503 }));

  return cached || fetchPromise;
}
