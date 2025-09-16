// Service Worker for better caching and performance
const STATIC_CACHE = 'static-v3'
const DYNAMIC_CACHE = 'dynamic-v3'

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS)
                    .catch((error) => {
                        console.warn('Failed to cache some static assets:', error);
                        // Cache individual assets that are available
                        return Promise.allSettled(
                            STATIC_ASSETS.map(asset => 
                                cache.add(asset).catch(err => 
                                    console.warn(`Failed to cache ${asset}:`, err)
                                )
                            )
                        );
                    });
            })
            .then(() => self.skipWaiting())
    )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE
                        })
                        .map((cacheName) => caches.delete(cacheName))
                )
            })
            .then(() => self.clients.claim())
    )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Only handle same-origin GET requests
    if (request.method !== 'GET') return
    if (url.origin !== location.origin) return

    // Let Next.js handle its own build assets
    if (url.pathname.startsWith('/_next/static/')) return

    const isNavigation = request.mode === 'navigate' || (request.headers.get('Accept') || '').includes('text/html')
    const isApi = url.pathname.startsWith('/api/')

    // Network-first for pages and APIs to avoid stale data
    if (isNavigation || isApi) {
        event.respondWith((async () => {
            try {
                const response = await fetch(request, { cache: 'no-store' })
                // Cache only HTML navigations for offline fallback
                if (isNavigation && response && response.ok && response.type === 'basic') {
                    const clone = response.clone()
                    caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone)).catch(() => {})
                }
                return response
            } catch (err) {
                if (isNavigation) {
                    const cached = await caches.match(request)
                    if (cached) return cached
                    const offline = await caches.match('/offline.html')
                    if (offline) return offline
                }
                return new Response('Network error', { status: 408, statusText: 'Request Timeout' })
            }
        })())
        return
    }

    // Cache-first for other static assets (images, fonts, etc.)
    event.respondWith((async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        try {
            const response = await fetch(request)
            if (response && response.ok && (response.type === 'basic' || response.type === 'opaque')) {
                const clone = response.clone()
                caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone)).catch(() => {})
            }
            return response
        } catch (err) {
            return new Response('Network error', { status: 408, statusText: 'Request Timeout' })
        }
    })())
})
