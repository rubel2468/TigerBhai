'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useFetch from '@/hooks/useFetch'
import Link from 'next/link'
import Image from 'next/image'

export default function CategoryPage() {
    const params = useParams()
    const router = useRouter()
    const [category, setCategory] = useState(null)
    const [subcategories, setSubcategories] = useState([])
    const [subcategoryProducts, setSubcategoryProducts] = useState({})
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
            
            // Fetch products for each subcategory
            const fetchSubcategoryProducts = async () => {
                const productsMap = {}
                for (const subcategory of subcategoryData.data) {
                    try {
                        const response = await fetch(`/api/category/products/${subcategory.slug}?limit=4`)
                        const data = await response.json()
                        if (data.success) {
                            productsMap[subcategory.slug] = data.data.products
                        }
                    } catch (error) {
                        console.error(`Error fetching products for ${subcategory.slug}:`, error)
                        productsMap[subcategory.slug] = []
                    }
                }
                setSubcategoryProducts(productsMap)
                setLoading(false)
            }
            
            fetchSubcategoryProducts()
        }
    }, [subcategoryData])

    const handleSubcategoryClick = (subcategory) => {
        // Navigate to products page with subcategory filter - instant navigation
        router.push(`/shop?category=${subcategory.slug}`, { scroll: false })
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Background Image with Parallax Effect */}
                {category.image && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover scale-105 group-hover:scale-110 transition-transform duration-300"
                            priority
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
                    </div>
                )}
                
                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-500"></div>

                {/* Content */}
                <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                    <div className="mb-6">
                        <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                            Category
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                            {category.name}
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        Discover our premium collection of {category.name.toLowerCase()} products, 
                        carefully curated for quality and performance
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <button 
                            onClick={() => document.getElementById('subcategories').scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Explore Products
                        </button>
                        <Link 
                            href="/shop"
                            className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                        >
                            Shop All
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
                    </div>
                </div>
            </section>

            {/* Subcategory Products Section */}
            {subcategories.length > 0 && (
                <section className="py-20 px-4 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
                                Featured Products
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                                Products by <span className="text-green-600">Category</span>
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Browse our curated selection of {category.name.toLowerCase()} products across different subcategories
                            </p>
                        </div>

                        {/* Subcategory Products */}
                        {subcategories.map((subcategory) => {
                            const products = subcategoryProducts[subcategory.slug] || []
                            if (products.length === 0) return null

                            return (
                                <div key={subcategory._id} className="mb-16">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                {subcategory.name}
                                            </h3>
                                            <p className="text-gray-600">
                                                {products.length} products available
                                            </p>
                                        </div>
                                        <Link 
                                            href={`/shop?category=${subcategory.slug}`}
                                            className="flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                        >
                                            View All
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-6">
                                        {products.map((product) => (
                                            <Link 
                                                key={product._id} 
                                                href={`/product/${product.slug}`}
                                                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
                                            >
                                                {/* Product Image */}
                                                <div className="relative aspect-square overflow-hidden">
                                                    {product.media && product.media.length > 0 ? (
                                                        <Image
                                                            src={product.media[0].filePath}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Discount Badge */}
                                                    {product.discountPercentage > 0 && (
                                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                                            -{product.discountPercentage}%
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="p-3">
                                                    <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {product.name}
                                                    </h4>
                                                    
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg font-bold text-gray-900">
                                                            ₹{product.sellingPrice}
                                                        </span>
                                                        {product.mrp > product.sellingPrice && (
                                                            <span className="text-sm text-gray-500 line-through">
                                                                ₹{product.mrp}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {product.vendor && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            by {product.vendor.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Subcategories Section */}
            <section id="subcategories" className="py-20 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
                            Product Categories
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                            Shop by <span className="text-blue-600">Subcategory</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Explore our carefully organized {category.name.toLowerCase()} subcategories 
                            to find exactly what you're looking for
                        </p>
                    </div>
                    
                    {subcategories.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                            {subcategories.map((subcategory, index) => (
                                <div 
                                    key={subcategory._id} 
                                    onClick={() => handleSubcategoryClick(subcategory)}
                                    className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Image Container - 1:1 Aspect Ratio */}
                                    <div className="relative aspect-square overflow-hidden">
                                        {subcategory.image ? (
                                            <>
                                                <Image
                                                    src={subcategory.image}
                                                    alt={subcategory.name}
                                                    fill
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                                />
                                                {/* Subtle overlay */}
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Hover Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Minimal Bottom Bar */}
                                    <div className="p-3 bg-white">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300 text-center">
                                            {subcategory.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 text-center">
                                            {subcategoryProducts[subcategory.slug]?.length || 0} products
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="max-w-md mx-auto">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-8 mx-auto">
                                    <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Subcategories Yet</h3>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    We're working on adding subcategories to this section. 
                                    In the meantime, explore our full product catalog.
                                </p>
                                <Link 
                                    href="/shop" 
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    <span>Browse All Products</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
