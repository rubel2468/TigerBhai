import React from 'react'

const ProductSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb Skeleton */}
            <div className="lg:px-32 px-5 py-4">
                <div className="flex items-center space-x-2">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
            </div>

            <div className="lg:px-32 px-5 py-10">
                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Image Gallery Skeleton */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                        
                        {/* Thumbnail Images */}
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info Skeleton */}
                    <div className="space-y-6">
                        {/* Product Title */}
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                            <div className="flex space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
                            <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
                        </div>

                        {/* WhatsApp Button */}
                        <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                </div>

                {/* Product Details Tabs Skeleton */}
                <div className="mt-16 space-y-6">
                    {/* Tab Headers */}
                    <div className="flex space-x-6 border-b">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    </div>
                </div>

                {/* Reviews Section Skeleton */}
                <div className="mt-16 space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                    
                    {/* Review Cards */}
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                    <div className="space-y-1">
                                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductSkeleton
