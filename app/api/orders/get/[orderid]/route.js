import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import VendorModel from "@/models/Vendor.model";

export async function GET(request, { params }) {
    try {
        await connectDB()
        const getParams = await params
        const orderid = getParams.orderid

        if (!orderid) {
            return response(false, 404, 'Order not found.')
        }

        const orderData = await OrderModel.findOne({ orderNumber: orderid }).populate({
            path: 'products.productId',
            select: 'name slug',
            populate: { path: 'media' }
        }).populate({
            path: 'products.variantId',
            populate: { path: 'media' }
        }).populate({
            path: 'orderItems.vendor',
            select: 'businessName ownerName email'
        }).populate({
            path: 'orderItems.products.productId',
            select: 'name slug',
            populate: { path: 'media' }
        }).populate({
            path: 'orderItems.products.variantId',
            populate: { path: 'media' }
        }).lean()

        if (!orderData) {
            return response(false, 404, 'Order not found.')
        }

        return response(true, 200, 'Order found.', orderData)

    } catch (error) {
        return catchError(error)
    }
}