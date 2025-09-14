'use client'
import React, { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useFetch from '@/hooks/useFetch'
import { useRouter } from 'next/navigation'

const MainCategoryGrid = ({ initialData }) => {
    const { data: categoryData, loading } = useFetch('/api/category/get-category', 'GET', {}, initialData)
    const router = useRouter()

    const handleCategoryClick = (category) => {
        // Navigate to the category page - instant navigation
        router.push(`/category/${category.slug}`, { scroll: false })
    }


    if (loading) {
        return (
            <section className='lg:px-32 px-4 py-20'>
                <div className='text-center'>
                    <h2 className='text-3xl font-bold mb-10'>Shop by Category</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {[1, 2].map((item) => (
                            <div key={item} className='bg-gray-200 animate-pulse rounded-lg h-48'></div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (!categoryData || !categoryData.success || !categoryData.data || !categoryData.data.mainCategories || categoryData.data.mainCategories.length === 0) {
        return null
    }

    return (
        <>
            <section className='lg:px-32 px-4 py-20'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl font-bold mb-4'>Shop by Category</h2>
                    <p className='text-gray-600'>Discover our wide range of products</p>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                    {categoryData.data.mainCategories.map((category) => (
                        <div 
                            key={category._id} 
                            onClick={() => handleCategoryClick(category)}
                            className='group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1'
                        >
                            <div 
                                className='w-full bg-gradient-to-br from-gray-50 to-gray-100'
                                style={{ 
                                    aspectRatio: '16/9'
                                }}
                            >
                                {category.image ? (
                                    <>
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className='object-cover transition-transform duration-300 group-hover:scale-105'
                                            loading="lazy"
                                            sizes="(max-width: 768px) 50vw, 50vw"
                                        />

                                        {/* Modern gradient overlay */}
                                        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300'></div>

                                        {/* Category name with modern styling */}
                                        <div className='absolute bottom-0 left-0 right-0 p-6'>
                                            <h3 className='text-white text-xl font-bold mb-2 drop-shadow-lg'>{category.name}</h3>
                                            <div className='flex items-center text-white/90 text-sm font-medium'>
                                                <span>Explore Collection</span>
                                                <svg className='w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Hover effect overlay */}
                                        <div className='absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                    </>
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center'>
                                        <div className='text-center'>
                                            <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto'>
                                                <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                                                </svg>
                                            </div>
                                            <h3 className='text-gray-700 text-lg font-bold mb-2'>{category.name}</h3>
                                            <p className='text-gray-500 text-sm'>No image available</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}

export default memo(MainCategoryGrid)
