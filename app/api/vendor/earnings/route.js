import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import OrderModel from "@/models/Order.model";
import { calculateVendorEarnings } from "@/lib/commissionCalculator";
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

        if (vendor.status !== 'approved') {
            return response(false, 403, 'Vendor account is not approved yet')
        }

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30' // days
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        // Calculate date range
        let dateRange
        if (startDate && endDate) {
            dateRange = {
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            }
        } else {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - parseInt(period))
            dateRange = { startDate: start, endDate: end }
        }

        // Get vendor orders
        const orders = await OrderModel.find({
            'orderItems.vendor': vendorId,
            deletedAt: null,
            createdAt: {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            }
        })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .lean()

        // Calculate earnings
        const earnings = calculateVendorEarnings(orders, dateRange.startDate, dateRange.endDate)

        // Get detailed earnings breakdown
        const earningsBreakdown = await OrderModel.aggregate([
            {
                $match: {
                    'orderItems.vendor': vendorId,
                    deletedAt: null,
                    createdAt: {
                        $gte: dateRange.startDate,
                        $lte: dateRange.endDate
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
                        status: '$orderItems.status',
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    totalEarnings: { $sum: '$orderItems.vendorEarning' },
                    totalCommission: { $sum: '$orderItems.commission' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ])

        // Get monthly earnings for chart
        const monthlyEarnings = await OrderModel.aggregate([
            {
                $match: {
                    'orderItems.vendor': vendorId,
                    deletedAt: null,
                    'orderItems.status': 'delivered',
                    createdAt: {
                        $gte: dateRange.startDate,
                        $lte: dateRange.endDate
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
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    dailyEarnings: { $sum: '$orderItems.vendorEarning' },
                    dailyCommission: { $sum: '$orderItems.commission' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ])

        // Get top products by earnings
        const topProducts = await OrderModel.aggregate([
            {
                $match: {
                    'orderItems.vendor': vendorId,
                    deletedAt: null,
                    'orderItems.status': 'delivered',
                    createdAt: {
                        $gte: dateRange.startDate,
                        $lte: dateRange.endDate
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
                $unwind: '$orderItems.products'
            },
            {
                $group: {
                    _id: {
                        productId: '$orderItems.products.productId',
                        productName: '$orderItems.products.name'
                    },
                    totalEarnings: { $sum: { $multiply: ['$orderItems.products.vendorPrice', '$orderItems.products.qty'] } },
                    totalQuantity: { $sum: '$orderItems.products.qty' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { totalEarnings: -1 }
            },
            {
                $limit: 10
            }
        ])

        // Get payout history
        const payoutHistory = await OrderModel.find({
            'orderItems.vendor': vendorId,
            deletedAt: null,
            payoutStatus: { $in: ['completed', 'processing'] },
            createdAt: {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            }
        })
        .select('payoutDate payoutReference payoutStatus orderItems')
        .sort({ payoutDate: -1 })
        .lean()

        // Calculate pending payout
        const pendingPayout = await OrderModel.aggregate([
            {
                $match: {
                    'orderItems.vendor': vendorId,
                    deletedAt: null,
                    'orderItems.status': 'delivered',
                    payoutStatus: 'pending'
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
                    pendingAmount: { $sum: '$orderItems.vendorEarning' },
                    orderCount: { $sum: 1 }
                }
            }
        ])

        const result = {
            vendor: {
                businessName: vendor.businessName,
                commissionRate: vendor.commissionRate,
                status: vendor.status
            },
            period: dateRange,
            summary: {
                totalEarnings: earnings.totalEarnings,
                totalCommission: earnings.totalCommission,
                totalOrders: earnings.totalOrders,
                deliveredOrders: earnings.deliveredOrders,
                averageOrderValue: earnings.averageOrderValue,
                pendingPayout: pendingPayout.length > 0 ? pendingPayout[0].pendingAmount : 0,
                pendingOrders: pendingPayout.length > 0 ? pendingPayout[0].orderCount : 0
            },
            breakdown: earningsBreakdown,
            monthlyEarnings: monthlyEarnings,
            topProducts: topProducts,
            payoutHistory: payoutHistory.map(payout => ({
                _id: payout._id,
                payoutDate: payout.payoutDate,
                payoutReference: payout.payoutReference,
                payoutStatus: payout.payoutStatus,
                amount: payout.orderItems.reduce((sum, item) => {
                    if (item.vendor.toString() === vendorId.toString()) {
                        return sum + item.vendorEarning
                    }
                    return sum
                }, 0)
            }))
        }

        return response(true, 200, 'Earnings data retrieved successfully', result)

    } catch (error) {
        return catchError(error)
    }
}
