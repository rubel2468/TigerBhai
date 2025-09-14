#!/usr/bin/env node

/**
 * Performance monitoring script for homepage
 * Run this script to check homepage performance metrics
 */

const { chromium } = require('playwright');

async function checkPerformance() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('🚀 Starting performance check...\n');
    
    // Start performance measurement
    await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 60000 
    });
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
            // Core Web Vitals
            FCP: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
            LCP: navigation.loadEventEnd - navigation.fetchStart,
            CLS: 0, // Would need more complex measurement
            FID: 0, // Would need user interaction
            
            // Other metrics
            DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            Load: navigation.loadEventEnd - navigation.fetchStart,
            TTFB: navigation.responseStart - navigation.fetchStart,
            
            // Resource counts
            totalResources: performance.getEntriesByType('resource').length,
            imageResources: performance.getEntriesByType('resource').filter(r => r.name.includes('.jpg') || r.name.includes('.png') || r.name.includes('.webp')).length,
        };
    });
    
    console.log('📊 Performance Metrics:');
    console.log('=====================');
    console.log(`First Contentful Paint (FCP): ${metrics.FCP?.toFixed(2)}ms`);
    console.log(`Largest Contentful Paint (LCP): ${metrics.LCP?.toFixed(2)}ms`);
    console.log(`Time to First Byte (TTFB): ${metrics.TTFB?.toFixed(2)}ms`);
    console.log(`DOM Content Loaded: ${metrics.DOMContentLoaded?.toFixed(2)}ms`);
    console.log(`Full Page Load: ${metrics.Load?.toFixed(2)}ms`);
    console.log(`Total Resources: ${metrics.totalResources}`);
    console.log(`Image Resources: ${metrics.imageResources}`);
    
    // Performance score estimation
    let score = 100;
    if (metrics.FCP > 1800) score -= 20;
    if (metrics.LCP > 2500) score -= 30;
    if (metrics.TTFB > 600) score -= 15;
    if (metrics.totalResources > 50) score -= 10;
    if (metrics.imageResources > 20) score -= 10;
    
    console.log(`\n🎯 Estimated Performance Score: ${Math.max(0, score)}/100`);
    
    if (score >= 90) {
        console.log('✅ Excellent performance!');
    } else if (score >= 70) {
        console.log('⚠️  Good performance, but could be improved');
    } else {
        console.log('❌ Performance needs significant improvement');
    }
    
    await browser.close();
}

// Run the performance check
checkPerformance().catch((error) => {
    console.error('❌ Performance check failed:', error.message);
    console.log('\n💡 Make sure your development server is running on http://localhost:3000');
    process.exit(1);
});
