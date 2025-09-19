'use client'
import { useState, useEffect } from 'react'

// Force dynamic rendering for vendor pages
export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    BarChart3, 
    User, 
    Settings, 
    MessageSquare,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'

const VendorSidebar = ({ isOpen, onClose }) => {
    const router = useRouter()
    
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/vendor/dashboard' },
        { icon: Package, label: 'Products', href: '/vendor/products' },
        { icon: Package, label: 'Product Variants', href: '/vendor/products/variants' },
        { icon: ShoppingCart, label: 'Orders', href: '/vendor/orders' },
        { icon: BarChart3, label: 'Analytics', href: '/vendor/analytics' },
        { icon: MessageSquare, label: 'Messages', href: '/vendor/messages' },
        { icon: User, label: 'Profile', href: '/vendor/profile' },
        { icon: Settings, label: 'Settings', href: '/vendor/settings' }
    ]

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout')
            showToast('success', 'Logged out successfully')
            router.push('/auth/login')
        } catch (error) {
            showToast('error', 'Error logging out')
        }
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}
            
            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:shadow-none
            `}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-800">Vendor Panel</h2>
                        <button 
                            onClick={onClose}
                            className="md:hidden"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    <nav className="space-y-2">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    className="w-full justify-start text-left"
                                    onClick={() => {
                                        router.push(item.href)
                                        onClose()
                                    }}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.label}
                                </Button>
                            )
                        })}
                        
                        <div className="pt-4 border-t">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                Logout
                            </Button>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    )
}

export default function VendorLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [vendorInfo, setVendorInfo] = useState(null)

    useEffect(() => {
        fetchVendorInfo()
    }, [])

    const fetchVendorInfo = async () => {
        try {
            const { data } = await axios.get('/api/vendor/profile')
            if (data.success) {
                setVendorInfo(data.data)
            }
        } catch (error) {
            console.error('Error fetching vendor info:', error)
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
                <button 
                    onClick={() => setSidebarOpen(true)}
                    className="p-2"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-semibold">Vendor Dashboard</h1>
                {vendorInfo && getStatusBadge(vendorInfo.status)}
            </div>

            <div className="flex">
                {/* Sidebar */}
                <VendorSidebar 
                    isOpen={sidebarOpen} 
                    onClose={() => setSidebarOpen(false)} 
                />
                
                {/* Main Content */}
                <div className="flex-1 md:ml-0">
                    <main className="p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
