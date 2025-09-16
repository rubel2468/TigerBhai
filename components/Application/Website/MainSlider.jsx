'use client'
import React, { useState, useEffect, memo } from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useRef } from 'react'
import Image from 'next/image';
import Link from 'next/link';
// Optimized icon imports
import { LuChevronRight, LuChevronLeft } from "react-icons/lu";
import { Button } from '@/components/ui/button';

const WelcomeAnimatedHeading = memo(() => {
    const [isVisible, setIsVisible] = useState(false)
    useEffect(() => {
        const id = requestAnimationFrame(() => setIsVisible(true))
        return () => cancelAnimationFrame(id)
    }, [])
    const baseSpanClass = "block transition-opacity duration-700";
    return (
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-2 leading-tight">
            <span
                className={`${baseSpanClass} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: '0ms', textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}
            >
                Welcome
            </span>
            <span
                className={`${baseSpanClass} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: '300ms', textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}
            >
                To
            </span>
            <span
                className={`${baseSpanClass} ${isVisible ? 'opacity-100' : 'opacity-0'} text-primary`}
                style={{ transitionDelay: '600ms', textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)' }}
            >
                Tiger Bhai
            </span>
        </h1>
    )
})

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
    const [currentSlide, setCurrentSlide] = useState(0)
    const sliderRef = useRef(null)

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
        infinite: true, // Always allow infinite scrolling
        speed: 300, // Faster transitions
        autoplay: true, // Always enable autoplay
        autoplaySpeed: 3000, // 3 seconds as requested
        pauseOnHover: false,
        pauseOnFocus: false,
        pauseOnDotsHover: false,
        nextArrow: <ArrowNext />,
        prevArrow: <ArrowPrev />,
        lazyLoad: 'ondemand', // Lazy load images
        slidesToShow: 1,
        slidesToScroll: 1,
        afterChange: (index) => setCurrentSlide(index),
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    dots: false,
                    arrows: false,
                    autoplay: true,
                    pauseOnHover: false,
                    pauseOnFocus: false,
                    pauseOnDotsHover: false,
                    speed: 200
                }
            },
            {
                breakpoint: 480,
                settings: {
                    dots: false,
                    arrows: false,
                    autoplay: true,
                    pauseOnHover: false,
                    pauseOnFocus: false,
                    pauseOnDotsHover: false,
                    speed: 150
                }
            }
        ]
    }

    // Ensure autoplay resumes if the tab regains visibility or any accidental pause occurs
    useEffect(() => {
        const handleVisibility = () => {
            if (!document.hidden && sliderRef.current && sliderRef.current.slickPlay) {
                sliderRef.current.slickPlay()
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)
        return () => document.removeEventListener('visibilitychange', handleVisibility)
    }, [])

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
                    <WelcomeAnimatedHeading key={`fallback-${currentSlide}`} />
                    <p className="text-muted-foreground text-lg">No carousel slides available at the moment</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full relative">
            <Slider ref={sliderRef} {...settings}>
                {carouselData.map((slide, index) => (
                    <div key={slide._id} className="w-full relative">
                        <div className="relative">
                            <Image 
                                src={slide.image.url} 
                                width={1920}
                                height={1080}
                                alt={slide.title || 'Tiger Bhai Carousel'} 
                                className="w-full h-auto object-contain"
                                priority={index === 0}
                                fetchPriority={index === 0 ? 'high' : 'auto'}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                                quality={index === 0 ? 80 : 70}
                            />
                            
                            {/* Overlay Content */}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="w-full px-6 lg:px-32 flex flex-col items-center text-center">
                                    {slide.title ? (
                                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                                            {slide.title}
                                        </h1>
                                    ) : (
                                        <WelcomeAnimatedHeading key={`slide-${currentSlide}`} />
                                    )}
                                    {slide.description && (
                                        <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
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
                ))}
            </Slider>
        </div>
    )
}

export default memo(MainSlider)