#!/usr/bin/env node

/**
 * Mobile performance monitoring script for homepage
 * Run this script to check mobile homepage performance metrics
 */

const { chromium } = require('playwright');

async function checkMobilePerformance() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
        viewport: { width: 375, height: 667 }, // iPhone SE viewport
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
    });
    
    const page = await context.newPage();
    
    console.log('📱 Starting mobile performance check...\n');
    
    // Start performance measurement
    await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 60000 
    });
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        
        return {
            // Core Web Vitals
            FCP: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
            LCP: lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : navigation.loadEventEnd - navigation.fetchStart,
            CLS: 0, // Would need more complex measurement
            FID: 0, // Would need user interaction
            
            // Other metrics
            DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            Load: navigation.loadEventEnd - navigation.fetchStart,
            TTFB: navigation.responseStart - navigation.fetchStart,
            
            // Resource counts
            totalResources: performance.getEntriesByType('resource').length,
            imageResources: performance.getEntriesByType('resource').filter(r => r.name.includes('.jpg') || r.name.includes('.png') || r.name.includes('.webp')).length,
            
            // JavaScript execution time
            jsExecutionTime: performance.getEntriesByType('measure').reduce((total, entry) => total + entry.duration, 0)
        };
    });
    
    console.log('📊 Mobile Performance Metrics:');
    console.log('=============================');
    console.log(`First Contentful Paint (FCP): ${metrics.FCP?.toFixed(2)}ms`);
    console.log(`Largest Contentful Paint (LCP): ${metrics.LCP?.toFixed(2)}ms`);
    console.log(`Time to First Byte (TTFB): ${metrics.TTFB?.toFixed(2)}ms`);
    console.log(`DOM Content Loaded: ${metrics.DOMContentLoaded?.toFixed(2)}ms`);
    console.log(`Full Page Load: ${metrics.Load?.toFixed(2)}ms`);
    console.log(`Total Resources: ${metrics.totalResources}`);
    console.log(`Image Resources: ${metrics.imageResources}`);
    console.log(`JS Execution Time: ${metrics.jsExecutionTime?.toFixed(2)}ms`);
    
    // Mobile-specific performance score estimation
    let score = 100;
    if (metrics.FCP > 1800) score -= 25;
    if (metrics.LCP > 2500) score -= 35;
    if (metrics.TTFB > 600) score -= 20;
    if (metrics.totalResources > 40) score -= 10;
    if (metrics.imageResources > 15) score -= 10;
    if (metrics.jsExecutionTime > 1000) score -= 15;
    
    console.log(`\n🎯 Mobile Performance Score: ${Math.max(0, score)}/100`);
    
    if (score >= 90) {
        console.log('✅ Excellent mobile performance!');
    } else if (score >= 70) {
        console.log('⚠️  Good mobile performance, but could be improved');
    } else if (score >= 50) {
        console.log('❌ Mobile performance needs improvement');
    } else {
        console.log('🚨 Critical mobile performance issues!');
    }
    
    // Specific recommendations
    console.log('\n💡 Recommendations:');
    if (metrics.LCP > 2500) {
        console.log('- Optimize LCP element (currently ' + metrics.LCP.toFixed(2) + 'ms)');
    }
    if (metrics.jsExecutionTime > 1000) {
        console.log('- Reduce JavaScript execution time');
    }
    if (metrics.totalResources > 40) {
        console.log('- Minimize resource count');
    }
    
    await browser.close();
}

// Run the mobile performance check
checkMobilePerformance().catch((error) => {
    console.error('❌ Mobile performance check failed:', error.message);
    console.log('\n💡 Make sure your development server is running on http://localhost:3000');
    process.exit(1);
});
