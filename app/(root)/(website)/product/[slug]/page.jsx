'use client'

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ProductDetails from './ProductDetails'
import ProductSkeleton from '@/components/Application/Website/ProductSkeleton'

const ProductPage = () => {
    const params = useParams()
    const searchParams = useSearchParams()
    const [productData, setProductData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const slug = params.slug
    const color = searchParams.get('color')
    const size = searchParams.get('size')

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                setError(false)

                let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/details/${slug}`

                const qs = new URLSearchParams()
                if (color) qs.set('color', color)
                if (size) qs.set('size', size)
                const qstr = qs.toString()
                if (qstr) url += `?${qstr}`

                const { data: getProduct } = await axios.get(url)

                if (!getProduct.success) {
                    setError(true)
                } else {
                    setProductData(getProduct.data)
                }
            } catch (err) {
                console.error('Error fetching product:', err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchProduct()
        }
    }, [slug, color, size])

    if (loading) {
        return <ProductSkeleton />
    }

    if (error || !productData) {
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <div className="text-center">
                    <h1 className='text-4xl font-semibold text-foreground mb-4'>Product not found</h1>
                    <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
                    <button 
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <ProductDetails
            product={productData?.product}
            variant={productData?.variant}
            colors={productData?.colors}
            sizes={productData?.sizes}
            reviewCount={productData?.reviewCount}
            variantsByColor={productData?.variantsByColor}
        />
    )
}

export default ProductPage