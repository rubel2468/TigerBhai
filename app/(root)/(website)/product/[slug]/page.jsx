import ProductDetails from './ProductDetails'
import ProductSkeleton from '@/components/Application/Website/ProductSkeleton'

export const revalidate = 300
export const dynamicParams = true

const fetchProductData = async (slug, searchParams) => {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://tigerbhai.online'
    const qs = new URLSearchParams()
    const color = searchParams?.color
    const size = searchParams?.size
    if (color) qs.set('color', color)
    if (size) qs.set('size', size)
    const qstr = qs.toString()
    const url = `${baseUrl}/api/product/details/${slug}${qstr ? `?${qstr}` : ''}`

    const res = await fetch(url, {
        cache: 'force-cache',
        next: { revalidate },
        headers: { 'Accept': 'application/json' }
    })
    if (!res.ok) return null
    const json = await res.json()
    if (!json?.success) return null
    return json.data
}

const ProductPage = async ({ params, searchParams }) => {
    const { slug } = params || {}
    if (!slug) {
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <div className="text-center">
                    <h1 className='text-4xl font-semibold text-foreground mb-4'>Product not found</h1>
                    <p className="text-gray-600 mb-4">Invalid product URL.</p>
                </div>
            </div>
        )
    }

    const productData = await fetchProductData(slug, searchParams)
    if (!productData) {
        return <ProductSkeleton />
    }

    return (
        <ProductDetails
            product={productData.product}
            variant={productData.variant}
            colors={productData.colors}
            sizes={productData.sizes}
            reviewCount={productData.reviewCount}
            variantsByColor={productData.variantsByColor}
        />
    )
}

export default ProductPage