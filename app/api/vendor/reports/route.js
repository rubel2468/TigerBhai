import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import { calculateVendorEarnings, calculatePlatformCommission } from "@/lib/commissionCalculator";
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
        const reportType = searchParams.get('type') || 'summary'
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const format = searchParams.get('format') || 'json'

        // Validate date range
        if (!startDate || !endDate) {
            return response(false, 400, 'Start date and end date are required')
        }

        const dateRange = {
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        }

        if (dateRange.startDate >= dateRange.endDate) {
            return response(false, 400, 'Start date must be before end date')
        }

        let reportData

        switch (reportType) {
            case 'summary':
                reportData = await generateSummaryReport(vendorId, dateRange)
                break
            case 'detailed':
                reportData = await generateDetailedReport(vendorId, dateRange)
                break
            case 'tax':
                reportData = await generateTaxReport(vendorId, dateRange)
                break
            case 'commission':
                reportData = await generateCommissionReport(vendorId, dateRange)
                break
            default:
                reportData = await generateSummaryReport(vendorId, dateRange)
        }

        // Generate report metadata
        const reportMetadata = {
            vendor: {
                businessName: vendor.businessName,
                contactPerson: vendor.contactPerson.name,
                email: vendor.contactPerson.email
            },
            reportType,
            period: dateRange,
            generatedAt: new Date(),
            commissionRate: vendor.commissionRate
        }

        const result = {
            metadata: reportMetadata,
            data: reportData
        }

        return response(true, 200, 'Report generated successfully', result)

    } catch (error) {
        return catchError(error)
    }
}

// Generate summary financial report
async function generateSummaryReport(vendorId, dateRange) {
    const orders = await OrderModel.find({
        'orderItems.vendor': vendorId,
        deletedAt: null,
        createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
        }
    }).lean()

    const earnings = calculateVendorEarnings(orders, dateRange.startDate, dateRange.endDate)

    // Get product statistics
    const productStats = await ProductModel.aggregate([
        {
            $match: {
                vendor: vendorId,
                deletedAt: null
            }
        },
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                activeProducts: {
                    $sum: { $cond: ['$vendorSettings.isActive', 1, 0] }
                },
                featuredProducts: {
                    $sum: { $cond: ['$vendorSettings.isFeatured', 1, 0] }
                }
            }
        }
    ])

    // Get order status breakdown
    const orderStatusBreakdown = await OrderModel.aggregate([
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
                _id: '$orderItems.status',
                count: { $sum: 1 },
                totalEarnings: { $sum: '$orderItems.vendorEarning' }
            }
        }
    ])

    return {
        summary: {
            period: dateRange,
            totalEarnings: earnings.totalEarnings,
            totalCommission: earnings.totalCommission,
            totalOrders: earnings.totalOrders,
            deliveredOrders: earnings.deliveredOrders,
            averageOrderValue: earnings.averageOrderValue
        },
        products: productStats[0] || {
            totalProducts: 0,
            activeProducts: 0,
            featuredProducts: 0
        },
        orderStatusBreakdown: orderStatusBreakdown
    }
}

// Generate detailed financial report
async function generateDetailedReport(vendorId, dateRange) {
    const orders = await OrderModel.find({
        'orderItems.vendor': vendorId,
        deletedAt: null,
        createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
        }
    })
    .populate('user', 'name email')
    .populate('orderItems.products.productId', 'name')
    .populate('orderItems.products.variantId', 'color size')
    .sort({ createdAt: -1 })
    .lean()

    // Process orders for detailed report
    const detailedOrders = orders.map(order => {
        const vendorOrderItems = order.orderItems.filter(item => 
            item.vendor.toString() === vendorId.toString()
        )

        return {
            orderNumber: order.orderNumber,
            customer: {
                name: order.user?.name || order.name,
                email: order.user?.email || order.email
            },
            orderDate: order.createdAt,
            status: order.status,
            paymentStatus: order.paymentStatus,
            items: vendorOrderItems.map(item => ({
                products: item.products.map(product => ({
                    name: product.name,
                    color: product.color,
                    size: product.size,
                    quantity: product.qty,
                    sellingPrice: product.sellingPrice,
                    vendorPrice: product.vendorPrice
                })),
                subtotal: item.subtotal,
                commission: item.commission,
                vendorEarning: item.vendorEarning,
                status: item.status
            })),
            totalVendorEarning: vendorOrderItems.reduce((sum, item) => sum + item.vendorEarning, 0),
            totalCommission: vendorOrderItems.reduce((sum, item) => sum + item.commission, 0)
        }
    })

    // Calculate totals
    const totals = detailedOrders.reduce((acc, order) => {
        acc.totalEarnings += order.totalVendorEarning
        acc.totalCommission += order.totalCommission
        acc.totalOrders += 1
        return acc
    }, { totalEarnings: 0, totalCommission: 0, totalOrders: 0 })

    return {
        period: dateRange,
        totals,
        orders: detailedOrders
    }
}

