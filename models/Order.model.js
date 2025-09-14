import { orderStatus } from "@/lib/utils"
import mongoose from "mongoose"
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    ordernote: {
        type: String,
        required: false
    },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            mrp: { type: Number, required: true },
            sellingPrice: { type: Number, required: true },
        }
    ],

    // Multivendor order items grouped by vendor
    orderItems: [
        {
            vendor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vendor',
                required: false // Made optional to support admin orders
            },
            products: [
                {
                    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
                    name: { type: String, required: true },
                    qty: { type: Number, required: true },
                    mrp: { type: Number, required: true },
                    sellingPrice: { type: Number, required: true },
                    vendorPrice: { type: Number, required: true }, // Price after commission
                }
            ],
            subtotal: { type: Number, required: true },
            commission: { type: Number, required: true },
            vendorEarning: { type: Number, required: true },
            status: {
                type: String,
                enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
                default: 'pending'
            },
            trackingNumber: String,
            shippedAt: Date,
            deliveredAt: Date,
            notes: String
        }
    ],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    couponDiscountAmount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    deliveryCharge: {
        type: Number,
        required: false,
        default: 0
    },
    status: {
        type: String,
        enum: orderStatus,
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cod'],
        default: 'cod'
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    
    // Payment and payout information
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    payoutStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    payoutDate: Date,
    payoutReference: String,
    
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
}, { timestamps: true })

// Indexes for better query performance
orderSchema.index({ 'orderItems.vendor': 1 })
orderSchema.index({ 'orderItems.vendor': 1, 'orderItems.status': 1 })
orderSchema.index({ 'orderItems.vendor': 1, createdAt: -1 })
orderSchema.index({ payoutStatus: 1 })
orderSchema.index({ paymentStatus: 1 })

const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders')
export default OrderModel