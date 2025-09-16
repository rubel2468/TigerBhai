'use client'
import React, { useState, useEffect, memo, useMemo } from 'react'
import Image from 'next/image'
// Optimized icon imports
import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5"
import { BsChatQuote, BsArrowLeft, BsArrowRight } from "react-icons/bs"
import userIcon from '@/public/assets/images/user.png'
import { BLUR_DATA_URL, getImageSizes, getImageQuality } from '@/lib/imageUtils'

const CustomerReviews = ({ initialData }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [reviews, setReviews] = useState(initialData?.data?.reviews || [])
    const [reviewStats, setReviewStats] = useState(initialData?.data?.stats || {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    })
    const [loading, setLoading] = useState(!initialData?.success)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Only fetch if no initial data provided
        if (!initialData?.success) {
            const fetchReviews = async () => {
                try {
                    setLoading(true)
                    const response = await fetch('/api/review/homepage?limit=10')
                    const data = await response.json()
                    
                    if (data.success) {
                        setReviews(data.data.reviews)
                        setReviewStats(data.data.stats)
                    } else {
                        setError('Failed to load reviews')
                    }
                } catch (err) {
                    console.error('Error fetching reviews:', err)
                    setError('Failed to load reviews')
                } finally {
                    setLoading(false)
                }
            }

            fetchReviews()
        } else {
            setLoading(false)
        }
    }, [initialData])

    const nextReview = () => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }

    const prevReview = () => {
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
    }

    const renderStars = useMemo(() => (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0

        for (let i = 0; i < fullStars; i++) {
            stars.push(<IoStar key={i} className="text-yellow-400" size={20} />)
        }

        if (hasHalfStar) {
            stars.push(<IoStarHalf key="half" className="text-yellow-400" size={20} />)
        }

        const emptyStars = 5 - Math.ceil(rating)
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<IoStarOutline key={`empty-${i}`} className="text-gray-300" size={20} />)
        }

        return stars
    }, [])

    const getRatingPercentage = useMemo(() => (rating) => {
        return (reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100
    }, [reviewStats])

    if (loading) {
        return (
            <section className='lg:px-32 px-4 py-20 bg-gray-50'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
                    <p className='mt-4 text-gray-600'>Loading reviews...</p>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className='lg:px-32 px-4 py-20 bg-gray-50'>
                <div className='text-center'>
                    <p className='text-red-600 mb-4'>{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
                    >
                        Try Again
                    </button>
                </div>
            </section>
        )
    }

    if (!reviews || reviews.length === 0) {
        return (
            <section className='lg:px-32 px-4 py-20 bg-gray-50'>
                <div className='text-center'>
                    <p className='text-gray-600'>No reviews available at the moment.</p>
                </div>
            </section>
        )
    }

    return (
        <section className='lg:px-32 px-4 py-20 bg-gray-50'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='text-center mb-16'>
                    <h2 className='text-2xl md:text-4xl font-bold text-gray-900 mb-4'>
                        What Our Customers Say
                    </h2>
                    <p className='text-lg md:text-xl text-gray-600 max-w-2xl mx-auto'>
                        Don't just take our word for it. Here's what our satisfied customers have to say about their shopping experience.
                    </p>
                </div>

                <div className='grid lg:grid-cols-3 gap-12'>
                    {/* Review Statistics - Hidden on mobile to reduce LCP */}
                    <div className='lg:col-span-1 hidden lg:block'>
                        <div className='bg-white rounded-2xl p-8 shadow-lg sticky top-8'>
                            <div className='text-center mb-8'>
                                <div className='flex items-center justify-center mb-4'>
                                    <div className='flex items-center'>
                                        {renderStars(reviewStats.averageRating)}
                                    </div>
                                    <span className='ml-2 text-2xl font-bold text-gray-900'>
                                        {reviewStats.averageRating}
                                    </span>
                                </div>
                                <p className='text-gray-600'>
                                    Based on {reviewStats.totalReviews.toLocaleString()} reviews
                                </p>
                            </div>

                            {/* Rating Distribution */}
                            <div className='space-y-3'>
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className='flex items-center gap-3'>
                                        <span className='text-sm font-medium w-8'>{rating}</span>
                                        <IoStar className='text-yellow-400' size={16} />
                                        <div className='flex-1 bg-gray-200 rounded-full h-2'>
                                            <div 
                                                className='bg-yellow-400 h-2 rounded-full transition-all duration-500'
                                                style={{ width: `${getRatingPercentage(rating)}%` }}
                                            ></div>
                                        </div>
                                        <span className='text-sm text-gray-600 w-12 text-right'>
                                            {reviewStats.ratingDistribution[rating]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Featured Review */}
                    <div className='lg:col-span-2 col-span-1'>
                        <div className='relative'>
                            <div
                                key={currentIndex}
                                className='bg-white rounded-2xl p-8 shadow-lg relative overflow-hidden transition-opacity duration-300'
                            >
                                    {/* Quote Icon */}
                                    <div className='absolute top-6 right-6 text-gray-100'>
                                        <BsChatQuote size={40} />
                                    </div>

                                    {/* Review Content */}
                                    <div className='relative z-10'>
                                        <div className='flex items-center mb-6'>
                                            <div className='flex items-center'>
                                                {renderStars(reviews[currentIndex]?.rating)}
                                            </div>
                                            {reviews[currentIndex]?.verified && (
                                                <span className='ml-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full'>
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>

                                        <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                                            {reviews[currentIndex]?.title}
                                        </h3>

                                        <p className='text-gray-700 text-lg leading-relaxed mb-6'>
                                            "{reviews[currentIndex]?.review}"
                                        </p>

                                        {/* Customer Info */}
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-4'>
                                        <div className='w-12 h-12 rounded-full overflow-hidden bg-gray-200'>
                                            <Image
                                                src={reviews[currentIndex]?.avatar?.url || userIcon}
                                                width={48}
                                                height={48}
                                                alt={reviews[currentIndex]?.reviewedBy}
                                                className='w-full h-full object-cover'
                                                loading="lazy"
                                                quality={getImageQuality(false)}
                                                sizes={getImageSizes('thumbnail')}
                                                placeholder="blur"
                                                blurDataURL={BLUR_DATA_URL}
                                            />
                                        </div>
                                                <div>
                                                    <h4 className='font-semibold text-gray-900'>
                                                        {reviews[currentIndex]?.reviewedBy}
                                                    </h4>
                                                    <p className='text-sm text-gray-600'>
                                                        {new Date(reviews[currentIndex]?.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <p className='text-sm text-gray-500'>Product:</p>
                                                <p className='font-medium text-gray-900'>
                                                    {reviews[currentIndex]?.productName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            {/* Navigation */}
                            <div className='flex items-center justify-between mt-8'>
                                <button
                                    onClick={prevReview}
                                    className='flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50'
                                >
                                    <BsArrowLeft size={20} />
                                    <span className='font-medium'>Previous</span>
                                </button>

                                <div className='flex items-center gap-2'>
                                    {reviews.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                                index === currentIndex 
                                                    ? 'bg-primary scale-125' 
                                                    : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={nextReview}
                                    className='flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50'
                                >
                                    <span className='font-medium'>Next</span>
                                    <BsArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className='mt-16 text-center'>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
                        <div className='flex flex-col items-center'>
                            <div className='text-3xl font-bold text-primary mb-2'>
                                {reviewStats.totalReviews.toLocaleString()}+
                            </div>
                            <p className='text-gray-600'>Happy Customers</p>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className='text-3xl font-bold text-primary mb-2'>
                                {reviewStats.averageRating}/5
                            </div>
                            <p className='text-gray-600'>Average Rating</p>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className='text-3xl font-bold text-primary mb-2'>98%</div>
                            <p className='text-gray-600'>Satisfaction Rate</p>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className='text-3xl font-bold text-primary mb-2'>24/7</div>
                            <p className='text-gray-600'>Customer Support</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default memo(CustomerReviews)
