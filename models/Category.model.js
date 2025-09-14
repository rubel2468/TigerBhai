import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    image: {
        type: String,
        default: null
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    isMainCategory: {
        type: Boolean,
        default: true
    },

    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, { timestamps: true })

// Add compound index for unique slug within parent category
categorySchema.index({ slug: 1, parent: 1 }, { unique: true })


const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema, 'categories')
export default CategoryModel