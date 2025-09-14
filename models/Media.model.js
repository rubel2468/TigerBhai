import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    originalName: {
        type: String,
        required: true,
        trim: true
    },
    filePath: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    alt: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },

}, { timestamps: true })


const MediaModel = mongoose.models.Media || mongoose.model('Media', mediaSchema, 'medias')
export default MediaModel