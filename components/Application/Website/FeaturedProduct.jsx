import Link from 'next/link'
import React, { memo } from 'react'
import { IoIosArrowRoundForward } from "react-icons/io";
import ProductBox from './ProductBox';

const FeaturedProduct = ({ initialData }) => {
    const productData = initialData || { success: false, data: [] }

    // Debug logging
    console.log('FeaturedProduct - productData:', productData)
    console.log('FeaturedProduct - success:', productData?.success)
    console.log('FeaturedProduct - data:', productData?.data)
    console.log('FeaturedProduct - data length:', productData?.data?.length)

    if (!productData || !productData.success) {
        console.log('FeaturedProduct - returning null due to missing data')
        return null
    }
    return (
        <section className='lg:px-32 px-4 sm:py-10'>
            <div className='flex justify-between items-center mb-5'>
                <h2 className='sm:text-4xl text-2xl font-semibold'>Featured Products</h2>
                <Link href="" className='flex items-center gap-2 underline underline-offset-4 hover:text-primary'>
                    View All
                    <IoIosArrowRoundForward />
                </Link>
            </div>
            <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 lg:gap-8 md:gap-6 sm:gap-4 gap-2'>
                {!productData.success && <div className='text-center py-5'>Data Not Found.</div>}

                {productData.success && productData.data.map((product) => (
                    <ProductBox key={product._id} product={product} />
                ))}

            </div>
        </section>
    )
}

export default memo(FeaturedProduct)