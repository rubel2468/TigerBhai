import mongoose, { mongo } from "mongoose";
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin', 'vendor'],
        default: 'user'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: false,
        trim: true,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false
    },
    avatar: {
        url: {
            type: String,
            trim: true
        },
        public_id: {
            type: String,
            trim: true
        },
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    address: {
        type: String,
        trim: true,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
    
    // Vendor reference for vendor users
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: function() {
            return this.role === 'vendor'
        }
    },
}, { timestamps: true })


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next();
})


userSchema.methods = {
    comparePassword: async function (password) {
        return await bcrypt.compare(password, this.password)
    }
}

const UserModel = mongoose.models.User || mongoose.model('User', userSchema, 'users')
export default UserModel