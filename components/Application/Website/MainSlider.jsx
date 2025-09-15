'use client'
import React, { useState, useEffect, memo } from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Image from 'next/image';
import Link from 'next/link';
// Optimized icon imports
import { LuChevronRight, LuChevronLeft } from "react-icons/lu";
import { Button } from '@/components/ui/button';

const ArrowNext = memo((props) => {
    const { onClick } = props
    return (
        <button onClick={onClick} type='button' className='w-14 h-14 flex justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-background hover:bg-accent right-10 shadow-lg hover:shadow-xl transition-all duration-300' >
            <LuChevronRight size={25} className='text-primary' />
        </button>
    )
})

const ArrowPrev = memo((props) => {
    const { onClick } = props
    return (
        <button onClick={onClick} type='button' className='w-14 h-14 flex justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-background hover:bg-accent left-10 shadow-lg hover:shadow-xl transition-all duration-300' >
            <LuChevronLeft size={25} className='text-primary' />
        </button>
    )
})

const MainSlider = ({ initialData }) => {
    const [carouselData, setCarouselData] = useState(initialData?.data || [])
    const [loading, setLoading] = useState(!initialData?.success)

    useEffect(() => {
        // Only fetch if no initial data provided
        if (!initialData?.success) {
            const fetchCarouselData = async () => {
                try {
                    const response = await fetch('/api/carousel')
                    const result = await response.json()
                    
                    if (result.success) {
                        setCarouselData(result.data)
                    }
                } catch (error) {
                    console.error('Failed to fetch carousel data:', error)
                } finally {
                    setLoading(false)
                }
            }

            fetchCarouselData()
        } else {
            setLoading(false)
        }
    }, [initialData])

    const settings = {
        dots: true,
        infinite: carouselData.length > 1,
        speed: 300, // Faster transitions
        autoplay: carouselData.length > 1,
        autoplaySpeed: 5000, // Slower autoplay
        nextArrow: <ArrowNext />,
        prevArrow: <ArrowPrev />,
        lazyLoad: 'ondemand', // Lazy load images
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    dots: false,
                    arrows: false,
                    autoplay: false, // Disable autoplay on mobile
                    speed: 200
                }
            },
            {
                breakpoint: 480,
                settings: {
                    dots: false,
                    arrows: false,
                    autoplay: false,
                    speed: 150
                }
            }
        ]
    }

    if (loading) {
        return (
            <div className="w-full relative flex items-center justify-center bg-background py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground text-sm">Loading...</p>
                </div>
            </div>
        )
    }

    if (carouselData.length === 0) {
        return (
            <div className="w-full relative flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 py-20">
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-2 leading-tight">
                        <span className="block" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 8px rgba(0,0,0,0.2)' }}>
                            Welcome
                        </span>
                        <span className="block" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 8px rgba(0,0,0,0.2)' }}>
                            To
                        </span>
                        <span className="block text-primary" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 8px rgba(0,0,0,0.2)' }}>
                            Tiger Bhai
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-lg">No carousel slides available at the moment</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full relative">
            <Slider {...settings}>
                {carouselData.map((slide, index) => (
                    <div key={slide._id} className="w-full relative">
                        <div className="relative">
                            <Image 
                                src={slide.image.url} 
                                width={1920}
                                height={1080}
                                alt={slide.title} 
                                className="w-full h-auto object-contain"
                                priority={index === 0}
                                fetchPriority={index === 0 ? 'high' : 'auto'}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                                quality={index === 0 ? 80 : 70}
                            />
                            
                            {/* Overlay Content */}
                            <div className="absolute inset-0 bg-black/30 flex items-center">
                                <div className="container mx-auto px-6 lg:px-32">
                                    <div className="max-w-2xl">
                                        {slide.title ? (
                                            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                                                {slide.title}
                                            </h1>
                                        ) : (
                                            <div className="text-center lg:text-left">
                                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-2 leading-tight">
                                                    <span className="block" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}>
                                                        Welcome
                                                    </span>
                                                    <span className="block" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}>
                                                        To
                                                    </span>
                                                    <span className="block text-primary" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}>
                                                        Tiger Bhai
                                                    </span>
                                                </h1>
                                            </div>
                                        )}
                                        {slide.description && (
                                            <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
                                                {slide.description}
                                            </p>
                                        )}
                                        {slide.buttonUrl && (
                                            <Link href={slide.buttonUrl}>
                                                <Button 
                                                    variant="default"
                                                    size="lg" 
                                                    className="px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                                >
                                                    {slide.buttonText}
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    )
}

export default memo(MainSlider)