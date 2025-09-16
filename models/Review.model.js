import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    rating: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },

    deletedAt: {
        type: Date,
        default: null
    },

}, { timestamps: true })

// Helpful indexes
reviewSchema.index({ product: 1 })
reviewSchema.index({ user: 1 })
reviewSchema.index({ product: 1, createdAt: -1 })
reviewSchema.index({ deletedAt: 1 })

const ReviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema, 'reviews')
export default ReviewModel