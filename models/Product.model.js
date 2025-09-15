import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
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
    videos: [
        {
            platform: {
                type: String,
                enum: ['youtube'],
                default: 'youtube'
            },
            url: {
                type: String,
                trim: true
            },
            videoId: {
                type: String,
                trim: true
            },
            title: {
                type: String,
                trim: true
            },
            thumbnail:
            {
                type: String,
                trim: true
            }
        }
    ],
    media: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Media',
            required: true
        }
    ],
    description: {
        type: String,
        required: true
    },
    whatsappLink: {
        type: String,
        required: false,
        trim: true
    },
    offer: {
        type: String,
        required: false
    },
    companyDetails: {
        type: String,
        required: false
    },
    
    // Vendor association
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: false // Optional for admin products
    },
    
    // Vendor-specific settings
    vendorSettings: {
        isActive: {
            type: Boolean,
            default: true
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        allowReviews: {
            type: Boolean,
            default: true
        }
    },
    
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, { timestamps: true })


productSchema.index({ category: 1 })
productSchema.index({ vendor: 1 })
productSchema.index({ vendor: 1, category: 1 })
// Note: deletedAt already has an index from its field definition
productSchema.index({ vendor: 1, deletedAt: 1 })
const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema, 'products')
export default ProductModel