'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    Package,
    Star,
    MapPin,
    Clock,
    Target,
    Download,
    RefreshCw
} from 'lucide-react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    BarChart, 
    Bar,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function VendorAnalytics() {
    const [analyticsData, setAnalyticsData] = useState({})
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30')
    const [activeMetric, setActiveMetric] = useState('overview')

    const metrics = [
        { value: 'overview', label: 'Overview' },
        { value: 'sales', label: 'Sales Analytics' },
        { value: 'products', label: 'Product Performance' },
        { value: 'customers', label: 'Customer Insights' },
        { value: 'performance', label: 'Performance Metrics' }
    ]

    useEffect(() => {
        fetchAnalyticsData()
    }, [period, activeMetric])

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`/api/vendor/analytics?period=${period}&metric=${activeMetric}`)
            if (data.success) {
                setAnalyticsData(data.data)
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error)
            showToast('error', 'Error loading analytics data')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    const renderOverviewAnalytics = () => {
        if (!analyticsData.summary) return null

        const { summary } = analyticsData

        return (
            <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.totalEarnings)}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.totalOrders} orders
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.totalProducts}</div>
                            <p className="text-xs text-muted-foreground">
                                Active products
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.averageRating.toFixed(1)}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.totalReviews} reviews
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.conversionRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.totalCustomers} customers
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Segments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Segments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">New Customers</span>
                                    <Badge variant="outline">{summary.totalCustomers - summary.repeatCustomers}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Returning Customers</span>
                                    <Badge variant="outline">{summary.repeatCustomers}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Total Customers</span>
                                    <Badge variant="outline">{summary.totalCustomers}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Total Orders</span>
                                    <Badge variant="outline">{summary.totalOrders}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Total Reviews</span>
                                    <Badge variant="outline">{summary.totalReviews}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Repeat Rate</span>
                                    <Badge variant="outline">
                                        {summary.totalCustomers > 0 ? ((summary.repeatCustomers / summary.totalCustomers) * 100).toFixed(1) : 0}%
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const renderSalesAnalytics = () => {
        if (!analyticsData.dailySales) return null

        const { dailySales, salesByStatus, topProducts } = analyticsData

        // Prepare chart data
        const salesChartData = dailySales.map(item => ({
            date: `${item._id.month}/${item._id.day}`,
            earnings: item.dailyEarnings,
            orders: item.dailyOrders
        }))

        const statusData = salesByStatus.map(item => ({
            name: item._id.status,
            value: item.totalEarnings,
            count: item.orderCount
        }))

        return (
            <div className="space-y-6">
                {/* Sales Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Sales Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={salesChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="earnings" 
                                        stroke="#8884d8" 
                                        fill="#8884d8"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sales by Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Bar dataKey="value" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Products by Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProducts.slice(0, 10).map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-semibold">{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{product._id.productName}</p>
                                            <p className="text-xs text-gray-600">{product.totalQuantity} units sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(product.totalSales)}</p>
                                        <p className="text-xs text-gray-600">{product.orderCount} orders</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const renderProductAnalytics = () => {
        if (!analyticsData.productPerformance) return null

        const { totalProducts, activeProducts, productPerformance, categoryPerformance } = analyticsData

        return (
            <div className="space-y-6">
                {/* Product Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalProducts}</div>
                            <p className="text-xs text-muted-foreground">
                                {activeProducts} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(
                                    productPerformance.length > 0 
                                        ? productPerformance.reduce((sum, p) => sum + p.averageOrderValue, 0) / productPerformance.length
                                        : 0
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Per product
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(
                                    productPerformance.reduce((sum, p) => sum + p.totalSales, 0)
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All products
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="categoryName" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="totalSales" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Product Performance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {productPerformance.slice(0, 10).map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">Product #{product._id.slice(-6)}</p>
                                        <p className="text-xs text-gray-600">{product.totalQuantity} units sold</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(product.totalSales)}</p>
                                        <p className="text-xs text-gray-600">{product.orderCount} orders</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const renderCustomerAnalytics = () => {
        if (!analyticsData.customerSegments) return null

        const { customerSegments, geographicDistribution, totalCustomers } = analyticsData

        const segmentData = [
            { name: 'New Customers', value: customerSegments.newCustomers, color: '#0088FE' },
            { name: 'Returning Customers', value: customerSegments.returningCustomers, color: '#00C49F' },
            { name: 'High Value Customers', value: customerSegments.highValueCustomers, color: '#FFBB28' }
        ]

        const geoData = Object.entries(geographicDistribution).map(([location, data]) => ({
            name: location,
            orders: data.orders,
            revenue: data.revenue
        }))

        return (
            <div className="space-y-6">
                {/* Customer Segments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Segments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={segmentData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {segmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Geographic Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {geoData.slice(0, 5).map((location, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{location.name}</p>
                                            <p className="text-xs text-gray-600">{location.orders} orders</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(location.revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalCustomers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{customerSegments.newCustomers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Returning</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{customerSegments.returningCustomers}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">High Value</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{customerSegments.highValueCustomers}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const renderPerformanceAnalytics = () => {
        if (!analyticsData.fulfillment) return null

        const { fulfillment, reviews } = analyticsData

        return (
            <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Fulfillment Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {fulfillment.averageFulfillmentTime ? fulfillment.averageFulfillmentTime.toFixed(1) : 0} days
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {fulfillment.totalDelivered} orders delivered
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reviews.averageRating.toFixed(1)}</div>
                            <p className="text-xs text-muted-foreground">
                                {reviews.totalReviews} reviews
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reviews.returnRate}%</div>
                            <p className="text-xs text-muted-foreground">
                                Product returns
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-3">Fulfillment Metrics</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Average Fulfillment Time:</span>
                                        <span className="font-medium">
                                            {fulfillment.averageFulfillmentTime ? fulfillment.averageFulfillmentTime.toFixed(1) : 0} days
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Total Delivered Orders:</span>
                                        <span className="font-medium">{fulfillment.totalDelivered}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3">Review Metrics</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Average Rating:</span>
                                        <span className="font-medium">{reviews.averageRating.toFixed(1)}/5</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Total Reviews:</span>
                                        <span className="font-medium">{reviews.totalReviews}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Return Rate:</span>
                                        <span className="font-medium">{reviews.returnRate}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const renderAnalyticsContent = () => {
        switch (activeMetric) {
            case 'overview':
                return renderOverviewAnalytics()
            case 'sales':
                return renderSalesAnalytics()
            case 'products':
                return renderProductAnalytics()
            case 'customers':
                return renderCustomerAnalytics()
            case 'performance':
                return renderPerformanceAnalytics()
            default:
                return renderOverviewAnalytics()
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Comprehensive insights into your business performance
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchAnalyticsData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Metric Tabs */}
            <div className="flex flex-wrap gap-2">
                {metrics.map((metric) => (
                    <Button
                        key={metric.value}
                        variant={activeMetric === metric.value ? "default" : "outline"}
                        onClick={() => setActiveMetric(metric.value)}
                        className="flex items-center gap-2"
                    >
                        {metric.label}
                    </Button>
                ))}
            </div>

            {/* Analytics Content */}
            {renderAnalyticsContent()}
        </div>
    )
}
