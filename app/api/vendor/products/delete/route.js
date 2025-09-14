import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import ProductModel from "@/models/Product.model";
import { cookies } from "next/headers";

export async function DELETE(request) {
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

        const { searchParams } = new URL(request.url)
        const ids = searchParams.get('ids')
        const deleteType = searchParams.get('deleteType') || 'SD'

        if (!ids) {
            return response(false, 400, 'Product IDs are required')
        }

        const productIds = ids.split(',')

        // Verify that all products belong to this vendor
        const products = await ProductModel.find({
            _id: { $in: productIds },
            vendor: vendorId
        })

        if (products.length !== productIds.length) {
            return response(false, 403, 'Some products do not belong to you')
        }

        let result
        if (deleteType === 'SD') {
            // Soft delete
            result = await ProductModel.updateMany(
                { _id: { $in: productIds }, vendor: vendorId },
                { deletedAt: new Date() }
            )
        } else if (deleteType === 'PD') {
            // Permanent delete
            result = await ProductModel.deleteMany({
                _id: { $in: productIds },
                vendor: vendorId
            })
        } else if (deleteType === 'RSD') {
            // Restore from soft delete
            result = await ProductModel.updateMany(
                { _id: { $in: productIds }, vendor: vendorId },
                { $unset: { deletedAt: 1 } }
            )
        }

        return response(true, 200, 'Products processed successfully', { modifiedCount: result.modifiedCount || result.deletedCount })

    } catch (error) {
        return catchError(error)
    }
}



