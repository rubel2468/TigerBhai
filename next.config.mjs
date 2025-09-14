/** @type {import('next').NextConfig} */
const nextConfig = {
    // Performance optimizations
    compress: true,
    poweredByHeader: false,
    
    // Experimental features for better performance
    experimental: {
        optimizeCss: false,
        optimizePackageImports: ['react-icons'],
        // Disable CSS optimization that causes script loading bug
        cssChunking: 'strict',
        // Disable CSS optimization completely
        optimizeServerReact: false,
    },
    
    // Webpack configuration to fix CSS loading issue and optimizations
    webpack: (config, { dev, isServer }) => {
        // Fix CSS loading as script issue in Next.js 15.3.2
        if (!isServer) {
            // Ensure CSS files are not treated as scripts
            config.module.rules.forEach((rule) => {
                if (rule.test && rule.test.toString().includes('css')) {
                    if (rule.use && Array.isArray(rule.use)) {
                        rule.use.forEach((use) => {
                            if (use.loader && use.loader.includes('css-loader')) {
                                use.options = {
                                    ...use.options,
                                    modules: false,
                                };
                            }
                        });
                    }
                }
            });
        }
        // Production optimizations
        if (!dev && !isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                            priority: 10,
                        },
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            priority: 5,
                            reuseExistingChunk: true,
                        },
                    },
                },
            };
        }
        
        // Tree shaking optimizations
        if (config.optimization) {
            config.optimization.usedExports = true;
            config.optimization.sideEffects = false;
        }
        
        return config;
    },
    
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
                search: ''
            },
            {
                protocol: 'https',
                hostname: 'tigerbhai.online',
                port: '',
                pathname: '/uploads/**',
                search: ''
            }
        ],
        unoptimized: false,
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    
    // Headers for better caching and performance
    async headers() {
        return [
                    {
                        source: '/(.*)',
                        headers: [
                            {
                                key: 'X-Frame-Options',
                                value: 'DENY',
                            },
                            {
                                key: 'X-XSS-Protection',
                                value: '1; mode=block',
                            },
                        ],
                    },
            {
                source: '/_next/static/css/(.*)',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'text/css; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/js/(.*)',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/media/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/api/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
