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

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page')) || 1
        const limit = parseInt(searchParams.get('limit')) || 10
        const sortBy = searchParams.get('sortBy') || 'createdAt'
        const sortOrder = searchParams.get('sortOrder') || 'desc'

        // Build query
        const query = {
            'orderItems.vendor': vendorId,
            deletedAt: null
        }

        if (status && status !== 'all') {
            query['orderItems.status'] = status
        }

        // Calculate skip for pagination
        const skip = (page - 1) * limit

        // Build sort object
        const sort = {}
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1

        // Get orders with pagination
        const orders = await OrderModel.find(query)
            .populate('user', 'name email phone')
            .populate('orderItems.products.productId', 'name')
            .populate('orderItems.products.variantId', 'color size')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean()

        // Get total count for pagination
        const totalOrders = await OrderModel.countDocuments(query)

        // Process orders to include only vendor-specific items
        const processedOrders = orders.map(order => {
            const vendorOrderItems = order.orderItems.filter(item => 
                item.vendor.toString() === vendorId.toString()
            )

            const vendorSubtotal = vendorOrderItems.reduce((sum, item) => sum + item.subtotal, 0)
            const vendorCommission = vendorOrderItems.reduce((sum, item) => sum + item.commission, 0)
            const vendorEarning = vendorOrderItems.reduce((sum, item) => sum + item.vendorEarning, 0)

            return {
                _id: order._id,
                orderNumber: order.orderNumber,
                customer: {
                    name: order.user?.name || order.name,
                    email: order.user?.email || order.email,
                    phone: order.user?.phone || order.phone
                },
                address: order.address,
                orderItems: vendorOrderItems,
                vendorSubtotal,
                vendorCommission,
                vendorEarning,
                status: order.status,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        })

        // Get order statistics
        const orderStats = await OrderModel.aggregate([
            {
                $match: {
                    'orderItems.vendor': vendorId,
                    deletedAt: null
                }
            },
            {
                $unwind: '$orderItems'
            },
            {
                $match: {
                    'orderItems.vendor': vendorId
                }
            },
            {
                $group: {
                    _id: '$orderItems.status',
                    count: { $sum: 1 },
                    totalEarning: { $sum: '$orderItems.vendorEarning' }
                }
            }
        ])

        const stats = {
            pending: { count: 0, totalEarning: 0 },
            confirmed: { count: 0, totalEarning: 0 },
            processing: { count: 0, totalEarning: 0 },
            shipped: { count: 0, totalEarning: 0 },
            delivered: { count: 0, totalEarning: 0 },
            cancelled: { count: 0, totalEarning: 0 }
        }

        orderStats.forEach(stat => {
            if (stats[stat._id]) {
                stats[stat._id] = {
                    count: stat.count,
                    totalEarning: stat.totalEarning
                }
            }
        })

        const result = {
            data: processedOrders,
            meta: {
                totalRowCount: totalOrders
            },
            stats
        }

        return response(true, 200, 'Orders retrieved successfully', result)

    } catch (error) {
        return catchError(error)
    }
}

export async function PUT(request) {
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

        const payload = await request.json()
        const { orderId, orderItemId, status, trackingNumber } = payload

        if (!orderId || !orderItemId || !status) {
            return response(false, 400, 'Order ID, Order Item ID, and status are required')
        }

        // Find the order
        const order = await OrderModel.findOne({
            _id: orderId,
            'orderItems.vendor': vendorId,
            deletedAt: null
        })

        if (!order) {
            return response(false, 404, 'Order not found')
        }

        // Find the specific order item for this vendor
        const orderItemIndex = order.orderItems.findIndex(item => 
            item._id.toString() === orderItemId && 
            item.vendor.toString() === vendorId.toString()
        )

        if (orderItemIndex === -1) {
            return response(false, 404, 'Order item not found')
        }

        // Update the order item status
        order.orderItems[orderItemIndex].status = status

        // Update tracking number if provided
        if (trackingNumber) {
            order.orderItems[orderItemIndex].trackingNumber = trackingNumber
        }

        // Set timestamps based on status
        const now = new Date()
        if (status === 'shipped') {
            order.orderItems[orderItemIndex].shippedAt = now
        } else if (status === 'delivered') {
            order.orderItems[orderItemIndex].deliveredAt = now
        }

        await order.save()

        return response(true, 200, 'Order status updated successfully')

    } catch (error) {
        return catchError(error)
    }
}
