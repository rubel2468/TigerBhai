import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated, handleTokenVerification } from "@/lib/authentication";
import { isValidObjectId } from "mongoose";
import MediaModel from "@/models/Media.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import ProductModel from "@/models/Product.model";
import VendorModel from "@/models/Vendor.model";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
    try {
        await connectDB()
        
        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value
        
        // Check if user is admin or vendor
        let auth = await isAuthenticated('admin')
        let isVendor = false
        let vendorId = null
        
        if (!auth.isAuth) {
            // Try vendor authentication
            const tokenResult = await handleTokenVerification(token, 'vendor')
            if (!tokenResult.success) {
                return response(false, 403, 'Unauthorized.')
            }
            
            const { user } = tokenResult
            vendorId = user.vendorId
            
            // Check if vendor is approved
            const vendor = await VendorModel.findById(vendorId)
            if (!vendor || vendor.status !== 'approved') {
                return response(false, 403, 'Your vendor account is not approved yet.')
            }
            
            isVendor = true
        }

        const getParams = await params
        const id = getParams.id

        const filter = {
            deletedAt: null
        }

        if (!isValidObjectId(id)) {
            return response(false, 400, 'Invalid object id.')
        }

        filter._id = id

        const getProductVariant = await ProductVariantModel.findOne(filter).populate('media', '_id filePath').lean()

        if (!getProductVariant) {
            return response(false, 404, 'Product variant not found.')
        }

        // For vendors, validate that the variant belongs to their product
        if (isVendor && vendorId) {
            const product = await ProductModel.findById(getProductVariant.product)
            if (!product || product.vendor.toString() !== vendorId) {
                return response(false, 403, 'You can only view variants of your own products.')
            }
        }

        return response(true, 200, 'Product variant found.', getProductVariant)

    } catch (error) {
        return catchError(error)
    }
}