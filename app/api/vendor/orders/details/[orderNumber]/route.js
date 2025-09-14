import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import OrderModel from "@/models/Order.model";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
    try {
        await connectDB()

        const { orderNumber } = params
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

        // Find the order by order number
        const order = await OrderModel.findOne({
            orderNumber: orderNumber,
            'orderItems.vendor': vendorId,
            deletedAt: null
        })
        .populate('user', 'name email phone')
        .populate('orderItems.products.productId', 'name')
        .populate('orderItems.products.variantId', 'color size')
        .lean()

        if (!order) {
            return response(false, 404, 'Order not found or you do not have permission to view this order')
        }

        // Process order to include only vendor-specific items
        const vendorOrderItems = order.orderItems.filter(item => 
            item.vendor.toString() === vendorId.toString()
        )

        const vendorSubtotal = vendorOrderItems.reduce((sum, item) => sum + item.subtotal, 0)
        const vendorCommission = vendorOrderItems.reduce((sum, item) => sum + item.commission, 0)
        const vendorEarning = vendorOrderItems.reduce((sum, item) => sum + item.vendorEarning, 0)

        const processedOrder = {
            _id: order._id,
            orderNumber: order.orderNumber,
            customer: {
                name: order.user?.name || order.name,
                email: order.user?.email || order.email,
                phone: order.user?.phone || order.phone
            },
            address: order.address,
            ordernote: order.ordernote,
            orderItems: vendorOrderItems,
            vendorSubtotal,
            vendorCommission,
            vendorEarning,
            status: order.status,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }

        return response(true, 200, 'Order details retrieved successfully', processedOrder)

    } catch (error) {
        return catchError(error)
    }
}

