// Performance monitoring utilities
export const measurePerformance = (name, fn) => {
    if (typeof window !== 'undefined' && window.performance) {
        const start = performance.now()
        const result = fn()
        const end = performance.now()
        console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
        return result
    }
    return fn()
}

// Web Vitals monitoring
export const reportWebVitals = (metric) => {
    if (typeof window !== 'undefined') {
        console.log('[Web Vitals]', metric)
        
        // Send to analytics service if needed
        if (process.env.NODE_ENV === 'production') {
            // Example: Send to Google Analytics or other service
            // gtag('event', metric.name, {
            //     value: Math.round(metric.value),
            //     event_category: 'Web Vitals',
            //     event_label: metric.id,
            //     non_interaction: true,
            // })
        }
    }
}

// API response time measurement
export const measureApiResponse = async (apiCall, endpoint) => {
    const start = Date.now()
    try {
        const result = await apiCall()
        const duration = Date.now() - start
        console.log(`[API] ${endpoint}: ${duration}ms`)
        return result
    } catch (error) {
        const duration = Date.now() - start
        console.error(`[API] ${endpoint}: ${duration}ms (ERROR)`, error)
        throw error
    }
}

// Image loading performance
export const measureImageLoad = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const start = performance.now()
        
        img.onload = () => {
            const duration = performance.now() - start
            console.log(`[Image] ${src}: ${duration.toFixed(2)}ms`)
            resolve({ src, duration })
        }
        
        img.onerror = () => {
            const duration = performance.now() - start
            console.error(`[Image] ${src}: ${duration.toFixed(2)}ms (ERROR)`)
            reject(new Error(`Failed to load image: ${src}`))
        }
        
        img.src = src
    })
}

// Bundle size monitoring
export const logBundleSize = () => {
    if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0]
        if (navigation) {
            console.log('[Bundle] DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms')
            console.log('[Bundle] Load Complete:', navigation.loadEventEnd - navigation.loadEventStart, 'ms')
        }
    }
}
