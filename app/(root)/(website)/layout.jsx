import React from 'react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/Application/ErrorBoundary'

// Dynamically import heavy components to reduce initial bundle size
const Header = dynamic(() => import('@/components/Application/Website/Header'), {
  loading: () => <div className="h-20 bg-white animate-pulse" />,
  ssr: true
})

const Footer = dynamic(() => import('@/components/Application/Website/Footer'), {
  loading: () => <div className="h-64 bg-gray-800 animate-pulse" />,
  ssr: true
})

const WhatsAppSupport = dynamic(() => import('@/components/Application/Website/WhatsAppSupport'), {
  loading: () => null
})

// next/font removed; using Google Fonts via app/layout.jsx

const layout = ({ children }) => {
    return (
        <ErrorBoundary>
            <div style={{ fontFamily: "Kumbh Sans, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
                <Header />
                <main className="pt-20 lg:pt-20">
                    {children}
                </main>
                <Footer />
                <WhatsAppSupport />
            </div>
        </ErrorBoundary>
    )
}

export default layout