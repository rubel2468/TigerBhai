import { isAuthenticated, handleTokenVerification } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import ProductModel from "@/models/Product.model"
import VendorModel from "@/models/Vendor.model"
import { encode } from "entities"
import { cookies } from "next/headers"

export async function POST(request) {
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
            name: true,
            slug: true,
            category: true,
            mrp: true,
            sellingPrice: true,
            discountPercentage: true,
            description: true,
            shortDescription: true,
            whatsappLink: true,
            offer: true,
            companyDetails: true,
            media: true,
            videos: true
        })


        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const productData = validate.data

        const newProduct = new ProductModel({
            name: productData.name,
            slug: productData.slug,
            category: productData.category,
            mrp: productData.mrp,
            sellingPrice: productData.sellingPrice,
            discountPercentage: productData.discountPercentage,
            description: encode(productData.description),
            shortDescription: productData.shortDescription || '',
            whatsappLink: productData.whatsappLink || '',
            offer: productData.offer || '',
            companyDetails: productData.companyDetails || '',
            media: productData.media,
            videos: productData.videos || [],
            vendor: isVendor ? vendorId : null, // null for admin products
            vendorSettings: {
                isActive: true,
                isFeatured: false,
                allowReviews: true
            }
        })

        await newProduct.save()

        return response(true, 200, 'Product added successfully.')

    } catch (error) {
        return catchError(error)
    }
}