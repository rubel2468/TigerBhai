"use client"
import React, { useEffect, Suspense } from 'react'
import ProductDetails from './ProductDetails'
import useFetch from '@/hooks/useFetch'
import { useParams } from 'next/navigation'
import { pushToDataLayer } from '@/lib/gtm'

const ProductPage = () => {
  const params = useParams()
  const slug = params?.slug
  const { data, loading } = useFetch(`/api/product/details/${slug}`)

  useEffect(() => {
    if (data?.success && data?.data?.product && data?.data?.variant) {
      const { product, variant } = data.data
      pushToDataLayer('viewcontent', {
        item_id: variant._id,
        item_name: product.name,
        item_brand: product.brand || undefined,
        item_category: product?.category?.name || undefined,
        item_variant: variant.size ? `${variant.color || ''} ${variant.size}`.trim() : variant.color,
        price: Number(variant.sellingPrice),
        currency: 'BDT',
      })
    }
  }, [data])

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }
  
  if (!data?.success) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-600">Product not found</h2>
        <p className="text-gray-500 mt-2">The product you're looking for doesn't exist.</p>
      </div>
    </div>
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
      <ProductDetails {...data.data} />
    </Suspense>
  )
}

export default ProductPage