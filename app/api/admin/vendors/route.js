import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import UserModel from "@/models/User.model";
import OrderModel from "@/models/Order.model";
import { z } from "zod";
import { cookies } from "next/headers";

export async function GET(request) {
    try {
        await connectDB()

        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value

        const tokenResult = await handleTokenVerification(token, 'admin')
        if (!tokenResult.success) {
            return response(false, tokenResult.status, tokenResult.message)
        }

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const verificationStatus = searchParams.get('verificationStatus')
        const page = parseInt(searchParams.get('page')) || 1
        const limit = parseInt(searchParams.get('limit')) || 10
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = searchParams.get('sortOrder') || 'desc'
        const search = searchParams.get('search')

        // Build query
        const query = { deletedAt: null }

        if (status && status !== 'all') {
            query.status = status
        }

        if (verificationStatus && verificationStatus !== 'all') {
            query.verificationStatus = verificationStatus
        }

        if (search) {
            query.$or = [
                { businessName: { $regex: search, $options: 'i' } },
                { 'contactPerson.name': { $regex: search, $options: 'i' } },
                { 'contactPerson.email': { $regex: search, $options: 'i' } },
                { 'businessAddress.city': { $regex: search, $options: 'i' } }
            ]
        }

        // Calculate skip for pagination
        const skip = (page - 1) * limit

        // Build sort object
        const sort = {}
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1

        // Get vendors with pagination
        const vendors = await VendorModel.find(query)
            .populate({
                path: 'metrics',
                select: 'totalSales totalOrders averageRating totalReviews'
            })
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean()

        // Get total count for pagination
        const totalVendors = await VendorModel.countDocuments(query)

        // Get vendor statistics
        const stats = await VendorModel.aggregate([
            {
                $match: { deletedAt: null }
            },
            {
                $group: {
                    _id: null,
                    totalVendors: { $sum: 1 },
                    pendingVendors: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    approvedVendors: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    rejectedVendors: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    },
                    suspendedVendors: {
                        $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
                    },
                    verifiedVendors: {
                        $sum: { $cond: [{ $eq: ['$verificationStatus', 'verified'] }, 1, 0] }
                    },
                    pendingVerification: {
                        $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending'] }, 1, 0] }
                    }
                }
            }
        ])

        const result = {
            vendors: vendors.map(vendor => ({
                _id: vendor._id,
                businessName: vendor.businessName,
                businessType: vendor.businessType,
                contactPerson: vendor.contactPerson,
                businessAddress: vendor.businessAddress,
                status: vendor.status,
                verificationStatus: vendor.verificationStatus,
                commissionRate: vendor.commissionRate,
                documents: vendor.documents,
                bankDetails: vendor.bankDetails,
                metrics: vendor.metrics,
                createdAt: vendor.createdAt,
                approvedAt: vendor.approvedAt
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalVendors / limit),
                totalVendors,
                hasNextPage: page < Math.ceil(totalVendors / limit),
                hasPrevPage: page > 1
            },
            stats: stats[0] || {}
        }

        return response(true, 200, 'Vendors retrieved successfully', result)

    } catch (error) {
        return catchError(error)
    }
}

export async function PUT(request) {
    try {
        await connectDB()

        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value

        const tokenResult = await handleTokenVerification(token, 'admin')
        if (!tokenResult.success) {
            return response(false, tokenResult.status, tokenResult.message)
        }

        const payload = await request.json()
        const { vendorId, action, data } = payload

        if (!vendorId || !action) {
            return response(false, 400, 'Vendor ID and action are required')
        }

        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return response(false, 404, 'Vendor not found')
        }

        switch (action) {
            case 'update_status':
                return await updateVendorStatus(vendorId, data)
            case 'update_verification':
                return await updateVerificationStatus(vendorId, data)
            case 'update_commission':
                return await updateCommissionRate(vendorId, data)
            case 'update_documents':
                return await updateDocumentVerification(vendorId, data)
            default:
                return response(false, 400, 'Invalid action')
        }

    } catch (error) {
        return catchError(error)
    }
}

// Helper function to update vendor status
async function updateVendorStatus(vendorId, data) {
    const { status, notes } = data

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
        return response(false, 400, 'Invalid status')
    }

    const updateData = { status }

    if (status === 'approved') {
        updateData.approvedAt = new Date()
    }

    if (notes) {
        updateData.verificationNotes = notes
    }

    const updatedVendor = await VendorModel.findByIdAndUpdate(
        vendorId,
        { $set: updateData },
        { new: true }
    )

    // Update user role if vendor is approved
    if (status === 'approved') {
        await UserModel.updateOne(
            { vendorId: vendorId },
            { $set: { role: 'vendor' } }
        )
    }

    return response(true, 200, `Vendor status updated to ${status}`, {
        vendor: updatedVendor
    })
}

// Helper function to update verification status
async function updateVerificationStatus(vendorId, data) {
    const { verificationStatus, notes } = data

    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
        return response(false, 400, 'Invalid verification status')
    }

    const updateData = { verificationStatus }

    if (notes) {
        updateData.verificationNotes = notes
    }

    const updatedVendor = await VendorModel.findByIdAndUpdate(
        vendorId,
        { $set: updateData },
        { new: true }
    )

    return response(true, 200, `Verification status updated to ${verificationStatus}`, {
        vendor: updatedVendor
    })
}

// Helper function to update commission rate
async function updateCommissionRate(vendorId, data) {
    const { commissionRate } = data

    if (commissionRate < 0 || commissionRate > 50) {
        return response(false, 400, 'Commission rate must be between 0 and 50')
    }

    const updatedVendor = await VendorModel.findByIdAndUpdate(
        vendorId,
        { $set: { commissionRate } },
        { new: true }
    )

    return response(true, 200, 'Commission rate updated successfully', {
        vendor: updatedVendor
    })
}

// Helper function to update document verification
async function updateDocumentVerification(vendorId, data) {
    const { documentType, verified } = data

    if (!['tradeLicense', 'nationalId', 'taxCertificate'].includes(documentType)) {
        return response(false, 400, 'Invalid document type')
    }

    const updateData = {}
    updateData[`documents.${documentType}.verified`] = verified

    const updatedVendor = await VendorModel.findByIdAndUpdate(
        vendorId,
        { $set: updateData },
        { new: true }
    )

    return response(true, 200, `${documentType} verification updated`, {
        vendor: updatedVendor
    })
}
