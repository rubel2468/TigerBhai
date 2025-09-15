/* eslint-disable no-console */
import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../lib/databaseConnection.js'
import ProductModel from '../models/Product.model.js'
import MediaModel from '../models/Media.model.js'
import ProductVariantModel from '../models/ProductVariant.model.js'

async function ensureDemoMedia() {
  const existing = await MediaModel.findOne({ deletedAt: null })
  if (existing) return existing._id
  // Create a placeholder media pointing to an existing public placeholder image
  const media = await MediaModel.create({
    fileName: 'placeholder.webp',
    originalName: 'placeholder.webp',
    filePath: '/assets/images/img-placeholder.webp',
    size: 0,
    type: 'image/webp',
  })
  return media._id
}

async function run() {
  await connectDB()
  const demoMediaId = await ensureDemoMedia()

  const product = await ProductModel.findOne({ deletedAt: null }).lean()
  if (!product) {
    console.log('No product found to update.')
    await mongoose.connection.close()
    return
  }

  // Attach demo video if not present
  await ProductModel.updateOne({ _id: product._id }, {
    $set: {
      videos: [{ platform: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ', videoId: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' }],
    },
    $setOnInsert: {}
  })

  // Ensure product has at least one media
  if (!Array.isArray(product.media) || product.media.length === 0) {
    await ProductModel.updateOne({ _id: product._id }, { $set: { media: [demoMediaId] } })
  }

  // Update a couple of variants for demo pricing and recommended text
  const variants = await ProductVariantModel.find({ product: product._id })
  for (const v of variants) {
    const newMrp = v.mrp && v.mrp > 0 ? v.mrp : 2000
    const newSell = v.sellingPrice && v.sellingPrice > 0 ? v.sellingPrice : 1500
    const discount = Math.round(((newMrp - newSell) / newMrp) * 100)
    v.mrp = newMrp
    v.sellingPrice = newSell
    v.discountPercentage = discount
    v.recommendedFor = v.recommendedFor || 'Daily use'
    if (!v.media) v.media = demoMediaId
    await v.save()
  }

  console.log('Demo data seeded on product and variants:', product.slug)
  await mongoose.connection.close()
}

run().catch(async (err) => { console.error(err); try { await mongoose.connection.close() } catch (_) {} process.exit(1) })


