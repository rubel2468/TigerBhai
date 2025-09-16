import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Loading skeleton component
const LoadingSkeleton = ({ className = "h-96 w-full bg-background animate-pulse" }) => (
    <div className={className} />
)

// Higher-order component for lazy loading with custom loading states
export const withLazyLoading = (importFunc, options = {}) => {
    const {
        loading: LoadingComponent = LoadingSkeleton,
        ssr = true,
        ...dynamicOptions
    } = options

    return dynamic(importFunc, {
        loading: LoadingComponent,
        ssr,
        ...dynamicOptions
    })
}

// Pre-configured lazy components for common use cases
export const LazyProductBox = withLazyLoading(
    () => import('./ProductBox'),
    { ssr: true }
)

export const LazyProductReview = withLazyLoading(
    () => import('./ProductReveiw'),
    { ssr: true }
)

export const LazyWhatsAppChat = withLazyLoading(
    () => import('./WhatsAppChat'),
    { ssr: false } // This can be client-only
)

// Wrapper for Suspense boundaries
export const LazyWrapper = ({ children, fallback = <LoadingSkeleton /> }) => (
    <Suspense fallback={fallback}>
        {children}
    </Suspense>
)
