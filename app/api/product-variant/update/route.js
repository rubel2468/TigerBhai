import { isAuthenticated, handleTokenVerification } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import ProductVariantModel from "@/models/ProductVariant.model"
import ProductModel from "@/models/Product.model"
import VendorModel from "@/models/Vendor.model"
import { cookies } from "next/headers"

export async function PUT(request) {
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
        const payload = await request.json()

        const schema = zSchema.pick({
            _id: true,
            product: true,
            sku: true,
            color: true,
            size: true,
            mrp: true,
            sellingPrice: true,
            discountPercentage: true,
            media: true
        })

        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const validatedData = validate.data
        const singleMediaId = Array.isArray(validatedData.media) ? validatedData.media[0] : validatedData.media

        const getProductVariant = await ProductVariantModel.findOne({ deletedAt: null, _id: validatedData._id })
        if (!getProductVariant) {
            return response(false, 404, 'Data not found.')
        }

        // For vendors, validate that the variant belongs to their product
        if (isVendor && vendorId) {
            const product = await ProductModel.findById(getProductVariant.product)
            if (!product || product.vendor.toString() !== vendorId) {
                return response(false, 403, 'You can only update variants of your own products.')
            }
        }

        getProductVariant.product = validatedData.product
        getProductVariant.color = validatedData.color
        getProductVariant.size = validatedData.size
        getProductVariant.sku = validatedData.sku
        getProductVariant.mrp = validatedData.mrp
        getProductVariant.sellingPrice = validatedData.sellingPrice
        getProductVariant.discountPercentage = validatedData.discountPercentage
        getProductVariant.media = singleMediaId
        await getProductVariant.save()

        return response(true, 200, 'Product variant updated successfully.')

    } catch (error) {
        return catchError(error)
    }
}