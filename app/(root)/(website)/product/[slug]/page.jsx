import React from 'react'
import ProductDetails from './ProductDetails'
import { headers } from 'next/headers'

function getBaseUrl() {
  const hdrs = headers()
  const host = hdrs.get('x-forwarded-host') || hdrs.get('host') || ''
  const proto = hdrs.get('x-forwarded-proto') || 'http'
  return `${proto}://${host}`
}

async function fetchProduct(slug) {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/product/details/${slug}`, {
      // Cache on the server and revalidate periodically
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const json = await res.json()
    if (!json?.success) return null
    return json.data
  } catch (e) {
    return null
  }
}

const ViewContentEffect = ({ product, variant }) => {
  "use client"
  const { useEffect } = React
  const { pushToDataLayer } = require('@/lib/gtm')
  useEffect(() => {
    if (product && variant) {
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
  }, [product, variant])
  return null
}

const ProductPage = async ({ params }) => {
  const slug = params?.slug
  const data = slug ? await fetchProduct(slug) : null

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600">Product not found</h2>
          <p className="text-gray-500 mt-2">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ViewContentEffect product={data.product} variant={data.variant} />
      <ProductDetails {...data} />
    </>
  )
}

export default ProductPage