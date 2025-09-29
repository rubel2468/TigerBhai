import Image from 'next/image'
import Link from 'next/link'
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import banner1 from '@/public/assets/images/banner1.webp'
import banner2 from '@/public/assets/images/banner2.webp'
import banner3 from '@/public/assets/images/banner3.webp'
import banner4 from '@/public/assets/images/banner4.webp'

// Client-side rendering for homepage components

// Optimized dynamic imports for better code splitting
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

// Dynamic icon loading to reduce bundle size - only load what's needed
const GiReturnArrow = dynamic(() => import("react-icons/gi").then(mod => ({ default: mod.GiReturnArrow })), {
    loading: () => <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
})
const FaShippingFast = dynamic(() => import("react-icons/fa").then(mod => ({ default: mod.FaShippingFast })), {
    loading: () => <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
})
const BiSupport = dynamic(() => import("react-icons/bi").then(mod => ({ default: mod.BiSupport })), {
    loading: () => <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
})
const TbRosetteDiscountFilled = dynamic(() => import("react-icons/tb").then(mod => ({ default: mod.TbRosetteDiscountFilled })), {
    loading: () => <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
})
const Home = () => {
    return (
        <>
            <section className="relative">
                <MainSlider />
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

            <FeaturedProduct />


            <MainCategoryGrid />

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
                <CustomerReviews />
            </div>

            <div className="md:hidden">
                <CustomerReviews />
            </div>

        </>
    )
}

export default Home