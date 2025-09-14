import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import ReviewModel from "@/models/Review.model";
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
        const period = searchParams.get('period') || '30'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const metric = searchParams.get('metric') || 'overview'

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

        let result = {}

        switch (metric) {
            case 'overview':
                result = await getOverviewAnalytics(vendorId, dateRange)
                break
            case 'sales':
                result = await getSalesAnalytics(vendorId, dateRange)
                break
            case 'products':
                result = await getProductAnalytics(vendorId, dateRange)
                break
            case 'customers':
                result = await getCustomerAnalytics(vendorId, dateRange)
                break
            case 'performance':
                result = await getPerformanceAnalytics(vendorId, dateRange)
                break
            default:
                result = await getOverviewAnalytics(vendorId, dateRange)
        }

        return response(true, 200, 'Analytics data retrieved successfully', result)

    } catch (error) {
        return catchError(error)
    }
}

// Overview Analytics
async function getOverviewAnalytics(vendorId, dateRange) {
    const [orders, products, reviews] = await Promise.all([
        OrderModel.find({
            'orderItems.vendor': vendorId,
            deletedAt: null,
            createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
        }).lean(),
        
        ProductModel.find({
            vendor: vendorId,
            deletedAt: null
        }).populate('category', 'name').lean(),
        
        ReviewModel.find({
            product: { $in: await ProductModel.find({ vendor: vendorId }).distinct('_id') },
            deletedAt: null,
            createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
        }).lean()
    ])

    const earnings = calculateVendorEarnings(orders, dateRange.startDate, dateRange.endDate)

    // Calculate conversion rates and trends
    const totalViews = orders.length * 10 // Simulated view count
    const conversionRate = totalViews > 0 ? (orders.length / totalViews) * 100 : 0

    // Calculate average rating
    const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0

    // Calculate repeat customers
    const customerOrders = orders.reduce((acc, order) => {
        const customerId = order.user?.toString() || order.email
        if (!acc[customerId]) {
            acc[customerId] = 0
        }
        acc[customerId]++
        return acc
    }, {})

    const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length

    return {
        period: dateRange,
        summary: {
            totalEarnings: earnings.totalEarnings,
            totalOrders: earnings.totalOrders,
            totalProducts: products.length,
            totalReviews: reviews.length,
            averageRating: Math.round(averageRating * 100) / 100,
            conversionRate: Math.round(conversionRate * 100) / 100,
            repeatCustomers,
            totalCustomers: Object.keys(customerOrders).length
        }
    }
}

