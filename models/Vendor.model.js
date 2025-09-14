import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
    // Basic Business Info
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    businessType: {
        type: String,
        required: true,
        enum: ['individual', 'company', 'partnership'],
        default: 'individual'
    },
    businessDescription: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    
    // Contact Person Information
    contactPerson: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            sparse: true
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true
        }
    },
    
    // Business Address
    businessAddress: {
        street: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true
        },
        postalCode: {
            type: String,
            required: true,
            trim: true
        }
    },
    
    // Verification Documents
    documents: {
        tradeLicense: {
            url: {
                type: String,
                trim: true
            },
            public_id: {
                type: String,
                trim: true
            },
            verified: {
                type: Boolean,
                default: false
            }
        },
        nationalId: {
            url: {
                type: String,
                trim: true
            },
            public_id: {
                type: String,
                trim: true
            },
            verified: {
                type: Boolean,
                default: false
            }
        },
        taxCertificate: {
            url: {
                type: String,
                trim: true
            },
            public_id: {
                type: String,
                trim: true
            },
            verified: {
                type: Boolean,
                default: false
            }
        }
    },
    
    // Bank Details for Payments
    bankDetails: {
        accountHolderName: {
            type: String,
            trim: true
        },
        accountNumber: {
            type: String,
            trim: true
        },
        bankName: {
            type: String,
            trim: true
        },
        ifscCode: {
            type: String,
            trim: true
        },
        verified: {
            type: Boolean,
            default: false
        }
    },
    
    // Commission Settings
    commissionRate: {
        type: Number,
        default: 10, // 10% commission
        min: 0,
        max: 50
    },
    
    // Status and Verification
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verificationNotes: {
        type: String,
        trim: true
    },
    
    // Performance Metrics
    metrics: {
        totalSales: {
            type: Number,
            default: 0
        },
        totalOrders: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },
    
    // Vendor Settings
    settings: {
        autoAcceptOrders: {
            type: Boolean,
            default: true
        },
        notificationEmail: {
            type: Boolean,
            default: true
        },
        notificationSMS: {
            type: Boolean,
            default: true
        }
    },
    
    // Important Dates
    approvedAt: Date,
    lastLoginAt: Date,
    
    // Soft Delete
    deletedAt: {
        type: Date,
        default: null,
        index: true
    }
}, { 
    timestamps: true 
})

// Indexes for better query performance
// Note: contactPerson.email, contactPerson.phone, and deletedAt already have indexes from their field definitions
vendorSchema.index({ status: 1 })
vendorSchema.index({ verificationStatus: 1 })
vendorSchema.index({ businessName: 1 })

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function() {
    return `${this.businessAddress.street}, ${this.businessAddress.city}, ${this.businessAddress.state}, ${this.businessAddress.country} - ${this.businessAddress.postalCode}`
})

// Ensure virtual fields are serialized
vendorSchema.set('toJSON', { virtuals: true })
vendorSchema.set('toObject', { virtuals: true })

const VendorModel = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema, 'vendors')
export default VendorModel
