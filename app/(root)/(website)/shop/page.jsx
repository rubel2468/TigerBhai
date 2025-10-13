'use client'
import Filter from '@/components/Application/Website/Filter'
import Sorting from '@/components/Application/Website/Sorting'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import React, { useState, Suspense } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import useWindowSize from '@/hooks/useWindowSize'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import ProductBox from '@/components/Application/Website/ProductBox'
import ButtonLoading from '@/components/Application/ButtonLoading'
const breadcrumb = {
    title: 'Shop',
    links: [
        { label: 'Shop', href: WEBSITE_SHOP }
    ]
}
const ShopPage = () => {
    const searchParams = useSearchParams().toString()
    const [limit, setLimit] = useState(12)
    const [sorting, setSorting] = useState('default_sorting')
    const [currentPage, setCurrentPage] = useState(0)
    const [isMobileFilter, setIsMobileFilter] = useState(false)
    const windowSize = useWindowSize()

    const fetchProduct = async () => {
        const { data: getProduct } = await axios.get(`/api/shop?page=${currentPage}&limit=${limit}&sort=${sorting}&${searchParams}`)

        if (!getProduct.success) {
            return
        }

        return getProduct.data
    }

    const { error, data, isFetching } = useQuery({
        queryKey: ['products', limit, sorting, searchParams, currentPage],
        queryFn: fetchProduct,
    })

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(0)
    }, [searchParams, sorting, limit])

    return (
        <div >
            <WebsiteBreadcrumb props={breadcrumb} />
            <section className='lg:flex lg:px-32 px-4 my-10'>
                {windowSize.width > 1024 ?

                    <div className='w-72 me-4'>
                        <div className='sticky top-0 bg-gray-50 p-4 rounded'>
                            <Filter />
                        </div>
                    </div>
                    :

                    <Sheet open={isMobileFilter} onOpenChange={() => setIsMobileFilter(false)}>
                        <SheetContent side='left' className="block">
                            <SheetHeader className="border-b">
                                <SheetTitle>Filter </SheetTitle>
                            </SheetHeader>
                            <div className='p-4 overflow-auto h-[calc(100vh-80px)]'>
                                <Filter />
                            </div>
                        </SheetContent>
                    </Sheet>

                }


                <div className='lg:w-[calc(100%-18rem)]'>
                    <Sorting
                        limit={limit}
                        setLimit={setLimit}
                        sorting={sorting}
                        setSorting={setSorting}
                        mobileFilterOpen={isMobileFilter}
                        setMobileFilterOpen={setIsMobileFilter}
                    />

                    {isFetching && <div className='p-3 font-semibold text-center'>Loading...</div>}
                    {error && <div className='p-3 font-semibold text-center'>{error.message}</div>}

                    <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 lg:gap-8 md:gap-6 sm:gap-4 gap-2 mt-10'>
                        {data?.products?.map(product => (
                            <ProductBox key={product._id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {data?.products?.length > 0 && (
                        <div className='flex justify-center mt-10'>
                            <div className='flex items-center gap-1'>
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0 || isFetching}
                                    className='px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                >
                                    Previous
                                </button>
                                
                                {/* Page Numbers */}
                                {(() => {
                                    const pages = []
                                    const totalPages = data?.totalPages || 1
                                    const maxVisiblePages = Math.min(5, totalPages)
                                    
                                    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2))
                                    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)
                                    
                                    // Adjust start page if we're near the end
                                    if (endPage - startPage + 1 < maxVisiblePages) {
                                        startPage = Math.max(0, endPage - maxVisiblePages + 1)
                                    }
                                    
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i)}
                                                disabled={isFetching}
                                                className={`px-3 py-2 text-sm font-medium border transition-colors ${
                                                    i === currentPage
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                                                } disabled:opacity-50 disabled:cursor-not-allowed rounded-md`}
                                            >
                                                {i + 1}
                                            </button>
                                        )
                                    }
                                    
                                    return pages
                                })()}
                                
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={!data?.nextPage || isFetching}
                                    className='px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                </div>


            </section>
        </div>
    )
}

const ShopPageWrapper = () => {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
            <ShopPage />
        </Suspense>
    )
}

export default ShopPageWrapper