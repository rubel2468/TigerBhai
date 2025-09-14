import Image from 'next/image'
import Link from 'next/link'
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import banner1 from '@/public/assets/images/banner1.png'
import banner2 from '@/public/assets/images/banner2.png'
import advertisingBanner from '@/public/assets/images/advertising-banner.png'

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
import { headers } from 'next/headers'

// Server-side data fetching for better performance with mobile optimization
async function getHomepageData() {
    try {
        const requestHeaders = await headers()
        const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
        const protocol = requestHeaders.get('x-forwarded-proto') || 'http'
        const baseUrl = `${protocol}://${host}`
        // Prioritize critical above-the-fold content
        const [carouselRes, featuredRes] = await Promise.all([
            fetch(`${baseUrl}/api/carousel`, { 
                cache: 'no-store',
                headers: { 'Accept': 'application/json' }
            }),
            fetch(`${baseUrl}/api/product/get-featured-product`, { 
                cache: 'force-cache', 
                next: { revalidate: 1800 },
                headers: { 'Accept': 'application/json' }
            })
        ])

        const [carouselData, featuredData] = await Promise.all([
            carouselRes.json(),
            featuredRes.json()
        ])

        // Load below-the-fold content separately to improve LCP
        const [reviewsRes, categoriesRes] = await Promise.all([
            fetch(`${baseUrl}/api/review/homepage?limit=5`, { 
                cache: 'force-cache', 
                next: { revalidate: 1800 },
                headers: { 'Accept': 'application/json' }
            }),
            fetch(`${baseUrl}/api/category/get-category`, { 
                cache: 'force-cache', 
                next: { revalidate: 3600 },
                headers: { 'Accept': 'application/json' }
            })
        ])

        const [reviewsData, categoriesData] = await Promise.all([
            reviewsRes.json(),
            categoriesRes.json()
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
                <div className='grid grid-cols-2 sm:gap-10 gap-2'>

                    <div className='border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                        <Link href="" >
                            <Image
                                src={banner1.src}
                                width={banner1.width}
                                height={banner1.height}
                                alt='banner 1'
                                className='transition-all hover:scale-110'
                            />
                        </Link>
                    </div>
                    <div className='border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                        <Link href="" >
                            <Image
                                src={banner2.src}
                                width={banner2.width}
                                height={banner2.height}
                                alt='banner 2'
                                className='transition-all hover:scale-110'
                            />
                        </Link>
                    </div>

                </div>
            </section>

            <FeaturedProduct initialData={homepageData.featured} />

            <section className='sm:pt-20 pt-5 pb-10'>
                <Image
                    src={advertisingBanner.src}
                    height={advertisingBanner.height}
                    width={advertisingBanner.width}
                    alt='Advertisement'
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 80vw"
                />
            </section>

            <MainCategoryGrid initialData={homepageData.categories} />

            <section className='lg:px-32 px-4 border-t border-border py-10'>
                <div className='grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-10'>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3 text-primary'>
                            <GiReturnArrow size={30} />
                        </p>
                        <h3 className='text-xl font-semibold text-foreground'>7-Days Returns</h3>
                        <p className='text-muted-foreground'>Risk-free shopping with easy returns.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3 text-primary'>
                            <FaShippingFast size={30} />
                        </p>
                        <h3 className='text-xl font-semibold text-foreground'>Free Shipping</h3>
                        <p className='text-muted-foreground'>No extra costs, just the price you see.</p>
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
                
                {/* Color Demo Section */}
                <div className='mt-16 text-center'>
                    <h3 className='text-2xl font-bold text-foreground mb-8'>Button Color Variants</h3>
                    <div className='flex flex-wrap justify-center gap-4'>
                        <button className='bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors'>
                            Primary (Blue)
                        </button>
                        <button className='bg-secondary hover:bg-secondary/80 text-secondary-foreground px-6 py-3 rounded-lg font-medium transition-colors'>
                            Secondary (Yellow)
                        </button>
                        <button className='bg-destructive hover:bg-destructive/90 text-white px-6 py-3 rounded-lg font-medium transition-colors'>
                            Buy Now (Red)
                        </button>
                        <button className='border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors'>
                            Outline
                        </button>
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