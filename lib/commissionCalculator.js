/**
 * Commission calculation utilities for multivendor system
 */

/**
 * Calculate commission for a vendor order
 * @param {number} orderAmount - Total order amount
 * @param {number} commissionRate - Vendor's commission rate (percentage)
 * @returns {Object} Commission breakdown
 */
export const calculateCommission = (orderAmount, commissionRate = 10) => {
    const commission = (orderAmount * commissionRate) / 100
    const vendorEarning = orderAmount - commission
    
    return {
        orderAmount,
        commissionRate,
        commission: Math.round(commission * 100) / 100, // Round to 2 decimal places
        vendorEarning: Math.round(vendorEarning * 100) / 100
    }
}

/**
 * Calculate commission for multiple products in an order
 * @param {Array} products - Array of product objects with sellingPrice
 * @param {number} commissionRate - Vendor's commission rate
 * @returns {Object} Total commission breakdown
 */
export const calculateOrderCommission = (products, commissionRate = 10) => {
    const subtotal = products.reduce((sum, product) => {
        return sum + (product.sellingPrice * product.qty)
    }, 0)
    
    return calculateCommission(subtotal, commissionRate)
}

/**
 * Calculate commission for individual product
 * @param {Object} product - Product object with sellingPrice and qty
 * @param {number} commissionRate - Vendor's commission rate
 * @returns {Object} Product commission breakdown
 */
export const calculateProductCommission = (product, commissionRate = 10) => {
    const productTotal = product.sellingPrice * product.qty
    const commission = (productTotal * commissionRate) / 100
    const vendorEarning = productTotal - commission
    
    return {
        productTotal: Math.round(productTotal * 100) / 100,
        commission: Math.round(commission * 100) / 100,
        vendorEarning: Math.round(vendorEarning * 100) / 100,
        vendorPrice: Math.round(vendorEarning * 100) / 100
    }
}

/**
 * Process order items for multivendor system
 * Groups products by vendor and calculates commissions
 * @param {Array} products - Array of products with vendor information
 * @param {Object} vendors - Object with vendor data including commission rates
 * @returns {Array} Processed order items grouped by vendor
 */
export const processOrderItems = (products, vendors) => {
    // Group products by vendor
    const vendorGroups = {}
    
    products.forEach(product => {
        const vendorId = product.vendor.toString()
        
        if (!vendorGroups[vendorId]) {
            vendorGroups[vendorId] = []
        }
        
        vendorGroups[vendorId].push(product)
    })
    
    // Calculate commission for each vendor group
    const orderItems = []
    
    Object.entries(vendorGroups).forEach(([vendorId, vendorProducts]) => {
        const vendor = vendors[vendorId]
        const commissionRate = vendor?.commissionRate || 10
        
        // Calculate totals
        let subtotal = 0
        let totalCommission = 0
        let totalVendorEarning = 0
        
        const processedProducts = vendorProducts.map(product => {
            const productCommission = calculateProductCommission(product, commissionRate)
            
            subtotal += productCommission.productTotal
            totalCommission += productCommission.commission
            totalVendorEarning += productCommission.vendorEarning
            
            return {
                productId: product.productId,
                variantId: product.variantId,
                name: product.name,
                qty: product.qty,
                mrp: product.mrp,
                sellingPrice: product.sellingPrice,
                vendorPrice: productCommission.vendorPrice
            }
        })
        
        orderItems.push({
            vendor: vendorId,
            products: processedProducts,
            subtotal: Math.round(subtotal * 100) / 100,
            commission: Math.round(totalCommission * 100) / 100,
            vendorEarning: Math.round(totalVendorEarning * 100) / 100,
            status: 'pending'
        })
    })
    
    return orderItems
}

/**
 * Calculate vendor earnings for a specific period
 * @param {Array} orders - Array of orders for the vendor
 * @param {Date} startDate - Start date for calculation
 * @param {Date} endDate - End date for calculation
 * @returns {Object} Earnings summary
 */
export const calculateVendorEarnings = (orders, startDate, endDate) => {
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startDate && orderDate <= endDate
    })
    
    let totalEarnings = 0
    let totalCommission = 0
    let totalOrders = 0
    let deliveredOrders = 0
    
    filteredOrders.forEach(order => {
        order.orderItems.forEach(item => {
            if (item.status === 'delivered') {
                totalEarnings += item.vendorEarning
                totalCommission += item.commission
                deliveredOrders++
            }
            totalOrders++
        })
    })
    
    return {
        period: { startDate, endDate },
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalOrders,
        deliveredOrders,
        averageOrderValue: totalOrders > 0 ? Math.round((totalEarnings / totalOrders) * 100) / 100 : 0
    }
}

/**
 * Calculate platform commission for admin reporting
 * @param {Array} orders - All orders for the period
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Platform commission summary
 */
export const calculatePlatformCommission = (orders, startDate, endDate) => {
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startDate && orderDate <= endDate
    })
    
    let totalCommission = 0
    let totalRevenue = 0
    let vendorCommissions = {}
    
    filteredOrders.forEach(order => {
        order.orderItems.forEach(item => {
            totalCommission += item.commission
            totalRevenue += item.subtotal
            
            const vendorId = item.vendor.toString()
            if (!vendorCommissions[vendorId]) {
                vendorCommissions[vendorId] = 0
            }
            vendorCommissions[vendorId] += item.commission
        })
    })
    
    return {
        period: { startDate, endDate },
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        commissionPercentage: totalRevenue > 0 ? Math.round((totalCommission / totalRevenue) * 100 * 100) / 100 : 0,
        vendorCommissions
    }
}
