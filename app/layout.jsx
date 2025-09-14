import GlobalProvider from "@/components/Application/GlobalProvider";
import ServiceWorker from "@/components/Application/ServiceWorker";
import "./globals.css";
import { Assistant } from 'next/font/google'
import { ToastContainer } from 'react-toastify';
const assistantFont = Assistant({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap'
})

export const metadata = {
  title: "TweestNext - E-commerce Store",
  description: "Your trusted destination for quality and convenience. From fashion to essentials, we bring everything you need right to your doorstep.",
  keywords: "ecommerce, shopping, fashion, clothing, online store",
  authors: [{ name: "TweestNext Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "TweestNext - E-commerce Store",
    description: "Your trusted destination for quality and convenience",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TweestNext - E-commerce Store",
    description: "Your trusted destination for quality and convenience",
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
      <body
        className={`${assistantFont.className} antialiased`}
      >
        <GlobalProvider>
          <ServiceWorker />
          <ToastContainer />
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
