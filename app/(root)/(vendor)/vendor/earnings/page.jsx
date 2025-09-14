'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
    DollarSign, 
    TrendingUp, 
    Package, 
    Clock,
    CheckCircle,
    Download,
    Calendar,
    BarChart3,
    PieChart,
    FileText
} from 'lucide-react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function VendorEarnings() {
    const [earningsData, setEarningsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30')

    useEffect(() => {
        fetchEarningsData()
    }, [period])

    const fetchEarningsData = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`/api/vendor/earnings?period=${period}`)
            if (data.success) {
                setEarningsData(data.data)
            }
        } catch (error) {
            console.error('Error fetching earnings data:', error)
            showToast('error', 'Error loading earnings data')
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

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
            processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing' },
            failed: { color: 'bg-red-100 text-red-800', text: 'Failed' }
        }
        
        const config = statusConfig[status] || statusConfig.pending
        return <Badge className={config.color}>{config.text}</Badge>
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!earningsData) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No earnings data available</p>
            </div>
        )
    }

    // Prepare chart data
    const monthlyChartData = earningsData.monthlyEarnings.map(item => ({
        date: `${item._id.month}/${item._id.day}`,
        earnings: item.dailyEarnings,
        commission: item.dailyCommission,
        orders: item.orderCount
    }))

    const statusChartData = earningsData.breakdown.map(item => ({
        name: item._id.status,
        value: item.totalEarnings,
        count: item.orderCount
    }))

    const topProductsData = earningsData.topProducts.map(item => ({
        name: item._id.productName.substring(0, 20) + '...',
        earnings: item.totalEarnings,
        quantity: item.totalQuantity
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Track your earnings, commissions, and financial performance
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
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(earningsData.summary.totalEarnings)}</div>
                        <p className="text-xs text-muted-foreground">
                            After {earningsData.vendor.commissionRate}% commission
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{earningsData.summary.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            {earningsData.summary.deliveredOrders} delivered
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(earningsData.summary.pendingPayout)}</div>
                        <p className="text-xs text-muted-foreground">
                            {earningsData.summary.pendingOrders} orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(earningsData.summary.averageOrderValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Per delivered order
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Earnings Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Line 
                                    type="monotone" 
                                    dataKey="earnings" 
                                    stroke="#8884d8" 
                                    strokeWidth={2}
                                    name="Earnings"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Earnings by Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PieChart className="h-5 w-5 mr-2" />
                            Earnings by Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPieChart>
                                <RechartsPieChart
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </RechartsPieChart>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            Top Products by Earnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topProductsData.slice(0, 5).map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-600">{product.quantity} units sold</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(product.earnings)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Payouts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Recent Payouts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {earningsData.payoutHistory.slice(0, 5).map((payout, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {payout.payoutReference || `Payout #${payout._id.slice(-6)}`}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {formatDate(payout.payoutDate)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(payout.amount)}</p>
                                        {getStatusBadge(payout.payoutStatus)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Commission Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Commission Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{earningsData.vendor.commissionRate}%</p>
                            <p className="text-sm text-gray-600">Your Commission Rate</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{formatCurrency(earningsData.summary.totalCommission)}</p>
                            <p className="text-sm text-gray-600">Total Platform Commission</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">
                                {earningsData.summary.totalEarnings > 0 
                                    ? Math.round((earningsData.summary.totalEarnings / (earningsData.summary.totalEarnings + earningsData.summary.totalCommission)) * 100)
                                    : 0}%
                            </p>
                            <p className="text-sm text-gray-600">Your Share</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
