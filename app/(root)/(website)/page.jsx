import Image from 'next/image'
import Link from 'next/link'
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import banner1 from '@/public/assets/images/banner1.webp'
import banner2 from '@/public/assets/images/banner2.webp'
import banner3 from '@/public/assets/images/banner3.webp'
import banner4 from '@/public/assets/images/banner4.webp'

// Dynamic imports for better code splitting
const MainSlider = dynamic(() => import('@/components/Application/Website/MainSlider'), {
    loading: () => <div className="h-[calc(100vh-4rem)] w-full bg-background animate-pulse" />,
    ssr: true
})

const FeaturedProduct = dynamic(() => import('@/components/Application/Website/FeaturedProduct'), {
    loading: () => <div className="h-96 w-full bg-background animate-pulse" />,
    ssr: true
})

const CustomerReviews = dynamic(() => import('@/components/Application/Website/CustomerReviews'), {
    loading: () => <div className="h-96 w-full bg-background animate-pulse" />,
    ssr: true
})

const MainCategoryGrid = dynamic(() => import('@/components/Application/Website/MainCategoryGrid'), {
    loading: () => <div className="h-96 w-full bg-background animate-pulse" />,
    ssr: true
})

// Optimized icon imports - only import what we need
import { GiReturnArrow } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { TbRosetteDiscountFilled } from "react-icons/tb";
// Server-side data fetching for better performance with mobile optimization
async function getHomepageData() {
    try {
        // Use environment variable for base URL or default to production URL
        const baseUrl = process.env.NEXTAUTH_URL || 'https://tigerbhai.online'
        
        // Add timeout and better error handling for fetch requests
        const fetchWithTimeout = async (url, options = {}) => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
            
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                })
                clearTimeout(timeoutId)
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                
                return response
            } catch (error) {
                clearTimeout(timeoutId)
                throw error
            }
        }
        
        // Prioritize critical above-the-fold content with proper caching
        const [carouselRes, featuredRes] = await Promise.all([
            fetchWithTimeout(`${baseUrl}/api/carousel`, { 
                cache: 'force-cache',
                next: { revalidate: 3600, tags: ['carousel'] },
                headers: { 'Accept': 'application/json' }
            }).catch(() => null),
            fetchWithTimeout(`${baseUrl}/api/product/get-featured-product`, { 
                cache: 'force-cache', 
                next: { revalidate: 1800, tags: ['featured-products', 'shop-products'] },
                headers: { 'Accept': 'application/json' }
            }).catch(() => null)
        ])

        const [carouselData, featuredData] = await Promise.all([
            carouselRes ? carouselRes.json().catch(() => ({ success: false, data: [] })) : { success: false, data: [] },
            featuredRes ? featuredRes.json().catch(() => ({ success: false, data: [] })) : { success: false, data: [] }
        ])

        // Load below-the-fold content separately to improve LCP
        const [reviewsRes, categoriesRes] = await Promise.all([
            fetchWithTimeout(`${baseUrl}/api/review/homepage?limit=5`, { 
                cache: 'force-cache', 
                next: { revalidate: 1800, tags: ['homepage-reviews'] },
                headers: { 'Accept': 'application/json' }
            }).catch(() => null),
            fetchWithTimeout(`${baseUrl}/api/category/get-category`, { 
                cache: 'force-cache', 
                next: { revalidate: 3600, tags: ['categories'] },
                headers: { 'Accept': 'application/json' }
            }).catch(() => null)
        ])

        const [reviewsData, categoriesData] = await Promise.all([
            reviewsRes ? reviewsRes.json().catch(() => ({ success: false, data: { reviews: [], stats: {} } })) : { success: false, data: { reviews: [], stats: {} } },
            categoriesRes ? categoriesRes.json().catch(() => ({ success: false, data: { mainCategories: [] } })) : { success: false, data: { mainCategories: [] } }
        ])

        return {
            carousel: carouselData,
            featured: featuredData,
            reviews: reviewsData,
            categories: categoriesData
        }
    } catch (error) {
        console.error('Error fetching homepage data:', error)
        return {
            carousel: { success: false, data: [] },
            featured: { success: false, data: [] },
            reviews: { success: false, data: { reviews: [], stats: {} } },
            categories: { success: false, data: { mainCategories: [] } }
        }
    }
}

const Home = async () => {
    const homepageData = await getHomepageData()
    return (
        <>
            <section className="relative">
                <MainSlider initialData={homepageData.carousel} />
            </section>
            <section className='lg:px-32 px-4 sm:pt-20 pt-5 pb-10'>
                <div className='grid grid-cols-2 lg:grid-cols-4 sm:gap-6 gap-3'>

                    <div className='border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                        <Link href="" >
                            <Image
                                src={banner1.src}
                                width={360}
                                height={360}
                                alt='banner 1'
                                className='w-full h-auto transition-all hover:scale-110'
                                style={{ aspectRatio: '1/1' }}
                            />
                        </Link>
                    </div>
                    <div className='border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                        <Link href="" >
                            <Image
                                src={banner2.src}
                                width={360}
                                height={360}
                                alt='banner 2'
                                className='w-full h-auto transition-all hover:scale-110'
                                style={{ aspectRatio: '1/1' }}
                            />
                        </Link>
                    </div>
                    <div className='border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                        <Link href="" >
                            <Image
                                src={banner3.src}
                                width={360}
                                height={360}
                                alt='banner 3'
                                className='w-full h-auto transition-all hover:scale-110'
                                style={{ aspectRatio: '1/1' }}
                            />
                        </Link>
                    </div>
                    <div className='border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                        <Link href="" >
                            <Image
                                src={banner4.src}
                                width={360}
                                height={360}
                                alt='banner 4'
                                className='w-full h-auto transition-all hover:scale-110'
                                style={{ aspectRatio: '1/1' }}
                            />
                        </Link>
                    </div>

                </div>
            </section>

            <FeaturedProduct initialData={homepageData.featured} />


            <MainCategoryGrid initialData={homepageData.categories} />

            <section className='lg:px-32 px-4 border-t border-border py-10'>
                <div className='grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-10'>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3 text-primary'>
                            <GiReturnArrow size={30} />
                        </p>
                        <h3 className='text-xl font-semibold text-foreground'>Instant Returns</h3>
                        <p className='text-muted-foreground'>Risk-free shopping with easy returns.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3 text-primary'>
                            <FaShippingFast size={30} />
                        </p>
                        <h3 className='text-xl font-semibold text-foreground'>Fast Shipping</h3>
                        <p className='text-muted-foreground'>Fast shipping, no extra costs.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3 text-primary'>
                            <BiSupport size={30} />
                        </p>
                        <h3 className='text-xl font-semibold text-foreground'>24/7 Support</h3>
                        <p className='text-muted-foreground'>24/7 support, alway here just for you.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3 text-primary'>
                            <TbRosetteDiscountFilled size={30} />
                        </p>
                        <h3 className='text-xl font-semibold text-foreground'>Member Discounts</h3>
                        <p className='text-muted-foreground'>Special offers for our loyal customers.</p>
                    </div>
                </div>
            </section>

            {/* Defer non-critical content for mobile - moved to bottom */}
            <div className="hidden md:block">
                <CustomerReviews initialData={homepageData.reviews} />
            </div>

            <div className="md:hidden">
                <CustomerReviews initialData={homepageData.reviews} />
            </div>

        </>
    )
}

export default Home