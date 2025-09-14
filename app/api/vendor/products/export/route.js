import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import ProductModel from "@/models/Product.model";
import { cookies } from "next/headers";

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

        // Check if vendor is approved
        if (vendor.status !== 'approved') {
            return response(false, 403, 'Vendor account is not approved yet')
        }

        // Get all products for this vendor
        const products = await ProductModel.find({
            vendor: vendorId,
            deletedAt: null
        })
        .populate('category', 'name')
        .lean()

        // Format data for CSV export
        const csvData = products.map(product => ({
            'Product Name': product.name,
            'Slug': product.slug,
            'Category': product.category?.name || 'N/A',
            'MRP': product.mrp,
            'Selling Price': product.sellingPrice,
            'Discount %': product.discountPercentage,
            'Status': product.vendorSettings?.isActive ? 'Active' : 'Inactive',
            'Featured': product.vendorSettings?.isFeatured ? 'Yes' : 'No',
            'Created At': new Date(product.createdAt).toLocaleDateString()
        }))

        return response(true, 200, 'Products exported successfully', csvData)

    } catch (error) {
        return catchError(error)
    }
}



