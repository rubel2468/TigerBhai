import WebsiteBreadcrumb from "@/components/Application/Website/WebsiteBreadcrumb"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WEBSITE_HOME, WEBSITE_PRODUCT_DETAILS } from "@/routes/WebsiteRoute"
import placeholderImg from '@/public/assets/images/img-placeholder.webp'

const ThankYouPage = async ({ params }) => {
    const { orderid } = await params
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/get/${orderid}`)
    const orderData = await res.json()
    
    const breadcrumb = {
        title: 'Thank You',
        links: [{ label: 'Thank You' }]
    }

    if (!orderData || !orderData.success) {
        return (
            <div>
                <WebsiteBreadcrumb props={breadcrumb} />
                <div className="flex justify-center items-center py-32">
                    <h4 className="text-red-500 text-xl font-semibold">Order Not Found</h4>
                </div>
            </div>
        )
    }

    const allProducts = []
    if (orderData?.data?.orderItems?.length > 0) {
        orderData.data.orderItems.forEach(orderItem => {
            if (orderItem.products?.length > 0) {
                allProducts.push(...orderItem.products)
            }
        })
    } else if (orderData?.data?.products?.length > 0) {
        allProducts.push(...orderData.data.products)
    }

    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />
            <div className="lg:px-32 px-5 my-10 flex justify-center">
                <div className="max-w-2xl w-full bg-white shadow-lg rounded-2xl p-8 text-center">
                    {/* Green Checkmark */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Thank You Message */}
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank you for your purchase</h1>
                    <p className="text-gray-600 mb-4">We've received your order and will ship in 5-7 business days.</p>
                    <p className="text-lg font-semibold text-gray-800 mb-8">Your Order #{orderData?.data?.orderNumber}</p>

                    {/* Order Summary */}
                    <div className="border rounded-lg p-4 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <table className="w-full">
                            <tbody>
                                {allProducts.length > 0 ? (
                                    allProducts.map((product, index) => {
                                        const productImageUrl = product?.productId?.media?.[0]?.filePath ? 
                                            product.productId.media[0].filePath :
                                            product?.variantId?.media?.filePath ? 
                                                product.variantId.media.filePath :
                                                placeholderImg.src
                                        
                                        return (
                                            <tr key={product.variantId?._id || product.productId || index} className="border-b">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <Image 
                                                            src={productImageUrl}
                                                            width={50} 
                                                            height={50} 
                                                            alt={product?.productId?.name || product.name || "product"} 
                                                            className="rounded" 
                                                        />
                                                        <div className="text-left">
                                                            <h4 className="font-medium">
                                                                <Link href={WEBSITE_PRODUCT_DETAILS(product?.productId?.slug)}>{product?.productId?.name || product.name}</Link>
                                                            </h4>
                                                            <p className="text-sm text-gray-500">Qty: {product.qty}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <p>BDT {(product.qty * product.sellingPrice).toLocaleString()}</p>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="text-center py-4 text-gray-500">No products found</td>
                                    </tr>
                                )}
                                <tr className="font-semibold">
                                    <td className="p-3">Total</td>
                                    <td className="p-3 text-right">BDT {orderData?.data?.totalAmount.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Back to Home Button */}
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={WEBSITE_HOME}>Back to Home</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ThankYouPage