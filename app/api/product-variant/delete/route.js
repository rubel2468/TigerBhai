import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated, handleTokenVerification } from "@/lib/authentication";
import ProductVariantModel from "@/models/ProductVariant.model";
import ProductModel from "@/models/Product.model";
import VendorModel from "@/models/Vendor.model";
import { cookies } from "next/headers";
import mongoose from "mongoose";
 
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

        const ids = payload.ids || []
        const deleteType = payload.deleteType

        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.')
        }

        const data = await ProductVariantModel.find({ _id: { $in: ids } }).lean()
        if (!data.length) {
            return response(false, 404, 'Data not found.')
        }

        // For vendors, validate that all variants belong to their products
        if (isVendor && vendorId) {
            const productIds = [...new Set(data.map(variant => variant.product))]
            const products = await ProductModel.find({ _id: { $in: productIds } })
            
            for (const product of products) {
                if (product.vendor.toString() !== vendorId) {
                    return response(false, 403, 'You can only delete variants of your own products.')
                }
            }
        }

        if (!['SD', 'RSD', 'PD'].includes(deleteType)) {
            return response(false, 400, 'Invalid delete operation. Delete type should be SD, RSD, or PD for this route.')
        }

        if (deleteType === 'SD') {
            await ProductVariantModel.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: new Date().toISOString() } });
        } else if (deleteType === 'RSD') {
            await ProductVariantModel.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: null } });
        } else if (deleteType === 'PD') {
            await ProductVariantModel.deleteMany({ _id: { $in: ids } });
        }


        let message = ''
        if (deleteType === 'SD') {
            message = 'Data moved into trash.'
        } else if (deleteType === 'RSD') {
            message = 'Data restored.'
        } else if (deleteType === 'PD') {
            message = 'Data permanently deleted.'
        }
        
        return response(true, 200, message)

    } catch (error) {
        return catchError(error)
    }
}


export async function DELETE(request) {
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
        const ids = payload.ids || []
        const deleteType = payload.deleteType

        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.')
        }

        const data = await ProductVariantModel.find({ _id: { $in: ids } }).lean()
        if (!data.length) {
            return response(false, 404, 'Data not found.')
        }

        // For vendors, validate that all variants belong to their products
        if (isVendor && vendorId) {
            const productIds = [...new Set(data.map(variant => variant.product))]
            const products = await ProductModel.find({ _id: { $in: productIds } })
            
            for (const product of products) {
                if (product.vendor.toString() !== vendorId) {
                    return response(false, 403, 'You can only delete variants of your own products.')
                }
            }
        }

        if (deleteType !== 'PD') {
            return response(false, 400, 'Invalid delete operation. Delete type should be PD for this route.')
        }

        await ProductVariantModel.deleteMany({ _id: { $in: ids } })

        return response(true, 200, 'Data permanently deleted.')
    } catch (error) {
        return catchError(error)
    }
}