// Generate tax report
async function generateTaxReport(vendorId, dateRange) {
    const orders = await OrderModel.find({
        'orderItems.vendor': vendorId,
        deletedAt: null,
        'orderItems.status': 'delivered',
        createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
        }
    }).lean()

    // Calculate taxable earnings
    const taxableEarnings = orders.reduce((sum, order) => {
        const vendorOrderItems = order.orderItems.filter(item => 
            item.vendor.toString() === vendorId.toString() && item.status === 'delivered'
        )
        
        const orderEarnings = vendorOrderItems.reduce((orderSum, item) => 
            orderSum + item.vendorEarning, 0
        )
        
        return sum + orderEarnings
    }, 0)

    // Get monthly breakdown for tax purposes
    const monthlyBreakdown = await OrderModel.aggregate([
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
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                monthlyEarnings: { $sum: '$orderItems.vendorEarning' },
                orderCount: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ])

    return {
        period: dateRange,
        taxableEarnings: Math.round(taxableEarnings * 100) / 100,
        monthlyBreakdown,
        taxYear: dateRange.startDate.getFullYear(),
        note: "This report shows earnings from delivered orders only. Please consult with a tax professional for tax calculations."
    }
}

// Generate commission report
async function generateCommissionReport(vendorId, dateRange) {
    const vendor = await VendorModel.findById(vendorId)
    
    const orders = await OrderModel.find({
        'orderItems.vendor': vendorId,
        deletedAt: null,
        createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
        }
    }).lean()

    const commissionDetails = orders.map(order => {
        const vendorOrderItems = order.orderItems.filter(item => 
            item.vendor.toString() === vendorId.toString()
        )

        return {
            orderNumber: order.orderNumber,
            orderDate: order.createdAt,
            items: vendorOrderItems.map(item => ({
                subtotal: item.subtotal,
                commissionRate: vendor.commissionRate,
                commissionAmount: item.commission,
                vendorEarning: item.vendorEarning,
                status: item.status
            })),
            totalSubtotal: vendorOrderItems.reduce((sum, item) => sum + item.subtotal, 0),
            totalCommission: vendorOrderItems.reduce((sum, item) => sum + item.commission, 0),
            totalVendorEarning: vendorOrderItems.reduce((sum, item) => sum + item.vendorEarning, 0)
        }
    })

    // Calculate commission summary
    const commissionSummary = commissionDetails.reduce((acc, order) => {
        acc.totalSubtotal += order.totalSubtotal
        acc.totalCommission += order.totalCommission
        acc.totalVendorEarning += order.totalVendorEarning
        acc.orderCount += 1
        return acc
    }, { totalSubtotal: 0, totalCommission: 0, totalVendorEarning: 0, orderCount: 0 })

    return {
        period: dateRange,
        vendorCommissionRate: vendor.commissionRate,
        summary: commissionSummary,
        details: commissionDetails,
        averageCommissionRate: commissionSummary.totalSubtotal > 0 
            ? Math.round((commissionSummary.totalCommission / commissionSummary.totalSubtotal) * 100 * 100) / 100
            : 0
    }
}
