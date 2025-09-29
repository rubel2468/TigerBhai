#!/usr/bin/env node

/**
 * Performance Optimization Check Script
 * 
 * This script helps verify that the performance optimizations are working correctly.
 * Run with: node scripts/performance-optimization-check.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 TigerBhai Performance Optimization Check\n');

// Check 1: Verify layout.jsx has optimized font loading
console.log('1. Checking font loading optimizations...');
const layoutPath = path.join(__dirname, '../app/layout.jsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

const fontOptimizations = [
    'media="print" onLoad="this.media=\'all\'"',
    'font-display: swap',
    'ascent-override',
    'descent-override',
    'line-gap-override',
    'size-adjust'
];

let fontScore = 0;
fontOptimizations.forEach(optimization => {
    if (layoutContent.includes(optimization)) {
        console.log(`   ✅ ${optimization}`);
        fontScore++;
    } else {
        console.log(`   ❌ Missing: ${optimization}`);
    }
});

console.log(`   Font optimization score: ${fontScore}/${fontOptimizations.length}\n`);

// Check 2: Verify preconnect hints are optimized
console.log('2. Checking preconnect optimizations...');
const preconnectOptimizations = [
    'preconnect.*fonts.gstatic.com',
    'preconnect.*res.cloudinary.com',
    '!preconnect.*img.youtube.com',
    '!preconnect.*i.ytimg.com'
];

let preconnectScore = 0;
preconnectOptimizations.forEach(optimization => {
    const regex = new RegExp(optimization.replace('!', ''));
    const found = regex.test(layoutContent);
    
    if (optimization.startsWith('!')) {
        // This should NOT be present
        if (!found) {
            console.log(`   ✅ Removed unnecessary: ${optimization.substring(1)}`);
            preconnectScore++;
        } else {
            console.log(`   ❌ Still present (should be removed): ${optimization.substring(1)}`);
        }
    } else {
        // This should be present
        if (found) {
            console.log(`   ✅ ${optimization}`);
            preconnectScore++;
        } else {
            console.log(`   ❌ Missing: ${optimization}`);
        }
    }
});

console.log(`   Preconnect optimization score: ${preconnectScore}/${preconnectOptimizations.length}\n`);

// Check 3: Verify slick carousel CSS is loaded asynchronously
console.log('3. Checking slick carousel optimizations...');
const testimonialPath = path.join(__dirname, '../components/Application/Website/Testimonial.jsx');
const mainSliderPath = path.join(__dirname, '../components/Application/Website/MainSlider.jsx');

const asyncLoadOptimizations = [
    'await import("slick-carousel/slick/slick.css")',
    'loadSlickCSS',
    'cssLoaded'
];

let asyncScore = 0;
[testimonialPath, mainSliderPath].forEach((filePath, index) => {
    const fileName = index === 0 ? 'Testimonial.jsx' : 'MainSlider.jsx';
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`   Checking ${fileName}...`);
    asyncLoadOptimizations.forEach(optimization => {
        if (content.includes(optimization)) {
            console.log(`     ✅ ${optimization}`);
            asyncScore++;
        } else {
            console.log(`     ❌ Missing: ${optimization}`);
        }
    });
});

console.log(`   Async loading optimization score: ${asyncScore}/${asyncLoadOptimizations.length * 2}\n`);

// Check 4: Verify critical CSS is inlined
console.log('4. Checking critical CSS optimizations...');
const criticalCSSOptimizations = [
    'dangerouslySetInnerHTML',
    'Critical CSS for above-the-fold',
    'box-sizing: border-box',
    'font-family: system-ui'
];

let criticalScore = 0;
criticalCSSOptimizations.forEach(optimization => {
    if (layoutContent.includes(optimization)) {
        console.log(`   ✅ ${optimization}`);
        criticalScore++;
    } else {
        console.log(`   ❌ Missing: ${optimization}`);
    }
});

console.log(`   Critical CSS optimization score: ${criticalScore}/${criticalCSSOptimizations.length}\n`);

// Overall score
const totalScore = fontScore + preconnectScore + asyncScore + criticalScore;
const maxScore = fontOptimizations.length + preconnectOptimizations.length + (asyncLoadOptimizations.length * 2) + criticalCSSOptimizations.length;

console.log('📊 Overall Performance Optimization Score:');
console.log(`   ${totalScore}/${maxScore} (${Math.round((totalScore / maxScore) * 100)}%)\n`);

if (totalScore === maxScore) {
    console.log('🎉 All performance optimizations are in place!');
    console.log('   Your site should now have:');
    console.log('   • Non-render-blocking Google Fonts');
    console.log('   • Optimized preconnect hints');
    console.log('   • Asynchronous slick carousel loading');
    console.log('   • Inlined critical CSS');
    console.log('   • Font metric overrides to prevent layout shifts');
} else {
    console.log('⚠️  Some optimizations are missing. Please review the items above.');
}

console.log('\n💡 Next steps:');
console.log('   1. Run your site in production mode');
console.log('   2. Test with Chrome DevTools Lighthouse');
console.log('   3. Monitor Core Web Vitals in production');
console.log('   4. Use PageSpeed Insights for detailed analysis');
