import WebsiteBreadcrumb from "@/components/Application/Website/WebsiteBreadcrumb"
import axios from "axios"
import Image from "next/image"
import placeholderImg from '@/public/assets/images/img-placeholder.webp'
import Link from "next/link"
import { WEBSITE_PRODUCT_DETAILS } from "@/routes/WebsiteRoute"
const OrderDetails = async ({ params }) => {
    const { orderid } = await params
    const { data: orderData } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/get/${orderid}`)
    const breadcrumb = {
        title: 'Order Details',
        links: [{ label: 'Order Details' }]
    }
    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />
            <div className="lg:px-32 px-5 my-10">
                {orderData && !orderData.success ?
                    <div className="flex justify-center items-center py-32">
                        <h4 className="text-red-500 text-xl font-semibold">Order Not Found</h4>
                    </div>
                    :
                    <div>
                        <div className="mb-5">
                            <p><b>Order Number:</b> {orderData?.data?.orderNumber}</p>
                            <p><b>Payment Method:</b> {orderData?.data?.paymentMethod?.toUpperCase()}</p>
                            <p className="capitalize"><b>Status:</b> {orderData?.data?.status}</p>
                        </div>
                        <table className="w-full border">
                            <thead className="border-b bg-gray-50 md:table-header-group hidden">
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
                                    if (orderData?.data?.orderItems?.length > 0) {
                                        orderData.data.orderItems.forEach(orderItem => {
                                            if (orderItem.products?.length > 0) {
                                                allProducts.push(...orderItem.products)
                                            }
                                        })
                                    } else if (orderData?.data?.products?.length > 0) {
                                        // Fallback to legacy products field only if orderItems is empty
                                        allProducts.push(...orderData.data.products)
                                    }
                                    
                                    return allProducts.length > 0 ? (
                                        allProducts.map((product, index) => {
                                            const productImageUrl = product?.productId?.media?.[0]?.filePath ? 
                                                product.productId.media[0].filePath :
                                                product?.variantId?.media?.filePath ? 
                                                    product.variantId.media.filePath :
                                                    placeholderImg.src
                                            
                                            return (
                                                <tr key={product.variantId?._id || product.productId || index} className="md:table-row block border-b">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-5">
                                                            <Image 
                                                                src={productImageUrl}
                                                                width={60} 
                                                                height={60} 
                                                                alt={product?.productId?.name || product.name || "product"} 
                                                                className="rounded" 
                                                            />
                                                            <div>
                                                                <h4 className="text-lg line-clamp-1">
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
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-lg font-medium">No products found in this order</p>
                                                    <p className="text-sm">
                                                        {orderData?.data?.subtotal > 0 ? 
                                                            "This order has financial data but no product details. This may indicate a data integrity issue." :
                                                            "This order may have been created before the product tracking system was implemented."
                                                        }
                                                    </p>
                                                    {orderData?.data?.subtotal > 0 && (
                                                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                            <p className="text-sm text-yellow-800">
                                                                <strong>Order Summary:</strong> Subtotal: BDT {orderData.data.subtotal.toLocaleString()}, 
                                                                Total: BDT {orderData.data.totalAmount.toLocaleString()}
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
                                                <td className="text-end py-2">{orderData?.data?.name}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-medium py-2">Phone</td>
                                                <td className="text-end py-2">{orderData?.data?.phone}</td>
                                            </tr>
                        
                                            <tr>
                                                <td className="font-medium py-2">Email</td>
                                                <td className="text-end py-2">{orderData?.data?.email || '---'}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-medium py-2">Address</td>
                                                <td className="text-end py-2 whitespace-pre-line">{orderData?.data?.address}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-medium py-2">Order note</td>
                                                <td className="text-end py-2">{orderData?.data?.ordernote || '---'}</td>
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="p-5 bg-gray-50">
                                <h4 className="text-lg font-semibold mb-5">Order Summary</h4>
                                <div>
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-medium py-2">Subtotal</td>
                                                <td className="text-end py-2">BDT {orderData?.data?.subtotal.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-medium py-2">Discount</td>
                                                <td className="text-end py-2">BDT {orderData?.data?.discount.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-medium py-2">Coupon Discount</td>
                                                <td className="text-end py-2">BDT {orderData?.data?.couponDiscountAmount.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-medium py-2">Total</td>
                                                <td className="text-end py-2">BDT {orderData?.data?.totalAmount.toLocaleString()}</td>
                                            </tr>


                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                }
            </div>
        </div>
    )
}

export default OrderDetails