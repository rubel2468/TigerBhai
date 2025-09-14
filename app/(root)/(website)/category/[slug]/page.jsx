'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useFetch from '@/hooks/useFetch'
import Link from 'next/link'

export default function CategoryPage() {
    const params = useParams()
    const router = useRouter()
    const [category, setCategory] = useState(null)
    const [subcategories, setSubcategories] = useState([])
    const [loading, setLoading] = useState(true)

    // Fetch category details
    const { data: categoryData } = useFetch(`/api/category/get-category`)
    
    // Fetch subcategories
    const { data: subcategoryData } = useFetch(`/api/category/by-slug/${params.slug}`)

    useEffect(() => {
        if (categoryData && categoryData.success) {
            const foundCategory = categoryData.data.mainCategories.find(
                cat => cat.slug === params.slug
            )
            setCategory(foundCategory)
        }
    }, [categoryData, params.slug])

    useEffect(() => {
        if (subcategoryData && subcategoryData.success) {
            setSubcategories(subcategoryData.data)
            setLoading(false)
        }
    }, [subcategoryData])

    const handleSubcategoryClick = (subcategory) => {
        // Navigate to products page with subcategory filter
        router.push(`/shop?category=${subcategory.slug}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-96 bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 text-center text-white">
                    <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
                        {category.name}
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                        Discover our amazing collection of {category.name.toLowerCase()} products
                    </p>
                </div>
                
                {/* Background Image */}
                {category.image && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover opacity-30"
                        />
                    </div>
                )}
            </section>

            {/* Subcategories Section */}
            <section className="lg:px-32 px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Shop by Subcategory</h2>
                    <p className="text-gray-600">Explore our {category.name.toLowerCase()} subcategories</p>
                </div>
                
                {subcategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {subcategories.map((subcategory) => (
                            <div 
                                key={subcategory._id} 
                                onClick={() => handleSubcategoryClick(subcategory)}
                                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                            >
                                <div 
                                    className="w-full bg-gradient-to-br from-gray-50 to-gray-100"
                                    style={{ 
                                        aspectRatio: '16/9'
                                    }}
                                >
                                    {subcategory.image ? (
                                        <>
                                            <img
                                                src={subcategory.image}
                                                alt={subcategory.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onLoad={() => {
                                                    console.log('Subcategory image loaded successfully:', subcategory.name)
                                                }}
                                                onError={(e) => {
                                                    console.error('Subcategory image failed to load:', subcategory.name, e)
                                                }}
                                            />

                                            {/* Modern gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                                            {/* Subcategory name with modern styling */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                                <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">{subcategory.name}</h3>
                                                <div className="flex items-center text-white/90 text-sm font-medium">
                                                    <span>View Products</span>
                                                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Hover effect overlay */}
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-gray-700 text-lg font-bold mb-2">{subcategory.name}</h3>
                                                <p className="text-gray-500 text-sm">No image available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Subcategories Found</h3>
                        <p className="text-gray-500 mb-6">This category doesn't have any subcategories yet.</p>
                        <Link 
                            href="/shop" 
                            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                        >
                            <span>Browse All Products</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                )}
            </section>
        </div>
    )
}
