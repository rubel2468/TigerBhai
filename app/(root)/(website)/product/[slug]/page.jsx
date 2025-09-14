import axios from 'axios'
import React from 'react'
import ProductDetails from './ProductDetails'

const ProductPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const { color, size } = await searchParams

    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/details/${slug}`

    const qs = new URLSearchParams()
    if (color) qs.set('color', color)
    if (size) qs.set('size', size)
    const qstr = qs.toString()
    if (qstr) url += `?${qstr}`

    const { data: getProduct } = await axios.get(url)

    if (!getProduct.success) {
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <h1 className='text-4xl font-semibold text-foreground'>Data not found.</h1>
            </div>
        )
    } else {

        return (
            <ProductDetails
                product={getProduct?.data?.product}
                variant={getProduct?.data?.variant}
                colors={getProduct?.data?.colors}
                sizes={getProduct?.data?.sizes}
                reviewCount={getProduct?.data?.reviewCount}
                variantsByColor={getProduct?.data?.variantsByColor}
            />
        )
    }

}

export default ProductPage