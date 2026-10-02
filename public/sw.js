/**
 * Nyra AI — Progressive Web App Service Worker
 * 
 * Strict Cache Isolation:
 * - NEVER caches /api/* (AI streams, prompt logic, memories, usage)
 * - NEVER caches authentication endpoints or Supabase/Clerk domains
 * - NEVER interferes with non-GET requests (POST, PUT, DELETE)
 * - Network-First for HTML navigation to ensure fresh dynamic state
 * - Stale-While-Revalidate for static Next.js bundles and brand assets
 */

const CACHE_NAME = 'nyra-pwa-v2';

const STATIC_PRECACHE = [
  '/',
  '/favicon.svg',
  '/favicon.ico',
  '/favicon.png',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/splash/apple-splash.png',
  '/splash/apple-splash-1290x2796.png',
  '/splash/mobile-cover.png',
  '/nyra-icon.svg',
  '/manifest.webmanifest',
  '/manifest.json',
];

// Install: Pre-cache core shell & brand assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[PWA SW] Pre-cache warning:', err);
      });
    })
  );
});

// Activate: Take immediate control & purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart routing with bulletproof auth & AI safeguards
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1. Only process GET requests
  if (req.method !== 'GET') {
    return;
  }

  const url = new URL(req.url);

  // 2. Cross-origin requests (Supabase, Clerk, Google AI, Groq, Cloudinary, etc.): NEVER CACHE
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. API endpoints: ALWAYS NETWORK ONLY. Never cache AI streaming or chat data.
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 4. Auth & account flows: ALWAYS NETWORK ONLY
  if (
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/signup') ||
    url.pathname.startsWith('/auth')
  ) {
    return;
  }

  // 5. HTML Navigation: Network-First with cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, resClone);
            });
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response('Offline — Nyra AI requires an active network connection for live AI reasoning.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // 6. Static Next.js assets & brand media: Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(css|js|svg|png|jpg|jpeg|webp|ico|woff2|woff|ttf)$/i);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, resClone);
            });
          }
          return networkRes;
        }).catch(() => null);

        return cachedRes || fetchPromise;
      })
    );
    return;
  }

  // Default: pass through to network
});
