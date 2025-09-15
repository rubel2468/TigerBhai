import mongoose from "mongoose";

const carouselSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false,
        trim: true,
        maxLength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
        type: String,
        trim: true,
        maxLength: [200, "Description cannot exceed 200 characters"]
    },
    image: {
        url: {
            type: String,
            required: [true, "Image URL is required"]
        },
        publicId: {
            type: String,
            required: [true, "Image public ID is required"]
        }
    },
    buttonText: {
        type: String,
        default: "Shop Now",
        trim: true,
        maxLength: [20, "Button text cannot exceed 20 characters"]
    },
    buttonUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty URL
                return /^https?:\/\/.+/.test(v);
            },
            message: "Button URL must be a valid URL"
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

// Index for better query performance
carouselSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.Carousel || mongoose.model("Carousel", carouselSchema);
