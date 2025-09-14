import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Chip } from "@mui/material"
import dayjs from "dayjs"
import Image from "next/image"
import userIcon from '@/public/assets/images/user.png'
export const DT_CATEGORY_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Category Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
]

export const DT_PRODUCT_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Product Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        accessorKey: 'category',
        header: 'Category',
    },
    {
        accessorKey: 'vendor',
        header: 'Owner/Vendor',
        Cell: ({ renderedCellValue }) => {
            if (!renderedCellValue || !renderedCellValue._id) {
                return <span className="text-gray-500">Admin Product</span>
            }
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{renderedCellValue.businessName || 'N/A'}</span>
                    <span className="text-xs text-gray-500">{renderedCellValue.ownerName || 'N/A'}</span>
                </div>
            )
        }
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
        Cell: ({ renderedCellValue }) => <span>BDT {renderedCellValue?.toLocaleString()}</span>
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
        Cell: ({ renderedCellValue }) => <span>BDT {renderedCellValue?.toLocaleString()}</span>
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount %',
        Cell: ({ renderedCellValue }) => <span className="text-green-600">{renderedCellValue}%</span>
    },
    {
        accessorKey: 'vendorSettings',
        header: 'Status',
        Cell: ({ renderedCellValue }) => {
            if (!renderedCellValue) {
                return <Chip color="default" label="Admin" size="small" />
            }
            return (
                <div className="flex flex-col gap-1">
                    <Chip 
                        color={renderedCellValue.isActive ? "success" : "default"} 
                        label={renderedCellValue.isActive ? "Active" : "Inactive"} 
                        size="small" 
                    />
                    {renderedCellValue.isFeatured && (
                        <Chip color="primary" label="Featured" size="small" />
                    )}
                </div>
            )
        }
    }
]

