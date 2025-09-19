'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    Package, 
    ShoppingCart, 
    DollarSign, 
    Clock,
    TrendingUp,
    Eye,
    Plus
} from 'lucide-react'
import { useFetch } from '@/hooks/useFetch'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { showToast } from '@/lib/showToast'

function VendorDashboard() {
    const [stats, setStats] = useState({
        overview: {
            totalProducts: 0,
            activeProducts: 0,
            totalOrders: 0,
            pendingOrders: 0,
            totalSales: 0
        },
        vendor: {
            businessName: '',
            status: '',
            verificationStatus: '',
            commissionRate: 0
        },
        recentOrders: [],
        lowStockProducts: [],
        monthlySales: []
    })
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            setLoading(true)
            // Always fetch fresh profile first
            const profileRes = await axios.get(`/api/vendor/profile`, { headers: { 'Cache-Control': 'no-cache' } })
            if (profileRes.data?.success) {
                setStats((prev) => ({
                    ...prev,
                    vendor: {
                        ...(prev.vendor || {}),
                        businessName: profileRes.data.data.vendor?.businessName || '',
                        status: profileRes.data.data.vendor?.status || '',
                        verificationStatus: profileRes.data.data.vendor?.verificationStatus || '',
                        commissionRate: profileRes.data.data.vendor?.commissionRate || 0
                    }
                }))
            }

            const { data } = await axios.get(`/api/vendor/dashboard/stats?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } })
            if (data.success) {
                setStats((prev) => ({ ...prev, ...data.data }))
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
            suspended: { color: 'bg-gray-100 text-gray-800', text: 'Suspended' }
        }
        
        const config = statusConfig[status] || statusConfig.pending
        return <Badge className={config.color}>{config.text}</Badge>
    }

    const getOrderStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' },
            processing: { color: 'bg-purple-100 text-purple-800', text: 'Processing' },
            shipped: { color: 'bg-indigo-100 text-indigo-800', text: 'Shipped' },
            delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome, {stats.vendor.businessName}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage your products, orders, and business analytics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge(stats.vendor.status)}
                    <Button onClick={() => router.push('/vendor/products/add')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.overview.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.overview.activeProducts} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.overview.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.overview.pendingOrders} pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.overview.totalSales.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            After commission
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.vendor.commissionRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            Platform fee
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">
                            {getStatusBadge(stats.vendor.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Verification: {stats.vendor.verificationStatus}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Recent Orders</CardTitle>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push('/vendor/orders')}
                            >
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {stats.recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentOrders.map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">#{order.orderNumber}</p>
                                                {getOrderStatusBadge(order.status)}
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                {order.customerName} • ৳{order.totalAmount}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No recent orders</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3">
                            <Button 
                                variant="outline" 
                                className="justify-start h-12"
                                onClick={() => router.push('/vendor/products/add')}
                            >
                                <Package className="h-4 w-4 mr-3" />
                                Add New Product
                            </Button>
                            <Button 
                                variant="outline" 
                                className="justify-start h-12"
                                onClick={() => router.push('/vendor/products/variants/add')}
                            >
                                <Package className="h-4 w-4 mr-3" />
                                Add Product Variant
                            </Button>
                            <Button 
                                variant="outline" 
                                className="justify-start h-12"
                                onClick={() => router.push('/vendor/orders')}
                            >
                                <ShoppingCart className="h-4 w-4 mr-3" />
                                Manage Orders
                            </Button>
                            <Button 
                                variant="outline" 
                                className="justify-start h-12"
                                onClick={() => router.push('/vendor/analytics')}
                            >
                                <TrendingUp className="h-4 w-4 mr-3" />
                                View Analytics
                            </Button>
                            <Button 
                                variant="outline" 
                                className="justify-start h-12"
                                onClick={() => router.push('/vendor/profile')}
                            >
                                <Eye className="h-4 w-4 mr-3" />
                                Update Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Account Status Alert */}
            {stats.vendor.status && stats.vendor.status !== 'approved' && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                            <div>
                                <h3 className="font-medium text-yellow-800">Account Pending Approval</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Your vendor account is currently {stats.vendor.status}.
                                    You'll be able to add products and manage orders once approved by our team.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default dynamic(() => Promise.resolve(VendorDashboard), {
    ssr: false,
    loading: () => <div className='flex justify-center items-center h-64'>Loading...</div>
})