// Sales Analytics
async function getSalesAnalytics(vendorId, dateRange) {
    const orders = await OrderModel.find({
        'orderItems.vendor': vendorId,
        deletedAt: null,
        createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    }).lean()

    // Daily sales trend
    const dailySales = await OrderModel.aggregate([
        {
            $match: {
                'orderItems.vendor': vendorId,
                deletedAt: null,
                'orderItems.status': 'delivered',
                createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
            }
        },
        {
            $unwind: '$orderItems'
        },
        {
            $match: { 'orderItems.vendor': vendorId }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                dailyEarnings: { $sum: '$orderItems.vendorEarning' },
                dailyOrders: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ])

    // Sales by status
    const salesByStatus = await OrderModel.aggregate([
        {
            $match: {
                'orderItems.vendor': vendorId,
                deletedAt: null,
                createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
            }
        },
        {
            $unwind: '$orderItems'
        },
        {
            $match: { 'orderItems.vendor': vendorId }
        },
        {
            $group: {
                _id: '$orderItems.status',
                totalEarnings: { $sum: '$orderItems.vendorEarning' },
                orderCount: { $sum: 1 }
            }
        }
    ])

    // Top selling products
    const topProducts = await OrderModel.aggregate([
        {
            $match: {
                'orderItems.vendor': vendorId,
                deletedAt: null,
                'orderItems.status': 'delivered',
                createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
            }
        },
        {
            $unwind: '$orderItems'
        },
        {
            $match: { 'orderItems.vendor': vendorId }
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
                totalSales: { $sum: { $multiply: ['$orderItems.products.vendorPrice', '$orderItems.products.qty'] } },
                totalQuantity: { $sum: '$orderItems.products.qty' },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { totalSales: -1 } },
        { $limit: 10 }
    ])

    return {
        period: dateRange,
        dailySales,
        salesByStatus,
        topProducts
    }
}

// Product Analytics
async function getProductAnalytics(vendorId, dateRange) {
    const products = await ProductModel.find({
        vendor: vendorId,
        deletedAt: null
    }).populate('category', 'name').lean()

    // Product performance
    const productPerformance = await OrderModel.aggregate([
        {
            $match: {
                'orderItems.vendor': vendorId,
                deletedAt: null,
                createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
            }
        },
        {
            $unwind: '$orderItems'
        },
        {
            $match: { 'orderItems.vendor': vendorId }
        },
        {
            $unwind: '$orderItems.products'
        },
        {
            $group: {
                _id: '$orderItems.products.productId',
                totalSales: { $sum: { $multiply: ['$orderItems.products.vendorPrice', '$orderItems.products.qty'] } },
                totalQuantity: { $sum: '$orderItems.products.qty' },
                orderCount: { $sum: 1 },
                averageOrderValue: { $avg: { $multiply: ['$orderItems.products.vendorPrice', '$orderItems.products.qty'] } }
            }
        }
    ])

    // Category performance
    const categoryPerformance = await OrderModel.aggregate([
        {
            $match: {
                'orderItems.vendor': vendorId,
                deletedAt: null,
                createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
            }
        },
        {
            $unwind: '$orderItems'
        },
        {
            $match: { 'orderItems.vendor': vendorId }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'orderItems.products.productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $lookup: {
                from: 'categories',
                localField: 'product.category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: '$category'
        },
        {
            $group: {
                _id: '$category._id',
                categoryName: { $first: '$category.name' },
                totalSales: { $sum: { $multiply: ['$orderItems.products.vendorPrice', '$orderItems.products.qty'] } },
                totalQuantity: { $sum: '$orderItems.products.qty' },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { totalSales: -1 } }
    ])

    return {
        period: dateRange,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.vendorSettings.isActive).length,
        productPerformance,
        categoryPerformance
    }
}

// Customer Analytics
async function getCustomerAnalytics(vendorId, dateRange) {
    const orders = await OrderModel.find({
        'orderItems.vendor': vendorId,
        deletedAt: null,
        createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    }).populate('user', 'name email').lean()

    // Customer segments
    const customerSegments = await OrderModel.aggregate([
        {
            $match: {
                'orderItems.vendor': vendorId,
                deletedAt: null,
                createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
            }
        },
        {
            $unwind: '$orderItems'
        },
        {
            $match: { 'orderItems.vendor': vendorId }
        },
        {
            $group: {
                _id: '$user',
                totalSpent: { $sum: '$orderItems.vendorEarning' },
                orderCount: { $sum: 1 },
                averageOrderValue: { $avg: '$orderItems.vendorEarning' }
            }
        },
        {
            $group: {
                _id: null,
                newCustomers: {
                    $sum: { $cond: [{ $eq: ['$orderCount', 1] }, 1, 0] }
                },
                returningCustomers: {
                    $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] }
                },
                highValueCustomers: {
                    $sum: { $cond: [{ $gt: ['$totalSpent', 500] }, 1, 0] }
                },
                totalCustomers: { $sum: 1 }
            }
        }
    ])

    // Geographic distribution
    const geographicData = orders.reduce((acc, order) => {
        const location = order.address.split(',')[1]?.trim() || 'Unknown'
        if (!acc[location]) {
            acc[location] = { orders: 0, revenue: 0 }
        }
        acc[location].orders++
        acc[location].revenue += order.orderItems
            .filter(item => item.vendor.toString() === vendorId.toString())
            .reduce((sum, item) => sum + item.vendorEarning, 0)
        return acc
    }, {})

    return {
        period: dateRange,
        customerSegments: customerSegments[0] || {},
        geographicDistribution: geographicData,
        totalCustomers: orders.length
    }
}

// Performance Analytics
async function getPerformanceAnalytics(vendorId, dateRange) {
    const orders = await OrderModel.find({
        'orderItems.vendor': vendorId,
        deletedAt: null,
        createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    }).lean()

    // Order fulfillment time
    const fulfillmentMetrics = await OrderModel.aggregate([
        {
            $match: {
                'orderItems.vendor': vendorId,
                deletedAt: null,
                'orderItems.status': 'delivered',
                createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
            }
        },
        {
            $unwind: '$orderItems'
        },
        {
            $match: { 'orderItems.vendor': vendorId }
        },
        {
            $group: {
                _id: null,
                averageFulfillmentTime: {
                    $avg: {
                        $divide: [
                            { $subtract: ['$orderItems.deliveredAt', '$createdAt'] },
                            1000 * 60 * 60 * 24 // Convert to days
                        ]
                    }
                },
                totalDelivered: { $sum: 1 }
            }
        }
    ])

    // Review performance
    const reviews = await ReviewModel.find({
        product: { $in: await ProductModel.find({ vendor: vendorId }).distinct('_id') },
        deletedAt: null,
        createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
    }).lean()

    const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0

    // Return rate (simulated)
    const returnRate = 0.05 // 5% return rate

    return {
        period: dateRange,
        fulfillment: fulfillmentMetrics[0] || {},
        reviews: {
            totalReviews: reviews.length,
            averageRating: Math.round(averageRating * 100) / 100,
            returnRate: Math.round(returnRate * 100)
        }
    }
}
