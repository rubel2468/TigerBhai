import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import ProductModel from "@/models/Product.model";
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

        // Get basic statistics
        const [
            totalProducts,
            activeProducts,
            totalOrders,
            pendingOrders,
            totalSales
        ] = await Promise.all([
            // Total products count
            ProductModel.countDocuments({
                vendor: vendorId,
                deletedAt: null
            }),
            
            // Active products count
            ProductModel.countDocuments({
                vendor: vendorId,
                'vendorSettings.isActive': true,
                deletedAt: null
            }),
            
            // Total orders count
            OrderModel.countDocuments({
                'orderItems.vendor': vendorId,
                deletedAt: null
            }),
            
            // Pending orders count
            OrderModel.countDocuments({
                'orderItems.vendor': vendorId,
                'orderItems.status': 'pending',
                deletedAt: null
            }),
            
            // Total sales amount
            OrderModel.aggregate([
                {
                    $match: {
                        'orderItems.vendor': vendorId,
                        deletedAt: null,
                        status: { $in: ['delivered', 'completed'] }
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
                        _id: null,
                        totalSales: { $sum: '$orderItems.vendorEarning' }
                    }
                }
            ])
        ])

        const salesAmount = totalSales.length > 0 ? totalSales[0].totalSales : 0

        // Get recent orders (last 5)
        const recentOrders = await OrderModel.find({
            'orderItems.vendor': vendorId,
            deletedAt: null
        })
        .populate('user', 'name email phone')
        .populate('orderItems.products.productId', 'name')
        .populate('orderItems.products.variantId', 'color size')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()

        // Get low stock products
        const lowStockProducts = await ProductModel.find({
            vendor: vendorId,
            deletedAt: null,
            // Assuming you have stock tracking in ProductVariant
            // This would need to be adjusted based on your actual stock tracking
        })
        .populate('category', 'name')
        .limit(5)
        .lean()

        // Get monthly sales data for chart (last 6 months)
        const monthlySales = await OrderModel.aggregate([
            {
                $match: {
                    'orderItems.vendor': vendorId,
                    deletedAt: null,
                    status: { $in: ['delivered', 'completed'] },
                    createdAt: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
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
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalSales: { $sum: '$orderItems.vendorEarning' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ])

        const dashboardStats = {
            overview: {
                totalProducts,
                activeProducts,
                totalOrders,
                pendingOrders,
                totalSales: salesAmount
            },
            vendor: {
                businessName: vendor.businessName,
                status: vendor.status,
                verificationStatus: vendor.verificationStatus,
                commissionRate: vendor.commissionRate
            },
            recentOrders: recentOrders.map(order => ({
                _id: order._id,
                orderNumber: order.orderNumber,
                customerName: order.user?.name || order.name,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
                items: order.orderItems.filter(item => item.vendor.toString() === vendorId.toString())
            })),
            lowStockProducts: lowStockProducts.map(product => ({
                _id: product._id,
                name: product.name,
                category: product.category?.name,
                sellingPrice: product.sellingPrice,
                // Add stock information when available
            })),
            monthlySales: monthlySales.map(sale => ({
                month: sale._id.month,
                year: sale._id.year,
                totalSales: sale.totalSales,
                orderCount: sale.orderCount
            }))
        }

        return response(true, 200, 'Dashboard stats retrieved successfully', dashboardStats)

    } catch (error) {
        return catchError(error)
    }
}
