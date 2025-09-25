import GlobalProvider from "@/components/Application/GlobalProvider";
import ServiceWorker from "@/components/Application/ServiceWorker";
import WebVitals from "@/components/Application/WebVitals";
import "./globals.css";
import { ToastContainer } from 'react-toastify';

export const metadata = {
  title: "Tiger Bhai",
  description: "Your trusted destination for quality and convenience. From fashion to essentials, we bring everything you need right to your doorstep.",
  keywords: "ecommerce, shopping, fashion, clothing, online store",
  authors: [{ name: "Tiger Bhai Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Tiger Bhai",
    description: "Your trusted destination for quality and convenience",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiger Bhai",
    description: "Your trusted destination for quality and convenience",
  },
  other: {
    'font-display': 'swap',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts (replace next/font) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=Kumbh+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TW7XR5TX');` }} />
        {/* End Google Tag Manager */}
        {/* Facebook and TikTok Pixels are loaded via GTM to avoid duplicate activation */}
        {/* Critical CSS inlined to prevent render blocking */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for above-the-fold content */
            * { box-sizing: border-box; }
            html { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; }
            body { margin: 0; font-family: inherit; line-height: inherit; background-color: #F3F4F6; color: #1F2937; }
            .container { width: 100%; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }
            .btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; cursor: pointer; border: 1px solid transparent; }
            .btn-primary { background-color: #3B82F6; color: white; }
            .btn-primary:hover { background-color: #2563EB; }
            img { max-width: 100%; height: auto; }
            .loading { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @media (min-width: 640px) { .container { max-width: 640px; } }
            @media (min-width: 768px) { .container { max-width: 768px; } }
            @media (min-width: 1024px) { .container { max-width: 1024px; } }
            @media (min-width: 1280px) { .container { max-width: 1280px; } }
          `
        }} />
        
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        
        {/* DNS prefetch for additional performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
      </head>
      <body className={`antialiased`} style={{ fontFamily: "Assistant, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TW7XR5TX" height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
        <GlobalProvider>
          <ServiceWorker />
          <WebVitals />
          <ToastContainer />
          <div style={{ minHeight: '100vh' }}>
            {children}
          </div>
        </GlobalProvider>
      </body>
    </html>
  );
}
