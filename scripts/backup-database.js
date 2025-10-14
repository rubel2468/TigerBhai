import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import CategoryModel from '../models/Category.model.js';
import ProductModel from '../models/Product.model.js';

const MONGODB_URL = 'mongodb+srv://tigerbhai0994_db_user:Ds5jK40zImBWZeWb@cluster0.uegleyc.mongodb.net/tigerbhai';

async function backupDatabase() {
    try {
        // Connect to database
        await mongoose.connect(MONGODB_URL, {
            dbName: 'tigerbhai',
            bufferCommands: false
        });
        
        console.log('Connected to MongoDB successfully');
        
        // Create backup directory with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backups', `backup-${timestamp}`);
        
        if (!fs.existsSync(path.join(process.cwd(), 'backups'))) {
            fs.mkdirSync(path.join(process.cwd(), 'backups'));
        }
        fs.mkdirSync(backupDir);
        
        console.log(`\nCreating backup in: ${backupDir}`);
        
        // Backup Categories
        console.log('\n📁 Backing up Categories...');
        const categories = await CategoryModel.find({});
        const categoriesBackup = {
            timestamp: new Date().toISOString(),
            count: categories.length,
            data: categories
        };
        fs.writeFileSync(
            path.join(backupDir, 'categories.json'), 
            JSON.stringify(categoriesBackup, null, 2)
        );
        console.log(`✅ Categories backed up: ${categories.length} records`);
        
        // Backup Products
        console.log('\n📦 Backing up Products...');
        const products = await ProductModel.find({});
        const productsBackup = {
            timestamp: new Date().toISOString(),
            count: products.length,
            data: products
        };
        fs.writeFileSync(
            path.join(backupDir, 'products.json'), 
            JSON.stringify(productsBackup, null, 2)
        );
        console.log(`✅ Products backed up: ${products.length} records`);
        
        // Create backup summary
        const backupSummary = {
            timestamp: new Date().toISOString(),
            backupPath: backupDir,
            collections: {
                categories: categories.length,
                products: products.length
            },
            changes: {
                apollo: {
                    current: {
                        apollo: categories.find(c => c.name === 'Apollo'),
                        apolloH1: categories.find(c => c.name === 'Apollo H1'),
                        apolloS1: categories.find(c => c.name === 'Apollo S1')
                    },
                    products: {
                        apolloH1: products.filter(p => p.category.toString() === categories.find(c => c.name === 'Apollo H1')?._id.toString()),
                        apolloS1: products.filter(p => p.category.toString() === categories.find(c => c.name === 'Apollo S1')?._id.toString())
                    }
                },
                cst: {
                    current: {
                        cst: categories.find(c => c.name === 'CST'),
                        cstCMDR: categories.find(c => c.name === 'CST CM-DR'),
                        cstCMS3N: categories.find(c => c.name === 'CST CM-S3N')
                    },
                    products: {
                        cstCMDR: products.filter(p => p.category.toString() === categories.find(c => c.name === 'CST CM-DR')?._id.toString()),
                        cstCMS3N: products.filter(p => p.category.toString() === categories.find(c => c.name === 'CST CM-S3N')?._id.toString())
                    }
                },
                maxxis: {
                    current: categories.filter(c => c.name.toLowerCase().includes('maxxis')),
                    products: products.filter(p => {
                        const category = categories.find(c => c._id.toString() === p.category.toString());
                        return category && category.name.toLowerCase().includes('maxxis');
                    })
                }
            }
        };
        
        fs.writeFileSync(
            path.join(backupDir, 'backup-summary.json'), 
            JSON.stringify(backupSummary, null, 2)
        );
        
        console.log('\n📋 Backup Summary Created');
        console.log(`✅ Categories: ${categories.length} records`);
        console.log(`✅ Products: ${products.length} records`);
        console.log(`✅ Backup location: ${backupDir}`);
        
        // Show what will be changed
        console.log('\n🎯 PLANNED CHANGES (for reference):');
        console.log('Apollo H1 product → Apollo category');
        console.log('Apollo S1 product → Apollo category');
        console.log('CST CM-DR product → CST category');
        console.log('CST CM-S3N product → CST category');
        console.log('All MAXXIS products → MAXXIS category');
        
        console.log('\n✅ Database backup completed successfully!');
        return backupDir;
        
    } catch (error) {
        console.error('❌ Error creating backup:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

backupDatabase().then(backupPath => {
    console.log(`\n🚀 Ready to proceed with consolidation changes!`);
    console.log(`📁 Backup saved at: ${backupPath}`);
}).catch(error => {
    console.error('Backup failed:', error);
    process.exit(1);
});
