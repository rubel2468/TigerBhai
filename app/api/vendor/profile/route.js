import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import UserModel from "@/models/User.model";
import { z } from "zod";
import { cookies } from "next/headers";

const vendorProfileSchema = z.object({
    businessName: z.string().min(2, "Business name must be at least 2 characters").optional(),
    businessDescription: z.string().min(50, "Business description must be at least 50 characters").optional(),
    website: z.string().url().optional().or(z.literal("")),
    contactPerson: z.object({
        name: z.string().min(2, "Contact person name is required").optional(),
        email: z.string().email("Valid email is required").optional(),
        phone: z.string().min(10, "Valid phone number is required").optional()
    }).optional(),
    businessAddress: z.object({
        houseApartment: z.string().optional(),
        roadStreet: z.string().optional(),
        areaLocality: z.string().optional(),
        postOffice: z.string().optional(),
        upazilaThana: z.string().optional(),
        district: z.string().optional(),
        postcode: z.string().optional(),
        country: z.literal('Bangladesh').optional()
    }).optional(),
    bankDetails: z.object({
        accountHolderName: z.string().optional(),
        accountNumber: z.string().optional(),
        bankName: z.string().optional(),
        ifscCode: z.string().optional()
    }).optional(),
    settings: z.object({
        autoAcceptOrders: z.boolean().optional(),
        notificationEmail: z.boolean().optional(),
        notificationSMS: z.boolean().optional()
    }).optional()
});

export async function GET(request) {
    try {
        await connectDB()

        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value

        const tokenResult = await handleTokenVerification(token, 'vendor')
        if (!tokenResult.success) {
            return response(false, tokenResult.status, tokenResult.message)
        }

        const { user } = tokenResult
        const vendorId = user.vendorId

        // Get vendor information
        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return response(false, 404, 'Vendor not found')
        }

        // Get user information
        const userInfo = await UserModel.findById(user._id)
            .select('-password')
            .lean()

        // Prepare response data (exclude sensitive information)
        const vendorData = {
            _id: vendor._id,
            businessName: vendor.businessName,
            businessType: vendor.businessType,
            businessDescription: vendor.businessDescription,
            website: vendor.website,
            contactPerson: vendor.contactPerson,
            businessAddress: vendor.businessAddress,
            bankDetails: {
                accountHolderName: vendor.bankDetails.accountHolderName,
                bankName: vendor.bankDetails.bankName,
                // Don't include sensitive bank details in response
                verified: vendor.bankDetails.verified
            },
            commissionRate: vendor.commissionRate,
            status: vendor.status,
            verificationStatus: vendor.verificationStatus,
            verificationNotes: vendor.verificationNotes,
            metrics: vendor.metrics,
            settings: vendor.settings,
            approvedAt: vendor.approvedAt,
            createdAt: vendor.createdAt,
            updatedAt: vendor.updatedAt
        }

        return response(true, 200, 'Profile retrieved successfully', {
            vendor: vendorData,
            user: userInfo
        })

    } catch (error) {
        return catchError(error)
    }
}

