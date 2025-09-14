'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import { VENDOR_DASHBOARD, VENDOR_ORDERS } from "@/routes/VendorRoute"
import { showToast } from '@/lib/showToast'
import Image from 'next/image'
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
}

const statusOptions = [
    { value: 'pending', label: 'Pending', description: 'Order received, waiting for confirmation' },
    { value: 'confirmed', label: 'Confirmed', description: 'Order confirmed, preparing for processing' },
    { value: 'processing', label: 'Processing', description: 'Order is being processed' },
    { value: 'shipped', label: 'Shipped', description: 'Order has been shipped' },
    { value: 'delivered', label: 'Delivered', description: 'Order has been delivered' },
    { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' }
]

export default function VendorOrderDetailsPage({ params }) {
    const { orderNumber } = params
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')

    const breadcrumbData = [
        { href: VENDOR_DASHBOARD, label: 'Dashboard' },
        { href: VENDOR_ORDERS, label: 'Orders' },
        { href: "", label: `Order #${orderNumber}` },
    ]

    useEffect(() => {
        fetchOrderDetails()
    }, [orderNumber])

    const fetchOrderDetails = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`/api/vendor/orders/details/${orderNumber}`)
            if (data.success) {
                setOrder(data.data)
                setSelectedStatus(data.data.status)
            } else {
                showToast('error', data.message || 'Failed to fetch order details')
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to fetch order details')
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (newStatus) => {
        if (!order) return

        try {
            setUpdating(true)
            const { data } = await axios.put('/api/vendor/orders', {
                orderId: order._id,
                orderItemId: order.orderItems[0]?._id,
                status: newStatus
            })

            if (data.success) {
                showToast('success', 'Order status updated successfully')
                setOrder(prev => ({ ...prev, status: newStatus }))
                setSelectedStatus(newStatus)
            } else {
                showToast('error', data.message || 'Failed to update order status')
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to update order status')
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Package className="mx-auto h-32 w-32 text-gray-400" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Order Not Found</h2>
                    <p className="mt-2 text-gray-600">The order you're looking for doesn't exist or you don't have permission to view it.</p>
                    <Link href={VENDOR_ORDERS}>
                        <Button className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const vendorOrderItems = order.orderItems || []
    const totalVendorEarning = vendorOrderItems.reduce((sum, item) => sum + (item.vendorEarning || 0), 0)
    const totalCommission = vendorOrderItems.reduce((sum, item) => sum + (item.commission || 0), 0)
    const totalSubtotal = vendorOrderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)

    return (
        <div className="space-y-6">
            <BreadCrumb breadcrumbData={breadcrumbData} />

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
                    <p className="text-gray-600 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className={`px-3 py-1 ${statusColor[order.status] || statusColor.pending}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </Badge>
                    <Link href={VENDOR_ORDERS}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Name</label>
                                    <p className="text-lg">{order.customer?.name || order.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-lg">{order.customer?.phone || order.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-lg">{order.customer?.email || order.email || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Address</label>
                                    <p className="text-lg">{order.address}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Your Products ({vendorOrderItems.length} items)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {vendorOrderItems.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold">{item.products[0]?.name || 'Product Name'}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Quantity: {item.products[0]?.qty || 1}
                                                </p>
                                            </div>
                                            <Badge className={statusColor[item.status] || statusColor.pending}>
                                                {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Subtotal:</span>
                                                <p className="font-medium">BDT {item.subtotal?.toLocaleString() || 0}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Commission:</span>
                                                <p className="font-medium text-red-600">-BDT {item.commission?.toLocaleString() || 0}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Your Earning:</span>
                                                <p className="font-medium text-green-600">BDT {item.vendorEarning?.toLocaleString() || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary & Actions */}
                <div className="space-y-6">
                    {/* Order Status Update */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Update Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 mb-2 block">Current Status</label>
                                <Select value={selectedStatus} onValueChange={updateOrderStatus} disabled={updating}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div>
                                                    <div className="font-medium">{option.label}</div>
                                                    <div className="text-xs text-gray-500">{option.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {updating && (
                                <p className="text-sm text-blue-600">Updating status...</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Financial Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span>BDT {totalSubtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>Commission:</span>
                                <span>-BDT {totalCommission.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between text-lg font-semibold text-green-600">
                                    <span>Your Earning:</span>
                                    <span>BDT {totalVendorEarning.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Number:</span>
                                <span className="font-mono">{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="uppercase">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Date:</span>
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            {order.ordernote && (
                                <div>
                                    <span className="text-gray-600">Order Note:</span>
                                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{order.ordernote}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}


