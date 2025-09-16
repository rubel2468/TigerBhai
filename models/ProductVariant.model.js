import mongoose from "mongoose";

const ProductVariantSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    color: {
        type: String,
        required: true,
        trim: true,
    },
    size: {
        type: String,
        required: true,
        trim: true
    },

    mrp: {
        type: Number,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    recommendedFor: {
        type: String,
        trim: true,
        default: ''
    },
    sku: {
        type: String,
        required: true,
        unique: true,
    },
    media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    },

    deletedAt: {
        type: Date,
        default: null
    },

}, { timestamps: true })

// Indexes to speed common queries
ProductVariantSchema.index({ product: 1 })
ProductVariantSchema.index({ product: 1, color: 1 })
ProductVariantSchema.index({ product: 1, size: 1 })
ProductVariantSchema.index({ product: 1, color: 1, size: 1 })
ProductVariantSchema.index({ deletedAt: 1 })

const ProductVariantModel = mongoose.models.ProductVariant || mongoose.model('ProductVariant', ProductVariantSchema, 'productvariants')
export default ProductVariantModel