import Footer from '@/components/Application/Website/Footer'
import Header from '@/components/Application/Website/Header'
import ErrorBoundary from '@/components/Application/ErrorBoundary'
import WhatsAppSupport from '@/components/Application/Website/WhatsAppSupport'
import React from 'react'
import { Kumbh_Sans } from 'next/font/google'

const kumbh = Kumbh_Sans({
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
    subsets: ['latin'],
    preload: true
})

const layout = ({ children }) => {
    return (
        <ErrorBoundary>
            <div className={kumbh.className}>
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