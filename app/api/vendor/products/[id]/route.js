import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import ProductModel from "@/models/Product.model";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
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

        // Check if vendor is approved
        if (vendor.status !== 'approved') {
            return response(false, 403, 'Vendor account is not approved yet')
        }

        const { id } = await params

        // Get product and verify ownership
        const product = await ProductModel.findOne({
            _id: id,
            vendor: vendorId,
            deletedAt: null
        })
        .populate('category', 'name')
        .populate('media', 'filePath alt')
        .lean()

        if (!product) {
            return response(false, 404, 'Product not found or does not belong to you')
        }

        return response(true, 200, 'Product retrieved successfully', product)

    } catch (error) {
        return catchError(error)
    }
}

export async function PUT(request, { params }) {
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

        // Check if vendor is approved
        if (vendor.status !== 'approved') {
            return response(false, 403, 'Vendor account is not approved yet')
        }

        const { id } = await params
        const payload = await request.json()

        // Verify product ownership before updating
        const existingProduct = await ProductModel.findOne({
            _id: id,
            vendor: vendorId,
            deletedAt: null
        })

        if (!existingProduct) {
            return response(false, 404, 'Product not found or does not belong to you')
        }

        // Update product
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            {
                ...payload,
                vendor: vendorId // Ensure vendor is set
            },
            { new: true }
        )
        .populate('category', 'name')
        .populate('media', 'filePath alt')
        .lean()

        return response(true, 200, 'Product updated successfully', updatedProduct)

    } catch (error) {
        return catchError(error)
    }
}



