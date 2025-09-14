// Service Worker for better caching and performance
const CACHE_NAME = 'tweest-next-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

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
            .then(() => {
                return self.skipWaiting()
            })
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
                        .map((cacheName) => {
                            return caches.delete(cacheName)
                        })
                )
            })
            .then(() => {
                return self.clients.claim()
            })
    )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return
    }

    // Skip external requests
    if (url.origin !== location.origin) {
        return
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse
                }

                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response
                        }

                        // Clone the response
                        const responseToCache = response.clone()

                        // Cache API responses
                        if (url.pathname.startsWith('/api/')) {
                            caches.open(DYNAMIC_CACHE)
                                .then((cache) => {
                                    cache.put(request, responseToCache)
                                })
                                .catch(err => console.warn('Failed to cache API response:', err))
                        }

                        return response
                    })
                    .catch((error) => {
                        console.warn('Fetch failed:', error);
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/offline.html')
                        }
                        // For other requests, return a basic error response
                        return new Response('Network error', { status: 408, statusText: 'Request Timeout' })
                    })
            })
    )
})
