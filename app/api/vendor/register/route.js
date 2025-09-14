import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import VendorModel from "@/models/Vendor.model";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import { z } from "zod";
import { cookies } from "next/headers";

const vendorRegistrationSchema = z.object({
    // Business Information
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
    businessType: z.enum(['individual', 'company', 'partnership']),
    businessDescription: z.string().min(50, "Business description must be at least 50 characters"),
    website: z.string().url().optional().or(z.literal("")),
    
    // Contact Person
    contactPerson: z.object({
        name: z.string().min(2, "Contact person name is required"),
        email: z.string().email("Valid email is required"),
        phone: z.string().min(10, "Valid phone number is required")
    }),
    
    // Business Address (Bangladesh format)
    businessAddress: z.object({
        houseApartment: z.string().min(1, "House/Apartment is required"),
        roadStreet: z.string().min(1, "Road/Street is required"),
        areaLocality: z.string().min(1, "Area/Locality is required"),
        postOffice: z.string().min(1, "Post Office is required"),
        upazilaThana: z.string().min(1, "Upazila/Thana is required"),
        district: z.string().min(1, "District is required"),
        postcode: z.string().min(3, "Postcode is required"),
        country: z.literal('Bangladesh').optional()
    }),
    
    // Documents
    documents: z.object({
        tradeLicense: z.object({
            // Accept relative paths like /uploads/images/...
            url: z.string().min(1, 'Trade license URL is required'),
            public_id: z.string().min(1)
        }),
        nationalId: z.object({
            url: z.string().min(1, 'National ID URL is required'),
            public_id: z.string().min(1)
        }),
        taxCertificate: z.object({
            url: z.string().min(1),
            public_id: z.string().min(1)
        }).optional()
    }),
    
    // Login Credentials
    password: z.string().min(6, "Password must be at least 6 characters")
});

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const validatedData = vendorRegistrationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 400, 'Invalid or missing input fields.', validatedData.error)
        }

        const { contactPerson, password, ...vendorData } = validatedData.data

        // Check if vendor already exists
        const existingVendor = await VendorModel.findOne({
            $or: [
                { 'contactPerson.email': contactPerson.email },
                { 'contactPerson.phone': contactPerson.phone }
            ],
            deletedAt: null
        })

        if (existingVendor) {
            return response(false, 400, 'Vendor with this email or phone already exists.')
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [
                { email: contactPerson.email },
                { phone: contactPerson.phone }
            ],
            deletedAt: null
        })

        if (existingUser) {
            return response(false, 400, 'User with this email or phone already exists.')
        }

        // Create vendor record
        const newVendor = new VendorModel({
            ...vendorData,
            contactPerson,
            status: 'pending',
            verificationStatus: 'pending'
        })

        await newVendor.save()

        // Create user account for vendor
        const newUser = new UserModel({
            name: contactPerson.name,
            email: contactPerson.email,
            phone: contactPerson.phone,
            password,
            role: 'vendor',
            vendorId: newVendor._id,
            isEmailVerified: false,
            isPhoneVerified: false
        })

        await newUser.save()

        // Create JWT token
        const loggedInUserData = {
            _id: newUser._id.toString(),
            role: newUser.role,
            name: newUser.name,
            avatar: newUser.avatar,
            vendorId: newUser.vendorId
        }

        const secretKey = process.env.SECRET_KEY
        if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
            return response(false, 500, 'Server misconfiguration: SECRET_KEY is missing.')
        }
        const secret = new TextEncoder().encode(secretKey)
        const token = await new SignJWT(loggedInUserData)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret)

        const cookieStore = await cookies()
        cookieStore.set('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return response(true, 201, 'Vendor registration successful. Your account is pending approval.', {
            user: loggedInUserData,
            vendor: {
                _id: newVendor._id,
                businessName: newVendor.businessName,
                status: newVendor.status
            }
        })

    } catch (error) {
        return catchError(error)
    }
}
