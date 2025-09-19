'use client'
import dynamic from 'next/dynamic'
import Image from "next/image"
import placeholderImg from '@/public/assets/images/img-placeholder.webp'
import Link from "next/link"
import { WEBSITE_PRODUCT_DETAILS } from "@/routes/WebsiteRoute"
import useFetch from "@/hooks/useFetch"
import { use, useEffect, useState } from "react"
import { ADMIN_DASHBOARD, ADMIN_ORDER_SHOW } from "@/routes/AdminPanelRoute"
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
import Select from "@/components/Application/Select"
import { orderStatus } from "@/lib/utils"
import ButtonLoading from "@/components/Application/ButtonLoading"
import { showToast } from "@/lib/showToast"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_ORDER_SHOW, label: 'Orders' },
    { href: '', label: 'Order Details' },
]

const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Unverified', value: 'unverified' },
]

const OrderDetails = ({ params }) => {
    const { order_id } = use(params)
    const [orderData, setOrderData] = useState()
    const [orderStatus, setOrderStatus] = useState()
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const { data, loading } = useFetch(`/api/orders/get/${order_id}`)


    useEffect(() => {
        if (data && data.success) {
            setOrderData(data.data)
            setOrderStatus(data?.data?.status)
        }
    }, [data])


    const handleOrderStatus = async () => {
        setUpdatingStatus(true)
        try {
            const { data: response } = await axios.put('/api/orders/update-status', {
                _id: orderData?._id,
                status: orderStatus
            })
            if (!response.success) {
                throw new Error(response.message)
            }

            showToast('success', response.message)

        } catch (error) {
            showToast('error', error.message)
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleDownloadPDF = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank')
        
        // Get the order details HTML
        const orderDetailsHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${orderData?.orderNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .order-info { margin-bottom: 20px; }
                    .order-info h3 { margin-bottom: 10px; }
                    .order-info table { width: 100%; border-collapse: collapse; }
                    .order-info td { padding: 5px; border-bottom: 1px solid #ddd; }
                    .order-info td:first-child { font-weight: bold; width: 30%; }
                    .products-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .products-table th, .products-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                    .products-table th { background-color: #f5f5f5; }
                    .summary { margin-top: 20px; }
                    .summary table { width: 100%; border-collapse: collapse; }
                    .summary td { padding: 5px; border-bottom: 1px solid #ddd; }
                    .summary td:first-child { font-weight: bold; width: 30%; }
                    .total-row { font-weight: bold; font-size: 1.1em; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>INVOICE</h1>
                    <h2>Order #${orderData?.orderNumber}</h2>
                </div>
                
                <div class="order-info">
                    <h3>Order Information</h3>
                    <table>
                        <tr><td>Order Number:</td><td>${orderData?.orderNumber}</td></tr>
                        <tr><td>Order Date:</td><td>${new Date(orderData?.createdAt).toLocaleDateString()}</td></tr>
                        <tr><td>Payment Method:</td><td>${orderData?.paymentMethod?.toUpperCase()}</td></tr>
                        <tr><td>Status:</td><td>${orderData?.status?.toUpperCase()}</td></tr>
                    </table>
                </div>

                <div class="order-info">
                    <h3>Customer Information</h3>
                    <table>
                        <tr><td>Name:</td><td>${orderData?.name}</td></tr>
                        <tr><td>Phone:</td><td>${orderData?.phone}</td></tr>
                        <tr><td>Email:</td><td>${orderData?.email || 'N/A'}</td></tr>
                        <tr><td>Address:</td><td>${orderData?.address}</td></tr>
                        ${orderData?.ordernote ? `<tr><td>Order Note:</td><td>${orderData?.ordernote}</td></tr>` : ''}
                    </table>
                </div>

                <div class="products">
                    <h3>Order Items</h3>
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(() => {
                                // Get products from either products field (legacy) or orderItems field (new)
                                const allProducts = []
                                
                                // Prioritize orderItems field (new multivendor structure) over legacy products field
                                if (orderData?.orderItems?.length > 0) {
                                    orderData.orderItems.forEach(orderItem => {
                                        if (orderItem.products?.length > 0) {
                                            allProducts.push(...orderItem.products)
                                        }
                                    })
                                } else if (orderData?.products?.length > 0) {
                                    // Fallback to legacy products field only if orderItems is empty
                                    allProducts.push(...orderData.products)
                                }
                                
                                return allProducts.length > 0 ? 
                                    allProducts.map(product => `
                                        <tr>
                                            <td>${product.name}</td>
                                            <td>BDT ${product.sellingPrice.toLocaleString()}</td>
                                            <td>${product.qty}</td>
                                            <td>BDT ${(product.qty * product.sellingPrice).toLocaleString()}</td>
                                        </tr>
                                    `).join('') :
                                    `<tr><td colspan="4" style="text-align: center; color: #999; padding: 20px;">
                                        <div>
                                            <p style="font-weight: bold; margin-bottom: 10px;">No products found in this order</p>
                                            <p style="font-size: 12px; color: #666;">
                                                ${orderData?.subtotal > 0 ? 
                                                    'This order has financial data but no product details. This may indicate a data integrity issue.' :
                                                    'This order may have been created before the product tracking system was implemented.'
                                                }
                                            </p>
                                            ${orderData?.subtotal > 0 ? `
                                                <div style="margin-top: 15px; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
                                                    <p style="font-size: 12px; color: #856404;">
                                                        <strong>Order Summary:</strong> Subtotal: BDT ${orderData.subtotal.toLocaleString()}, 
                                                        Total: BDT ${orderData.totalAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </td></tr>`
                            })()}
                        </tbody>
                    </table>
                </div>

                <div class="summary">
                    <h3>Order Summary</h3>
                    <table>
                        <tr><td>Subtotal:</td><td>BDT ${orderData?.subtotal?.toLocaleString()}</td></tr>
                        <tr><td>Delivery Charge:</td><td>BDT ${orderData?.deliveryCharge?.toLocaleString()}</td></tr>
                        <tr><td>Discount:</td><td>BDT ${orderData?.discount?.toLocaleString()}</td></tr>
                        <tr><td>Coupon Discount:</td><td>BDT ${orderData?.couponDiscountAmount?.toLocaleString()}</td></tr>
                        <tr class="total-row"><td>Total Amount:</td><td>BDT ${orderData?.totalAmount?.toLocaleString()}</td></tr>
                    </table>
                </div>

                <div style="margin-top: 40px; text-align: center; color: #666;">
                    <p>Thank you for your order!</p>
                    <p>Generated on ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `
        
        printWindow.document.write(orderDetailsHTML)
        printWindow.document.close()
        
        // Wait for content to load, then print
        printWindow.onload = () => {
            printWindow.print()
            printWindow.close()
        }
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <div className="border">
                {!orderData ?
                    <div className="flex justify-center items-center py-32">
                        <h4 className="text-red-500 text-xl font-semibold">Order Not Found</h4>
                    </div>
                    :
                    <div >
                        <div className="py-2 px-5 border-b mb-3 flex justify-between items-center">
                            <h4 className="text-lg font-bold text-primary">Order Details</h4>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={handleDownloadPDF}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                                <Button 
                                    onClick={handleDownloadPDF}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                            </div>
                        </div>

                        <div className="px-5 mb-5">
                            <div className="mb-5">
                                <p><b>Order Number:</b> {orderData?.orderNumber}</p>
                                <p><b>Payment Method:</b> {orderData?.paymentMethod?.toUpperCase()}</p>
                                <p className="capitalize"><b>Status:</b> {orderData?.status}</p>
                            </div>
                            <table className="w-full border">
                                <thead className="border-b bg-gray-50 dark:bg-card md:table-header-group hidden">
                                    <tr>
                                        <th className="text-start p-3">Product</th>
                                        <th className="text-center p-3">Price</th>
                                        <th className="text-center p-3">Quantity</th>
                                        <th className="text-center p-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        // Get products from either products field (legacy) or orderItems field (new)
                                        const allProducts = []
                                        
                                        // Prioritize orderItems field (new multivendor structure) over legacy products field
                                        if (orderData?.orderItems?.length > 0) {
                                            orderData.orderItems.forEach(orderItem => {
                                                if (orderItem.products?.length > 0) {
                                                    allProducts.push(...orderItem.products)
                                                }
                                            })
                                        } else if (orderData?.products?.length > 0) {
                                            // Fallback to legacy products field only if orderItems is empty
                                            allProducts.push(...orderData.products)
                                        }
                                        
                                        return allProducts.length > 0 ? (
                                            allProducts.map((product, index) => (
                                                <tr key={product.variantId?._id || product.productId || index} className="md:table-row block border-b">
                                                    <td className="md:table-cell p-3">
                                                        <div className="flex items-center gap-5">
                                                            <Image src={product?.variantId?.media?.filePath || placeholderImg.src} width={60} height={60} alt="product" className="rounded" />
                                                            <div>
                                                                <h4 className="text-lg">
                                                                    <Link href={WEBSITE_PRODUCT_DETAILS(product?.productId?.slug)}>{product?.productId?.name || product.name}</Link>
                                                                    {product?.variantId?.color && <p>Color: {product.variantId.color}</p>}
                                                                    {product?.variantId?.size && <p>Size: {product.variantId.size}</p>}
                                                                </h4>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center">
                                                        <span className="md:hidden font-medium">Price</span>
                                                        <span>BDT {product.sellingPrice.toLocaleString()}</span>
                                                    </td>
                                                    <td className="md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center">
                                                        <span className="md:hidden font-medium">Quantity</span>
                                                        <span>{product.qty}</span>
                                                    </td>
                                                    <td className="md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center">
                                                        <span className="md:hidden font-medium">Total</span>
                                                        <span>BDT {(product.qty * product.sellingPrice).toLocaleString()}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-8 text-gray-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p className="text-lg font-medium">No products found in this order</p>
                                                        <p className="text-sm">
                                                            {orderData?.subtotal > 0 ? 
                                                                "This order has financial data but no product details. This may indicate a data integrity issue." :
                                                                "This order may have been created before the product tracking system was implemented."
                                                            }
                                                        </p>
                                                        {orderData?.subtotal > 0 && (
                                                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                <p className="text-sm text-yellow-800">
                                                                    <strong>Order Summary:</strong> Subtotal: BDT {orderData.subtotal.toLocaleString()}, 
                                                                    Total: BDT {orderData.totalAmount.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })()}
                                </tbody>
                            </table>

                            <div className="grid md:grid-cols-2 grid-cols-1 gap-10 border mt-10">
                                <div className="p-5">
                                    <h4 className="text-lg font-semibold mb-5">Shipping Address</h4>
                                    <div>
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="font-medium py-2">Name</td>
                                                    <td className="text-end py-2">{orderData?.name}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Phone</td>
                                                    <td className="text-end py-2">{orderData?.phone}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Email</td>
                                                    <td className="text-end py-2">{orderData?.email || '---'}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Address</td>
                                                    <td className="text-end py-2 whitespace-pre-line">{orderData?.address}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Order note</td>
                                                    <td className="text-end py-2">{orderData?.ordernote || '---'}</td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="p-5 bg-gray-50 dark:bg-card">
                                    <h4 className="text-lg font-semibold mb-5">Order Summary</h4>
                                    <div>
                                        <table className="w-full">
                                            <tbody>
                                                <tr>
                                                    <td className="font-medium py-2">Delivery Charge</td>
                                                    <td className="text-end py-2">BDT {orderData?.deliveryCharge?.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Subtotal</td>
                                                    <td className="text-end py-2">BDT {orderData?.subtotal.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Discount</td>
                                                    <td className="text-end py-2">BDT {orderData?.discount.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Coupon Discount</td>
                                                    <td className="text-end py-2">BDT {orderData?.couponDiscountAmount.toLocaleString()}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-medium py-2">Total</td>
                                                    <td className="text-end py-2">BDT {orderData?.totalAmount.toLocaleString()}</td>
                                                </tr>


                                            </tbody>
                                        </table>
                                    </div>

                                    <hr />

                                    <div className="pt-3">
                                        <h4 className="text-lg font-semibold mb-2">Order Status</h4>
                                        <Select
                                            options={statusOptions}
                                            selected={orderStatus}
                                            setSelected={(value) => setOrderStatus(value)}
                                            placeholder="Select"
                                            isMulti={false}
                                        />
                                        <ButtonLoading type="button" loading={updatingStatus} onClick={handleOrderStatus} text="Save Status" className="mt-5 cursor-pointer" />
                                    </div>

                                </div>
                            </div>

                        </div>


                    </div>
                }
            </div>
        </div>
    )
}

export default dynamic(() => Promise.resolve(OrderDetails), {
    ssr: false,
    loading: () => <div className='flex justify-center items-center h-64'>Loading...</div>
})