export async function PUT(request) {
    try {
        await connectDB()

        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value

        const tokenResult = await handleTokenVerification(token, 'vendor')
        if (!tokenResult.success) {
            return response(false, tokenResult.status, tokenResult.message)
        }

        const { user } = tokenResult
        const vendorId = user.vendorId

        // Get vendor information
        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return response(false, 404, 'Vendor not found')
        }

        const payload = await request.json()

        // Validate the update data
        const validatedData = vendorProfileSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 400, 'Invalid input data', validatedData.error)
        }

        const updateData = validatedData.data

        // Check for email/phone uniqueness if being updated
        if (updateData.contactPerson?.email || updateData.contactPerson?.phone) {
            const contactPerson = updateData.contactPerson
            const email = contactPerson.email || vendor.contactPerson.email
            const phone = contactPerson.phone || vendor.contactPerson.phone

            // Check if email is already taken by another vendor
            if (contactPerson.email) {
                const existingVendor = await VendorModel.findOne({
                    'contactPerson.email': email,
                    _id: { $ne: vendorId },
                    deletedAt: null
                })

                if (existingVendor) {
                    return response(false, 400, 'Email is already registered with another vendor')
                }

                // Check if email is already taken by a user
                const existingUser = await UserModel.findOne({
                    email: email,
                    role: { $ne: 'vendor' },
                    deletedAt: null
                })

                if (existingUser) {
                    return response(false, 400, 'Email is already registered with another user')
                }
            }

            // Check if phone is already taken by another vendor
            if (contactPerson.phone) {
                const existingVendor = await VendorModel.findOne({
                    'contactPerson.phone': phone,
                    _id: { $ne: vendorId },
                    deletedAt: null
                })

                if (existingVendor) {
                    return response(false, 400, 'Phone number is already registered with another vendor')
                }

                // Check if phone is already taken by a user
                const existingUser = await UserModel.findOne({
                    phone: phone,
                    role: { $ne: 'vendor' },
                    deletedAt: null
                })

                if (existingUser) {
                    return response(false, 400, 'Phone number is already registered with another user')
                }
            }
        }

        // Update vendor information
        const updatedVendor = await VendorModel.findByIdAndUpdate(
            vendorId,
            { $set: updateData },
            { new: true, runValidators: true }
        )

        // Update user information if contact person details changed
        if (updateData.contactPerson) {
            const userUpdateData = {}
            
            if (updateData.contactPerson.name) {
                userUpdateData.name = updateData.contactPerson.name
            }
            if (updateData.contactPerson.email) {
                userUpdateData.email = updateData.contactPerson.email
            }
            if (updateData.contactPerson.phone) {
                userUpdateData.phone = updateData.contactPerson.phone
            }

            if (Object.keys(userUpdateData).length > 0) {
                await UserModel.findByIdAndUpdate(
                    user._id,
                    { $set: userUpdateData },
                    { new: true }
                )
            }
        }

        return response(true, 200, 'Profile updated successfully', {
            vendor: updatedVendor
        })

    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value

        const tokenResult = await handleTokenVerification(token, 'vendor')
        if (!tokenResult.success) {
            return response(false, tokenResult.status, tokenResult.message)
        }

        const { user } = tokenResult
        const vendorId = user.vendorId

        // Get vendor information
        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return response(false, 404, 'Vendor not found')
        }

        const payload = await request.json()
        const { action, data } = payload

        switch (action) {
            case 'update_password':
                return await updatePassword(user._id, data)
            case 'update_bank_details':
                return await updateBankDetails(vendorId, data)
            case 'request_verification':
                return await requestVerification(vendorId)
            default:
                return response(false, 400, 'Invalid action')
        }

    } catch (error) {
        return catchError(error)
    }
}

// Helper function to update password
async function updatePassword(userId, data) {
    const { currentPassword, newPassword } = data

    if (!currentPassword || !newPassword) {
        return response(false, 400, 'Current password and new password are required')
    }

    if (newPassword.length < 6) {
        return response(false, 400, 'New password must be at least 6 characters')
    }

    const user = await UserModel.findById(userId).select('+password')
    if (!user) {
        return response(false, 404, 'User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
        return response(false, 400, 'Current password is incorrect')
    }

    // Update password
    user.password = newPassword
    await user.save()

    return response(true, 200, 'Password updated successfully')
}

// Helper function to update bank details
async function updateBankDetails(vendorId, bankDetails) {
    const { accountHolderName, accountNumber, bankName, ifscCode } = bankDetails

    if (!accountHolderName || !accountNumber || !bankName || !ifscCode) {
        return response(false, 400, 'All bank details are required')
    }

    // Reset verification status when bank details are updated
    const updatedVendor = await VendorModel.findByIdAndUpdate(
        vendorId,
        {
            $set: {
                bankDetails: {
                    accountHolderName,
                    accountNumber,
                    bankName,
                    ifscCode,
                    verified: false
                }
            }
        },
        { new: true }
    )

    return response(true, 200, 'Bank details updated successfully. Verification is pending.', {
        vendor: updatedVendor
    })
}

// Helper function to request verification
async function requestVerification(vendorId) {
    const vendor = await VendorModel.findById(vendorId)

    if (!vendor) {
        return response(false, 404, 'Vendor not found')
    }

    // Check if vendor has all required documents
    const hasTradeLicense = vendor.documents.tradeLicense.url
    const hasNationalId = vendor.documents.nationalId.url

    if (!hasTradeLicense || !hasNationalId) {
        return response(false, 400, 'Please upload all required documents before requesting verification')
    }

    // Update verification status to pending
    const updatedVendor = await VendorModel.findByIdAndUpdate(
        vendorId,
        {
            $set: {
                verificationStatus: 'pending',
                verificationNotes: ''
            }
        },
        { new: true }
    )

    return response(true, 200, 'Verification request submitted successfully', {
        vendor: updatedVendor
    })
}