export const DT_VENDOR_PRODUCT_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Product Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        accessorKey: 'category',
        header: 'Category',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
        Cell: ({ renderedCellValue }) => <span>BDT {renderedCellValue?.toLocaleString()}</span>
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
        Cell: ({ renderedCellValue }) => <span>BDT {renderedCellValue?.toLocaleString()}</span>
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount %',
        Cell: ({ renderedCellValue }) => <span className="text-green-600">{renderedCellValue}%</span>
    },
    {
        accessorKey: 'vendorSettings',
        header: 'Status',
        Cell: ({ renderedCellValue }) => {
            if (!renderedCellValue) {
                return <Chip color="default" label="Inactive" size="small" />
            }
            return (
                <div className="flex flex-col gap-1">
                    <Chip 
                        color={renderedCellValue.isActive ? "success" : "default"} 
                        label={renderedCellValue.isActive ? "Active" : "Inactive"} 
                        size="small" 
                    />
                    {renderedCellValue.isFeatured && (
                        <Chip color="primary" label="Featured" size="small" />
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        Cell: ({ renderedCellValue }) => dayjs(renderedCellValue).format('DD/MM/YYYY')
    }
]


export const DT_PRODUCT_VARIANT_COLUMN = [
    {
        accessorKey: 'product',
        header: 'Product Name',
        Cell: ({ renderedCellValue }) => <span>{renderedCellValue?.name || 'Unknown Product'}</span>
    },
    {
        accessorKey: 'color',
        header: 'Color',
    },
    {
        accessorKey: 'size',
        header: 'Size',
    },
    {
        accessorKey: 'sku',
        header: 'SKU',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
        Cell: ({ renderedCellValue }) => <span>BDT {renderedCellValue?.toLocaleString()}</span>
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
        Cell: ({ renderedCellValue }) => <span>BDT {renderedCellValue?.toLocaleString()}</span>
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount Percentage',
        Cell: ({ renderedCellValue }) => <span className="text-green-600">{renderedCellValue}%</span>
    }
]


export const DT_COUPON_COLUMN = [
    {
        accessorKey: 'code',
        header: 'Code',
    },


    {
        accessorKey: 'discountPercentage',
        header: 'Discount Percentage',
    },

    {
        accessorKey: 'minShoppingAmount',
        header: 'Min. Shopping Amount',
    },
    {
        accessorKey: 'validity',
        header: 'Validity',
        Cell: ({ renderedCellValue }) => (
            new Date() > new Date(renderedCellValue) ? <Chip color="error" label={dayjs(renderedCellValue).format('DD/MM/YYYY')} /> : <Chip color="success" label={dayjs(renderedCellValue).format('DD/MM/YYYY')} />
        )
    }

]


export const DT_CUSTOMERS_COLUMN = [
    {
        accessorKey: 'avatar',
        header: 'Avatar',
        Cell: ({ renderedCellValue }) => (
            <Avatar>
                <AvatarImage src={renderedCellValue?.url || userIcon.src} />
            </Avatar>
        )
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
    },
    {
        accessorKey: 'address',
        header: 'Address',
    },
    {
        accessorKey: 'isEmailVerified',
        header: 'Is Verified',
        Cell: ({ renderedCellValue }) => (
            renderedCellValue ? <Chip color="success" label="Verified" /> : <Chip color="error" label="Not Verified" />
        )
    }
]

export const DT_REVIEW_COLUMN = [

    {
        accessorKey: 'product',
        header: 'Product',
    },

    {
        accessorKey: 'user',
        header: 'User',
    },

    {
        accessorKey: 'title',
        header: 'Title',
    },
    {
        accessorKey: 'rating',
        header: 'Rating',
    },
    {
        accessorKey: 'review',
        header: 'Review',
    },
]

export const DT_ORDER_COLUMN = [

    {
        accessorKey: 'orderNumber',
        header: 'Order Number',
    },
    {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
    },

    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'address',
        header: 'Address',
    },
    {
        accessorKey: 'totalItem',
        header: 'Total Item',
        Cell: ({ renderedCellValue, row }) => (<span>{row?.original?.products?.length || 0}</span>)
    },
    {
        accessorKey: 'deliveryCharge',
        header: 'Delivery',
    },
    {
        accessorKey: 'subtotal',
        header: 'Subtotal',
    },
    {
        accessorKey: 'discount',
        header: 'Discount',
        Cell: ({ renderedCellValue }) => (<span>{Math.round(renderedCellValue)}</span>)
    },
    {
        accessorKey: 'couponDiscount',
        header: 'Coupon Discount',
    },
    {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
    },
    {
        accessorKey: 'status',
        header: 'Status',
    },
]

export const DT_VENDOR_ORDER_COLUMN = [
    {
        accessorKey: 'orderNumber',
        header: 'Order Number',
    },
    {
        accessorKey: 'customer',
        header: 'Customer',
        Cell: ({ renderedCellValue }) => (
            <div className="flex flex-col">
                <span className="font-medium">{renderedCellValue?.name || 'N/A'}</span>
                <span className="text-xs text-gray-500">{renderedCellValue?.phone || 'N/A'}</span>
            </div>
        )
    },
    {
        accessorKey: 'orderItems',
        header: 'Items',
        Cell: ({ renderedCellValue }) => (
            <span>{renderedCellValue?.length || 0} item(s)</span>
        )
    },
    {
        accessorKey: 'vendorSubtotal',
        header: 'Subtotal',
        Cell: ({ renderedCellValue }) => <span>BDT {renderedCellValue?.toLocaleString() || 0}</span>
    },
    {
        accessorKey: 'vendorCommission',
        header: 'Commission',
        Cell: ({ renderedCellValue }) => <span className="text-red-600">-BDT {renderedCellValue?.toLocaleString() || 0}</span>
    },
    {
        accessorKey: 'vendorEarning',
        header: 'Your Earning',
        Cell: ({ renderedCellValue }) => <span className="text-green-600 font-semibold">BDT {renderedCellValue?.toLocaleString() || 0}</span>
    },
    {
        accessorKey: 'status',
        header: 'Status',
        Cell: ({ renderedCellValue }) => {
            const statusColors = {
                pending: 'bg-yellow-100 text-yellow-800',
                confirmed: 'bg-blue-100 text-blue-800',
                processing: 'bg-purple-100 text-purple-800',
                shipped: 'bg-indigo-100 text-indigo-800',
                delivered: 'bg-green-100 text-green-800',
                cancelled: 'bg-red-100 text-red-800'
            }
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[renderedCellValue] || statusColors.pending}`}>
                    {renderedCellValue?.charAt(0).toUpperCase() + renderedCellValue?.slice(1) || 'Pending'}
                </span>
            )
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Order Date',
        Cell: ({ renderedCellValue }) => dayjs(renderedCellValue).format('DD/MM/YYYY HH:mm')
    }
]

export const DT_VENDOR_PRODUCT_VARIANT_COLUMN = [
    {
        accessorKey: 'product',
        header: 'Product',
        Cell: ({ renderedCellValue }) => <span>{renderedCellValue?.name || 'Unknown Product'}</span>
    },
    {
        accessorKey: 'color',
        header: 'Color',
    },
    {
        accessorKey: 'size',
        header: 'Size',
    },
    {
        accessorKey: 'sku',
        header: 'SKU',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
        Cell: ({ renderedCellValue }) => <span>BDT {renderedCellValue?.toLocaleString()}</span>
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
        Cell: ({ renderedCellValue }) => <span>BDT {renderedCellValue?.toLocaleString()}</span>
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount %',
        Cell: ({ renderedCellValue }) => <span className="text-green-600">{renderedCellValue}%</span>
    },
    {
        accessorKey: 'media',
        header: 'Image',
        Cell: ({ renderedCellValue }) => {
            if (!renderedCellValue || !renderedCellValue.filePath) {
                return <span className="text-gray-400">No Image</span>
            }
            return (
                <Image 
                    src={renderedCellValue.filePath} 
                    alt="Product variant" 
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded"
                />
            )
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Created At',
        Cell: ({ renderedCellValue }) => dayjs(renderedCellValue).format('DD/MM/YYYY')
    }
]