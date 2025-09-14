import { isAuthenticated, handleTokenVerification } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import ProductVariantModel from "@/models/ProductVariant.model"
import ProductModel from "@/models/Product.model"
import VendorModel from "@/models/Vendor.model"
import { cookies } from "next/headers"
import mongoose from "mongoose"

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
            product: true,
            sku: true,
            color: true,
            mrp: true,
            sellingPrice: true,
            discountPercentage: true,
            media: true,
            sizesWithStock: true,
        })


        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const variantData = validate.data

        // For vendors, validate that the product belongs to them
        if (isVendor && vendorId) {
            const product = await ProductModel.findById(variantData.product)
            if (!product) {
                return response(false, 404, 'Product not found.')
            }
            
            if (product.vendor.toString() !== vendorId) {
                return response(false, 403, 'You can only create variants for your own products.')
            }
        }
        const singleMediaId = Array.isArray(variantData.media) ? variantData.media[0] : variantData.media

        const sizesWithStock = Array.isArray(variantData.sizesWithStock) && variantData.sizesWithStock.length > 0
            ? variantData.sizesWithStock
            : []

        if (sizesWithStock.length === 0) {
            return response(false, 400, 'Please provide at least one size with stock.')
        }

        // Create one variant per size object
        for (const { name, stock } of sizesWithStock) {
            const numericStock = typeof stock === 'string' ? parseInt(stock, 10) : stock
            const safeStock = Number.isFinite(numericStock) && numericStock >= 0 ? numericStock : 0
            const newProductVariant = new ProductVariantModel({
                product: variantData.product,
                color: variantData.color,
                size: name,
                sku: `${variantData.sku}-${name}`,
                mrp: variantData.mrp,
                sellingPrice: variantData.sellingPrice,
                discountPercentage: variantData.discountPercentage,
                media: singleMediaId,
                stock: safeStock,
            })
            await newProductVariant.save()
        }

        return response(true, 200, 'Product Variants added successfully.')

    } catch (error) {
        return catchError(error)
    }
}