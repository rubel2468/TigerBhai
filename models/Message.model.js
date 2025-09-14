import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    // Message participants
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Message content
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    
    // Message type and context
    type: {
        type: String,
        enum: ['general', 'order_inquiry', 'product_question', 'support', 'announcement'],
        default: 'general'
    },
    
    // Related entities
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    
    // Message status
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    
    // Thread management
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    isReply: {
        type: Boolean,
        default: false
    },
    parentMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    
    // Attachments
    attachments: [{
        filename: String,
        url: String,
        public_id: String,
        size: Number,
        mimeType: String
    }],
    
    // Read status
    readAt: Date,
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Soft delete
    deletedAt: {
        type: Date,
        default: null,
        index: true
    }
}, { 
    timestamps: true 
})

// Indexes for better query performance
messageSchema.index({ sender: 1, receiver: 1 })
messageSchema.index({ threadId: 1 })
messageSchema.index({ status: 1 })
messageSchema.index({ type: 1 })
messageSchema.index({ createdAt: -1 })
// Note: deletedAt already has an index from its field definition

const MessageModel = mongoose.models.Message || mongoose.model('Message', messageSchema, 'messages')
export default MessageModel
