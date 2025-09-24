import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Performance defaults
    compress: true,
    poweredByHeader: false,
    
    // Optimize loading performance
    reactStrictMode: true,

    serverExternalPackages: ['mongoose'],
    
    // Experimental performance features
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['react-icons'],
        esmExternals: true,
    },

    // Webpack optimization
    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            config.optimization = {
                ...config.optimization,
                minimize: true,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                            priority: 20,
                        },
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            priority: 10,
                            reuseExistingChunk: true,
                        },
                    },
                },
                runtimeChunk: 'single',
                usedExports: true, // tree-shaking
                sideEffects: true, // safer + smaller bundles
            };
        }
        
        // Enable prefetching for better navigation performance
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }
        
        return config;
    },

    // Optimized image handling
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.ytimg.com',
                pathname: '/**',
            },
        ],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 31536000, // 1 year cache
        unoptimized: false,
        dangerouslyAllowSVG: false, // better security + perf
    },

    // Cache & security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    // Remove non-standard/unsupported directives to avoid console warnings
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                     {
                         key: 'Content-Security-Policy',
                         value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://analytics.tiktok.com https://apis.google.com; script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://analytics.tiktok.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src * blob: data:; font-src 'self' https: data:; object-src 'none'; frame-ancestors 'self'; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com; child-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com; connect-src 'self' https: wss: https://www.googletagmanager.com https://connect.facebook.net https://analytics.tiktok.com; worker-src 'self' blob:; base-uri 'self';",
                     },
                ],
            },
            {
                source: '/_next/static/css/(.*)',
                headers: [
                    { key: 'Content-Type', value: 'text/css; charset=utf-8' },
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/_next/static/js/(.*)',
                headers: [
                    { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/_next/static/media/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/api/(.*)',
                headers: [
                    // APIs should be dynamic
                    { key: 'Cache-Control', value: 'no-store' },
                ],
            },
        ];
    },
};

export default withBundleAnalyzer(nextConfig);
