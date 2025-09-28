import React from 'react'
import ProductDetails from './ProductDetails'

export const revalidate = 300
export const dynamic = 'force-dynamic'

// Generate metadata for social sharing (Open Graph, Twitter Cards)
export async function generateMetadata({ params }) {
  try {
    const slug = params?.slug
    if (!slug) {
      return {
        title: 'Product Not Found - Tiger Bhai',
        description: 'The product you are looking for could not be found.',
      }
    }

    const product = await fetchProduct(slug)
    if (!product) {
      return {
        title: 'Product Not Found - Tiger Bhai',
        description: 'The product you are looking for could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://tigerbhai.com'
    const productUrl = `${baseUrl}/product/${slug}`
    
    // Get the first product image or a placeholder
    const productImage = product.variant?.media?.[0]?.filePath || 
                        product.media?.[0]?.filePath || 
                        `${baseUrl}/assets/images/img-placeholder.webp`
    
    // Ensure image URL is absolute
    const imageUrl = productImage.startsWith('http') ? productImage : `${baseUrl}${productImage}`
    
    const title = `${product.name} - Tiger Bhai`
    const description = product.shortDescription || 
                       product.description?.substring(0, 160) || 
                       `Shop ${product.name} at Tiger Bhai - Your trusted destination for quality products.`

    return {
      title,
      description,
      keywords: `${product.name}, Tiger Bhai, online shopping, ${product.variant?.color || ''}, ${product.variant?.size || ''}`.trim(),
      openGraph: {
        title,
        description,
        url: productUrl,
        siteName: 'Tiger Bhai',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        site: '@TigerBhai', // Add your Twitter handle if you have one
      },
      alternates: {
        canonical: productUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Tiger Bhai',
      description: 'Your trusted destination for quality and convenience.',
    }
  }
}

async function fetchProduct(slug) {
  try {
    // Use relative URL as fallback to avoid environment variable issues
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
    const url = baseUrl ? `${baseUrl}/api/product/details/${slug}` : `/api/product/details/${slug}`
    const res = await fetch(url, { 
      next: { revalidate: 300 },
      headers: {
        'Content-Type': 'application/json',
      }
    })
    if (!res.ok) {
      console.error(`[product/[slug]] API error: ${res.status} ${res.statusText}`)
      return null
    }
    const json = await res.json()
    if (!json?.success) {
      console.error('[product/[slug]] API response not successful:', json)
      return null
    }
    return json.data
  } catch (e) {
    console.error('[product/[slug]] fetch error', e)
    return null
  }
}

// Removed client-only ViewContentEffect from server page. GTM viewcontent is triggered inside ProductDetails (client).

const ProductPage = async ({ params }) => {
  try {
    const slug = params?.slug
    if (!slug) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-600">Invalid product</h2>
            <p className="text-gray-500 mt-2">No product slug provided.</p>
          </div>
        </div>
      )
    }

    const data = await fetchProduct(slug)

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
        <ProductDetails {...data} />
      </>
    )
  } catch (error) {
    console.error('[ProductPage] Server error:', error)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600">Something went wrong</h2>
          <p className="text-gray-500 mt-2">Please try again later.</p>
        </div>
      </div>
    )
  }
}

export default ProductPage