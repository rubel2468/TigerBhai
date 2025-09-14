'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
    Search, 
    Filter, 
    Eye, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Building2,
    Users,
    TrendingUp,
    Clock,
    FileText,
    DollarSign
} from 'lucide-react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'

export default function VendorManagement() {
    const [vendors, setVendors] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({})
    const [filters, setFilters] = useState({
        status: 'all',
        verificationStatus: 'all',
        search: '',
        page: 1,
        limit: 10
    })
    const [pagination, setPagination] = useState({})
    const [selectedVendor, setSelectedVendor] = useState(null)
    const [actionDialog, setActionDialog] = useState({ open: false, action: '', data: {} })
    const [detailsDialog, setDetailsDialog] = useState({ open: false, vendor: null })

    const breadcrumbData = [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Vendor Management', href: '/admin/vendors' }
    ]

    useEffect(() => {
        fetchVendors()
    }, [filters])

    const fetchVendors = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    params.append(key, value)
                }
            })

            const { data } = await axios.get(`/api/admin/vendors?${params}`)
            if (data.success) {
                setVendors(data.data.vendors)
                setStats(data.data.stats)
                setPagination(data.data.pagination)
            }
        } catch (error) {
            showToast('error', 'Error fetching vendors')
        } finally {
            setLoading(false)
        }
    }

    const handleVendorAction = async (action, vendorId, data = {}) => {
        try {
            const { data: response } = await axios.put('/api/admin/vendors', {
                vendorId,
                action,
                data
            })

            if (response.success) {
                showToast('success', response.message)
                fetchVendors()
                setActionDialog({ open: false, action: '', data: {} })
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Action failed')
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

    const getVerificationBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            verified: { color: 'bg-green-100 text-green-800', text: 'Verified' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
        }
        
        const config = statusConfig[status] || statusConfig.pending
        return <Badge className={config.color}>{config.text}</Badge>
    }

    const openActionDialog = (action, vendor) => {
        setSelectedVendor(vendor)
        setActionDialog({ open: true, action, data: {} })
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
            <BreadCrumb breadcrumbData={breadcrumbData} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalVendors || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingVendors || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approvedVendors || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Verified</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.verifiedVendors || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search vendors..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        
                        <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
                        >
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.verificationStatus}
                            onValueChange={(value) => setFilters({ ...filters, verificationStatus: value, page: 1 })}
                        >
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Verification" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Verification</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Vendors List */}
            <div className="grid gap-6">
                {vendors.map((vendor) => (
                    <Card key={vendor._id}>
                        <CardContent className="pt-6">
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{vendor.businessName}</h3>
                                            <p className="text-gray-600">{vendor.contactPerson.name}</p>
                                            <p className="text-sm text-gray-500">{vendor.contactPerson.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {getStatusBadge(vendor.status)}
                                            {getVerificationBadge(vendor.verificationStatus)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <h4 className="font-medium text-sm">Business Type</h4>
                                            <p className="capitalize text-sm text-gray-600">{vendor.businessType}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">Location</h4>
                                            <p className="text-sm text-gray-600">
                                                {vendor.businessAddress.city}, {vendor.businessAddress.country}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">Commission Rate</h4>
                                            <p className="text-sm text-gray-600">{vendor.commissionRate}%</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">Joined</h4>
                                            <p className="text-sm text-gray-600">
                                                {new Date(vendor.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {vendor.verificationNotes && (
                                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                            <h4 className="font-medium text-sm mb-1">Notes</h4>
                                            <p className="text-sm text-gray-600">{vendor.verificationNotes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDetailsDialog({ open: true, vendor })}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                    </Button>

                                    {vendor.status === 'pending' && (
                                        <>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => openActionDialog('approve', vendor)}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => openActionDialog('reject', vendor)}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </>
                                    )}

                                    {vendor.status === 'approved' && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => openActionDialog('suspend', vendor)}
                                        >
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            Suspend
                                        </Button>
                                    )}

                                    {vendor.status === 'suspended' && (
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => openActionDialog('reactivate', vendor)}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Reactivate
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openActionDialog('commission', vendor)}
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Update Commission
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    >
                        Previous
                    </Button>
                    
                    <span className="flex items-center px-4">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <Button
                        variant="outline"
                        disabled={!pagination.hasNextPage}
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Action Dialog */
            }
            <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog.action === 'approve' && 'Approve Vendor'}
                            {actionDialog.action === 'reject' && 'Reject Vendor'}
                            {actionDialog.action === 'suspend' && 'Suspend Vendor'}
                            {actionDialog.action === 'reactivate' && 'Reactivate Vendor'}
                            {actionDialog.action === 'commission' && 'Update Commission Rate'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        {actionDialog.action === 'commission' && (
                            <div>
                                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                                <Input
                                    id="commissionRate"
                                    type="number"
                                    min="0"
                                    max="50"
                                    defaultValue={selectedVendor?.commissionRate}
                                    onChange={(e) => setActionDialog({
                                        ...actionDialog,
                                        data: { ...actionDialog.data, commissionRate: parseFloat(e.target.value) }
                                    })}
                                />
                            </div>
                        )}
                        
                        <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any notes or comments..."
                                onChange={(e) => setActionDialog({
                                    ...actionDialog,
                                    data: { ...actionDialog.data, notes: e.target.value }
                                })}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setActionDialog({ open: false, action: '', data: {} })}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    const actionMap = {
                                        approve: 'update_status',
                                        reject: 'update_status',
                                        suspend: 'update_status',
                                        reactivate: 'update_status',
                                        commission: 'update_commission'
                                    }
                                    
                                    const dataMap = {
                                        approve: { status: 'approved', notes: actionDialog.data.notes },
                                        reject: { status: 'rejected', notes: actionDialog.data.notes },
                                        suspend: { status: 'suspended', notes: actionDialog.data.notes },
                                        reactivate: { status: 'approved', notes: actionDialog.data.notes },
                                        commission: { commissionRate: actionDialog.data.commissionRate }
                                    }

                                    handleVendorAction(
                                        actionMap[actionDialog.action],
                                        selectedVendor._id,
                                        dataMap[actionDialog.action]
                                    )
                                }}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={detailsDialog.open} onOpenChange={(open) => setDetailsDialog({ open, vendor: open ? detailsDialog.vendor : null })}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Vendor Details</DialogTitle>
                    </DialogHeader>
                    {detailsDialog.vendor && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold">Business</h4>
                                    <p className="text-sm text-gray-700">{detailsDialog.vendor.businessName}</p>
                                    <p className="text-xs text-gray-500 capitalize">{detailsDialog.vendor.businessType}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Commission Rate</h4>
                                    <p className="text-sm text-gray-700">{detailsDialog.vendor.commissionRate}%</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Contact Person</h4>
                                    <p className="text-sm text-gray-700">{detailsDialog.vendor.contactPerson?.name}</p>
                                    <p className="text-xs text-gray-500">{detailsDialog.vendor.contactPerson?.email}</p>
                                    <p className="text-xs text-gray-500">{detailsDialog.vendor.contactPerson?.phone}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Address</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">
{`${detailsDialog.vendor.businessAddress?.houseApartment}, ${detailsDialog.vendor.businessAddress?.roadStreet}
${detailsDialog.vendor.businessAddress?.areaLocality}
${detailsDialog.vendor.businessAddress?.postOffice}, ${detailsDialog.vendor.businessAddress?.upazilaThana}
${detailsDialog.vendor.businessAddress?.district}, ${detailsDialog.vendor.businessAddress?.postcode}
${detailsDialog.vendor.businessAddress?.country || 'Bangladesh'}`}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['tradeLicense','nationalId','taxCertificate'].map((docKey) => {
                                        const doc = detailsDialog.vendor.documents?.[docKey]
                                        if (!doc || !doc.url) return (
                                            <div key={docKey} className="border rounded p-3 text-center text-xs text-gray-500">No {docKey} uploaded</div>
                                        )
                                        const isPdf = /\.pdf($|\?)/i.test(doc.url)
                                        return (
                                            <div key={docKey} className="border rounded p-3 text-center">
                                                <p className="text-sm font-medium capitalize mb-2">{docKey.replace(/([A-Z])/g,' $1')}</p>
                                                {isPdf ? (
                                                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">View PDF</a>
                                                ) : (
                                                    <a href={doc.url} target="_blank" rel="noreferrer">
                                                        <img src={doc.url} alt={docKey} className="mx-auto h-24 object-contain rounded hover:opacity-90 transition" />
                                                    </a>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Bank Details</h4>
                                    <p className="text-xs text-gray-500">Account Holder</p>
                                    <p className="text-sm">{detailsDialog.vendor.bankDetails?.accountHolderName || '-'}</p>
                                    <p className="text-xs text-gray-500 mt-2">Bank</p>
                                    <p className="text-sm">{detailsDialog.vendor.bankDetails?.bankName || '-'}</p>
                                    <p className="text-xs text-gray-500 mt-2">IFSC/SWIFT</p>
                                    <p className="text-sm">{detailsDialog.vendor.bankDetails?.ifscCode || '-'}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Performance</h4>
                                    <p className="text-xs text-gray-500">Total Sales</p>
                                    <p className="text-sm">{detailsDialog.vendor.metrics?.totalSales || 0}</p>
                                    <p className="text-xs text-gray-500 mt-2">Total Orders</p>
                                    <p className="text-sm">{detailsDialog.vendor.metrics?.totalOrders || 0}</p>
                                    <p className="text-xs text-gray-500 mt-2">Avg Rating</p>
                                    <p className="text-sm">{detailsDialog.vendor.metrics?.averageRating || 0}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setDetailsDialog({ open: false, vendor: null })}
                                >
                                    Close
                                </Button>
                                {detailsDialog.vendor.verificationStatus !== 'verified' && (
                                    <Button
                                        onClick={() => handleVendorAction('update_verification', detailsDialog.vendor._id, { verificationStatus: 'verified' })}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Mark Verified
                                    </Button>
                                )}
                                {detailsDialog.vendor.verificationStatus !== 'rejected' && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleVendorAction('update_verification', detailsDialog.vendor._id, { verificationStatus: 'rejected' })}
                                    >
                                        Mark Rejected
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
