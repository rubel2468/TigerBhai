#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * This script helps analyze the JavaScript bundle and identify optimization opportunities.
 * Run with: node scripts/analyze-bundle.js
 */

const fs = require('fs');
const path = require('path');

console.log('📦 TigerBhai Bundle Analysis\n');

// Check 1: Analyze package.json for heavy dependencies
console.log('1. Analyzing package dependencies...');
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const heavyDependencies = [
    'react-icons',
    'lucide-react',
    'axios',
    'moment',
    'date-fns',
    'chart.js',
    'recharts',
    'react-slick',
    'slick-carousel',
    'react-toastify',
    'redux',
    'redux-persist'
];

const foundHeavyDeps = [];
heavyDependencies.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        foundHeavyDeps.push(dep);
        console.log(`   ⚠️  Heavy dependency found: ${dep}`);
    }
});

console.log(`   Found ${foundHeavyDeps.length} heavy dependencies\n`);

// Check 2: Analyze dynamic imports usage
console.log('2. Checking dynamic import usage...');
const filesToCheck = [
    '../app/layout.jsx',
    '../app/(root)/(website)/layout.jsx',
    '../app/(root)/(admin)/admin/layout.jsx',
    '../app/(root)/(website)/page.jsx'
];

let dynamicImportScore = 0;
filesToCheck.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const dynamicImports = (content.match(/dynamic\(/g) || []).length;
        if (dynamicImports > 0) {
            console.log(`   ✅ ${filePath}: ${dynamicImports} dynamic imports`);
            dynamicImportScore += dynamicImports;
        } else {
            console.log(`   ❌ ${filePath}: No dynamic imports found`);
        }
    }
});

console.log(`   Total dynamic imports: ${dynamicImportScore}\n`);

// Check 3: Analyze Next.js config optimizations
console.log('3. Checking Next.js optimization config...');
const nextConfigPath = path.join(__dirname, '../next.config.mjs');
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

const optimizations = [
    'splitChunks',
    'maxInitialRequests',
    'maxAsyncRequests',
    'react:',
    'reactIcons:',
    'lucide:',
    'adminComponents:',
    'vendorComponents:',
    'usedExports: true',
    'sideEffects: false'
];

let configScore = 0;
optimizations.forEach(optimization => {
    if (nextConfigContent.includes(optimization)) {
        console.log(`   ✅ ${optimization}`);
        configScore++;
    } else {
        console.log(`   ❌ Missing: ${optimization}`);
    }
});

console.log(`   Configuration optimization score: ${configScore}/${optimizations.length}\n`);

// Check 4: Analyze component structure
console.log('4. Checking component structure...');
const componentsDir = path.join(__dirname, '../components');
const adminDir = path.join(__dirname, '../app/(root)/(admin)');
const vendorDir = path.join(__dirname, '../app/(root)/(vendor)');

const countFiles = (dir) => {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            count += countFiles(path.join(dir, file.name));
        } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
            count++;
        }
    }
    return count;
};

const totalComponents = countFiles(componentsDir);
const adminComponents = countFiles(adminDir);
const vendorComponents = countFiles(vendorDir);

console.log(`   Total components: ${totalComponents}`);
console.log(`   Admin components: ${adminComponents}`);
console.log(`   Vendor components: ${vendorComponents}`);
console.log(`   Website components: ${totalComponents - adminComponents - vendorComponents}\n`);

// Check 5: Analyze icon usage patterns
console.log('5. Checking icon usage patterns...');
const iconUsage = {
    'react-icons': 0,
    'lucide-react': 0,
    'dynamic': 0
};

const scanDirectory = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            scanDirectory(path.join(dir, file.name));
        } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
            const content = fs.readFileSync(path.join(dir, file.name), 'utf8');
            if (content.includes('react-icons')) iconUsage['react-icons']++;
            if (content.includes('lucide-react')) iconUsage['lucide-react']++;
            if (content.includes('useLazyIcons')) iconUsage['dynamic']++;
        }
    }
};

scanDirectory(path.join(__dirname, '../components'));
scanDirectory(path.join(__dirname, '../app'));

console.log(`   Files using react-icons: ${iconUsage['react-icons']}`);
console.log(`   Files using lucide-react: ${iconUsage['lucide-react']}`);
console.log(`   Files using dynamic icon loading: ${iconUsage['dynamic']}\n`);

// Overall analysis
console.log('📊 Bundle Optimization Analysis:');
console.log(`   Heavy dependencies: ${foundHeavyDeps.length}/${heavyDependencies.length}`);
console.log(`   Dynamic imports: ${dynamicImportScore}`);
console.log(`   Config optimizations: ${configScore}/${optimizations.length}`);
console.log(`   Component separation: ${adminComponents + vendorComponents} admin/vendor components\n`);

// Recommendations
console.log('💡 Recommendations:');
if (foundHeavyDeps.length > 8) {
    console.log('   • Consider replacing heavy dependencies with lighter alternatives');
}
if (dynamicImportScore < 5) {
    console.log('   • Add more dynamic imports for non-critical components');
}
if (configScore < 8) {
    console.log('   • Improve Next.js configuration for better code splitting');
}
if (iconUsage['dynamic'] === 0) {
    console.log('   • Implement dynamic icon loading to reduce bundle size');
}

console.log('\n🚀 Next steps:');
console.log('   1. Run "npm run build" to generate optimized bundles');
console.log('   2. Use "ANALYZE=true npm run build" to analyze bundle composition');
console.log('   3. Test with Chrome DevTools to measure actual bundle sizes');
console.log('   4. Monitor Core Web Vitals in production');
