import Footer from '@/components/Application/Website/Footer'
import Header from '@/components/Application/Website/Header'
import ErrorBoundary from '@/components/Application/ErrorBoundary'
import WhatsAppSupport from '@/components/Application/Website/WhatsAppSupport'
import React from 'react'
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