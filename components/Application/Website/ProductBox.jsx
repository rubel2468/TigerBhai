import Image from 'next/image'
import React, { memo, useMemo } from 'react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { BLUR_DATA_URL, getImageSizes, getImageQuality } from '@/lib/imageUtils'

const ProductBox = memo(({ product }) => {
    // Calculate discount percentage with memoization
    const discountPercentage = useMemo(() => {
        return Math.round(((product?.mrp - product?.sellingPrice) / product?.mrp) * 100)
    }, [product?.mrp, product?.sellingPrice])

    return (
        <div className='group relative bg-card dark:bg-card rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 ease-out border border-border/50 hover:border-blue-500/40 hover:-translate-y-1'>
            <Link 
                href={WEBSITE_PRODUCT_DETAILS(product.slug)} 
                className='block'
                prefetch={true}
            >
                {/* Image Container with 4:5 aspect ratio */}
                <div className='relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted to-background dark:from-gray-800 dark:to-gray-900'>
                    <Image
                        src={(product?.media[0]?.filePath ? `${product.media[0].filePath}${product?.updatedAt ? `?v=${new Date(product.updatedAt).getTime()}` : ''}` : imgPlaceholder.src)}
                        width={400}
                        height={500}
                        alt={product?.media[0]?.alt || product?.name}
                        title={product?.media[0]?.title || product?.name}
                        className='w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105'
                        loading="lazy"
                        sizes={getImageSizes('mobile')}
                        quality={getImageQuality(false)}
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                    />
                    
                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className='absolute top-3 left-3 bg-destructive text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg'>
                            -{discountPercentage}%
                        </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-blue-500/10 transition-all duration-300'></div>
                    
                    {/* Quick View Button (appears on hover) */}
                    <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300'>
                        <button className='bg-secondary/95 dark:bg-gray-800/95 backdrop-blur-sm text-secondary-foreground dark:text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-secondary dark:hover:bg-gray-800 transition-colors duration-200'>
                            Quick View
                        </button>
                    </div>
                </div>
                
                {/* Product Info */}
                <div className="p-2 md:p-4 space-y-2 md:space-y-3">
                    {/* Product Name */}
                    <h4 className='font-semibold text-card-foreground dark:text-white text-xs md:text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-200'>
                        {product?.name}
                    </h4>
                    
                    {/* Price Section */}
                    <div className='flex items-center gap-1 md:gap-2'>
                        <span className='text-sm md:text-lg font-bold text-card-foreground dark:text-white'>
                            BDT {product?.sellingPrice.toLocaleString()}
                        </span>
                        {product?.mrp > product?.sellingPrice && (
                            <span className='text-xs md:text-sm text-muted-foreground dark:text-gray-400 line-through'>
                                BDT {product?.mrp.toLocaleString()}
                            </span>
                        )}
                    </div>
                    
                    {/* Rating Stars (placeholder for future implementation) */}
                    <div className='flex items-center gap-1'>
                        <div className='flex text-secondary'>
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className='w-3 h-3 fill-current' viewBox='0 0 20 20'>
                                    <path d='M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z'/>
                                </svg>
                            ))}
                        </div>
                        <span className='text-xs text-muted-foreground dark:text-gray-400 ml-1'>(4.5)</span>
                    </div>
                </div>
            </Link>
        </div>
    )
})

export default ProductBox