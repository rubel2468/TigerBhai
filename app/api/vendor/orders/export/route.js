import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import OrderModel from "@/models/Order.model";
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

        // Get all orders for this vendor
        const orders = await OrderModel.find({
            'orderItems.vendor': vendorId,
            deletedAt: null
        })
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .lean()

        // Process orders to include only vendor-specific items
        const processedOrders = orders.map(order => {
            const vendorOrderItems = order.orderItems.filter(item => 
                item.vendor.toString() === vendorId.toString()
            )

            const vendorSubtotal = vendorOrderItems.reduce((sum, item) => sum + item.subtotal, 0)
            const vendorCommission = vendorOrderItems.reduce((sum, item) => sum + item.commission, 0)
            const vendorEarning = vendorOrderItems.reduce((sum, item) => sum + item.vendorEarning, 0)

            return {
                orderNumber: order.orderNumber,
                customerName: order.user?.name || order.name,
                customerEmail: order.user?.email || order.email,
                customerPhone: order.user?.phone || order.phone,
                itemCount: vendorOrderItems.length,
                vendorSubtotal,
                vendorCommission,
                vendorEarning,
                status: order.status,
                orderDate: order.createdAt,
                address: order.address
            }
        })

        // Create CSV data
        const csvData = processedOrders.map(order => ({
            'Order Number': order.orderNumber,
            'Customer Name': order.customerName,
            'Customer Email': order.customerEmail,
            'Customer Phone': order.customerPhone,
            'Item Count': order.itemCount,
            'Subtotal': order.vendorSubtotal,
            'Commission': order.vendorCommission,
            'Your Earning': order.vendorEarning,
            'Status': order.status,
            'Order Date': new Date(order.orderDate).toLocaleDateString(),
            'Address': order.address
        }))

        return response(true, 200, 'Orders exported successfully', { orders: csvData })

    } catch (error) {
        return catchError(error)
    }
}

