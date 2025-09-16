'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/performance'
import { monitorForcedReflows } from '@/lib/performanceOptimizations'

export default function WebVitals() {
    useEffect(() => {
        // Only run in browser
        if (typeof window === 'undefined') return

        // Import web-vitals dynamically
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(reportWebVitals)
            getFID(reportWebVitals)
            getFCP(reportWebVitals)
            getLCP(reportWebVitals)
            getTTFB(reportWebVitals)
        }).catch((error) => {
            console.warn('Failed to load web-vitals:', error)
        })

        // Start monitoring forced reflows
        monitorForcedReflows()

        // Log bundle size metrics
        const logBundleSize = () => {
            if (window.performance) {
                const navigation = performance.getEntriesByType('navigation')[0]
                if (navigation) {
                    console.log('[Bundle] DOM Content Loaded:', 
                        navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms')
                    console.log('[Bundle] Load Complete:', 
                        navigation.loadEventEnd - navigation.loadEventStart, 'ms')
                }
            }
        }

        // Log when page is fully loaded
        if (document.readyState === 'complete') {
            logBundleSize()
        } else {
            window.addEventListener('load', logBundleSize)
        }

        return () => {
            window.removeEventListener('load', logBundleSize)
        }
    }, [])

    return null // This component doesn't render anything
}
