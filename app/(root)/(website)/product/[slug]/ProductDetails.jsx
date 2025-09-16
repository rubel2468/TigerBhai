'use client'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { IoStar } from "react-icons/io5";
import { WEBSITE_CART, WEBSITE_CHECKOUT, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { decode, encode } from "entities";
import { HiMinus, HiPlus } from "react-icons/hi2";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { useDispatch, useSelector } from "react-redux";
import { addIntoCart } from "@/store/reducer/cartReducer";
import { showToast } from "@/lib/showToast";
import { Button } from "@/components/ui/button";
import loadingSvg from '@/public/assets/images/loading.svg'
import ProductReveiw from "@/components/Application/Website/ProductReveiw";
import WhatsAppChat from "@/components/Application/Website/WhatsAppChat";
import { FaYoutube } from "react-icons/fa";

// ShortDescription component with see more functionality
const ShortDescription = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowButton, setShouldShowButton] = useState(false);
    const textRef = useRef(null);

    useEffect(() => {
        if (textRef.current) {
            const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
            const maxHeight = lineHeight * 3; // 3 lines
            setShouldShowButton(textRef.current.scrollHeight > maxHeight);
        }
    }, [text]);

    return (
        <div className="shadow rounded border border-border bg-card">
            <div className="p-3 bg-muted border-b border-border">
                <h2 className="font-semibold text-2xl text-card-foreground">Short Description</h2>
            </div>
            <div className="p-3">
                <div className="text-muted-foreground">
                    <div 
                        ref={textRef}
                        className={`transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}
                        style={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: isExpanded ? 'unset' : 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {text}
                    </div>
                    {shouldShowButton && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-primary hover:text-primary/80 text-sm font-medium mt-2 transition-colors"
                        >
                            {isExpanded ? 'See less' : 'See more'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
const ProductDetails = ({ product, variant, colors, sizes, reviewCount, variantsByColor = [] }) => {

    const dispatch = useDispatch()
    const searchParams = useSearchParams()
    const selectedSize = searchParams?.get('size')
    const cartStore = useSelector(store => store.cartStore)
    
    const [activeThumb, setActiveThumb] = useState()
    const [activeIsVideo, setActiveIsVideo] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [touchStartX, setTouchStartX] = useState(null)
    const [touchEndX, setTouchEndX] = useState(null)
    const [qty, setQty] = useState(1)
    const [isAddedIntoCart, setIsAddedIntoCart] = useState(false)
    const [qtyByVariant, setQtyByVariant] = useState({})
    const [selectedSizeByColor, setSelectedSizeByColor] = useState({})
    const [qtyByColor, setQtyByColor] = useState({})
    const [isProductLoading, setIsProductLoading] = useState(false)
    const [allImages, setAllImages] = useState([])
    
    
    useEffect(() => {
        // Build gallery with images and YouTube videos
        const productImages = product?.media?.map(img => ({ src: img.filePath, kind: 'image' })) || []
        
        // Improved YouTube video ID extraction
        const extractYouTubeId = (url) => {
            if (!url) return ''
            try {
                const urlObj = new URL(url)
                // Handle youtu.be format: https://youtu.be/VIDEO_ID
                if (urlObj.hostname.includes('youtu.be')) {
                    return urlObj.pathname.replace('/', '')
                }
                // Handle youtube.com format: https://www.youtube.com/watch?v=VIDEO_ID
                if (urlObj.hostname.includes('youtube.com')) {
                    return urlObj.searchParams.get('v') || ''
                }
                // Handle embed format: https://www.youtube.com/embed/VIDEO_ID
                if (urlObj.pathname.includes('/embed/')) {
                    return urlObj.pathname.split('/embed/')[1]?.split('?')[0] || ''
                }
            } catch (error) {
                console.warn('Error parsing YouTube URL:', url, error)
            }
            return ''
        }

        const productVideos = (product?.videos || [])
            .filter(v => v.platform === 'youtube' && (v.videoId || v.url))
            .map(v => {
                const videoId = v.videoId || extractYouTubeId(v.url)
                return {
                    kind: 'video',
                    videoId: videoId,
                    url: v.url,
                    thumb: v.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : ''),
                }
            })
            .filter(v => v.videoId && v.videoId.length > 0)

        const gallery = [...productImages, ...productVideos]
        
        // Debug logging for video processing
        if (productVideos.length > 0) {
            console.log('Product videos found:', productVideos)
        }
        if (gallery.length > 0) {
            console.log('Gallery items:', gallery)
        }
        
        setAllImages(gallery)
        if (gallery.length > 0) {
            const first = gallery[0]
            setCurrentIndex(0)
            setActiveThumb(first.kind === 'image' ? first.src : first.videoId)
            setActiveIsVideo(first.kind === 'video')
        }
    }, [product, variant])

    useEffect(() => {
        if (cartStore.count > 0) {
            const existingProduct = cartStore.products.findIndex((cartProduct) => cartProduct.productId === product._id && cartProduct.variantId === variant._id)

            if (existingProduct >= 0) {
                setIsAddedIntoCart(true)
            } else {
                setIsAddedIntoCart(false)
            }
        }

        setIsProductLoading(false)

    }, [variant])

    const handleThumb = (item) => {
        if (item.kind === 'image') {
            setActiveThumb(item.src)
            setActiveIsVideo(false)
        } else {
            setActiveThumb(item.videoId)
            setActiveIsVideo(true)
        }
    }

    const goToIndex = (idx) => {
        if (!allImages.length) return
        const bounded = (idx + allImages.length) % allImages.length
        const item = allImages[bounded]
        setCurrentIndex(bounded)
        if (item.kind === 'image') {
            setActiveThumb(item.src)
            setActiveIsVideo(false)
        } else {
            setActiveThumb(item.videoId)
            setActiveIsVideo(true)
        }
    }

    const handleTouchStart = (e) => {
        setTouchStartX(e.changedTouches[0].clientX)
    }
    const handleTouchMove = (e) => {
        setTouchEndX(e.changedTouches[0].clientX)
    }
    const handleTouchEnd = () => {
        if (touchStartX === null || touchEndX === null) return
        const delta = touchEndX - touchStartX
        const threshold = 40
        if (Math.abs(delta) > threshold) {
            if (delta < 0) {
                goToIndex(currentIndex + 1)
            } else {
                goToIndex(currentIndex - 1)
            }
        }
        setTouchStartX(null)
        setTouchEndX(null)
    }

    const handleQty = (actionType) => {
        if (actionType === 'inc') {
            setQty(prev => prev + 1)
        } else {
            if (qty !== 1) {
                setQty(prev => prev - 1)
            }
        }
    }


    const handleAddToCart = () => {
        const cartProduct = {
            productId: product._id,
            variantId: variant._id,
            name: product.name,
            url: product.slug,
            size: variant.size,
            color: variant.color,
            mrp: variant.mrp,
            sellingPrice: variant.sellingPrice,
            media: variant?.media?.filePath,
            qty: qty
        }

        dispatch(addIntoCart(cartProduct))
        setIsAddedIntoCart(true)
        
        // Popup removed; action works directly
    }

    const handleBuyNow = () => {
        // Ensure item is in cart (optional quick add) then navigate to checkout
        if (!isAddedIntoCart) {
            const cartProduct = {
                productId: product._id,
                variantId: variant._id,
                name: product.name,
                url: product.slug,
                size: variant.size,
                color: variant.color,
                mrp: variant.mrp,
                sellingPrice: variant.sellingPrice,
                media: variant?.media?.filePath,
                qty: qty
            }
            dispatch(addIntoCart(cartProduct))
            setIsAddedIntoCart(true)
        }
        
        // Popup removed; redirect directly
        window.location.href = WEBSITE_CHECKOUT
    }

    const handleEntryQty = (variantId, actionType) => {
        setQtyByVariant(prev => {
            const current = prev[variantId] || 0
            if (actionType === 'inc') return { ...prev, [variantId]: current + 1 }
            const next = Math.max(0, current - 1)
            return { ...prev, [variantId]: next }
        })
    }

    const handleVariantSizeSelect = (color, size) => {
        setSelectedSizeByColor(prev => ({ ...prev, [color]: prev[color] === size ? undefined : size }))
    }

    const handleColorQty = (color, actionType) => {
        setQtyByColor(prev => {
            const current = prev[color] || 0
            if (actionType === 'inc') return { ...prev, [color]: current + 1 }
            const next = Math.max(0, current - 1)
            return { ...prev, [color]: next }
        })
    }

    const addVariantToCart = (color) => {
        const selectedSize = selectedSizeByColor[color]
        if (!selectedSize) {
            showToast('error', 'Please select a size.')
            return
        }
        const variantGroup = variantsByColor.find(v => v.color === color)
        const entry = variantGroup?.entries?.find(e => e.size === selectedSize)
        if (!entry) {
            showToast('error', 'Variant not found for selected size.')
            return
        }
        const desiredQty = qtyByColor[color] || 1
        if ((entry.stock ?? 0) <= 0) {
            showToast('error', 'Selected size is out of stock.')
            return
        }
        if (desiredQty > (entry.stock ?? 0)) {
            showToast('error', `Only ${entry.stock} left in stock for ${color} - ${entry.size}.`)
            return
        }
        const cartProduct = {
            productId: product._id,
            variantId: entry.variantId,
            name: product.name,
            url: product.slug,
            size: entry.size,
            color: color,
            mrp: entry.mrp,
            sellingPrice: entry.sellingPrice,
            media: entry?.media?.filePath,
            qty: desiredQty
        }
        dispatch(addIntoCart(cartProduct))
        
        // Popup removed; action works directly
    }

    const buyNowVariant = (color) => {
        addVariantToCart(color)
        window.location.href = WEBSITE_CHECKOUT
    }

    

    return (
        <div className="lg:px-32 px-4">

            {isProductLoading &&
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50">
                    <Image src={loadingSvg} width={80} height={80} alt="Loading" />
                </div>
            }

            <div className="my-10">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={WEBSITE_SHOP}>Product</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={WEBSITE_PRODUCT_DETAILS(product?.slug)}>{product?.name} </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="md:flex justify-between items-start lg:gap-10 gap-5 mb-20">
                <div className="md:w-1/2 xl:flex xl:justify-center xl:gap-5 md:sticky md:top-0">
                    <div className="xl:order-last xl:mb-0 mb-5 xl:w-[calc(100%-144px)]" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                        {activeIsVideo ? (
                            <div className="aspect-video w-full border rounded overflow-hidden">
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeThumb}?rel=0&modestbranding=1`}
                                    title="Product video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="h-full w-full"
                                    frameBorder="0"
                                />
                            </div>
                        ) : (
                            <Image
                                src={activeThumb || imgPlaceholder.src}
                                width={650}
                                height={650}
                                alt="product"
                                className="border rounded max-w-full"
                            />
                        )}
                    </div>
                    <div className="flex xl:flex-col items-center xl:gap-5 gap-3 xl:w-36 overflow-auto xl:pb-0 pb-2 max-h-[600px]">
                        {allImages.map((item, index) => (
                            <div key={index} className="md:max-w-full max-w-16 rounded cursor-pointer border" onClick={() => handleThumb(item)}>
                                {item.kind === 'image' ? (
                                    <Image
                                        src={item.src || imgPlaceholder.src}
                                        width={100}
                                        height={100}
                                        alt={`product thumbnail ${index + 1}`}
                                        className={`rounded ${(!activeIsVideo && item.src === activeThumb) ? 'ring-2 ring-primary' : ''}`}
                                    />
                                ) : (
                                    <div className={`relative w-[100px] h-[56px] overflow-hidden rounded ${activeIsVideo && item.videoId === activeThumb ? 'ring-2 ring-primary' : ''}`}>
                                        <Image 
                                            src={item.thumb || imgPlaceholder.src} 
                                            alt="video thumbnail" 
                                            width={100}
                                            height={56}
                                            className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute inset-0 grid place-items-center bg-black/30">
                                            <FaYoutube className="text-white text-2xl drop-shadow-lg" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:w-1/2 md:mt-0 mt-5">
                    <h1 className="text-3xl font-semibold mb-2 text-foreground">{product.name}</h1>
                    <div className="flex items-center gap-1 mb-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <IoStar key={i} className="text-secondary" />
                        ))}
                        <span className="text-sm ps-2 text-muted-foreground">({reviewCount} Reviews)</span>
                    </div>
                    {(() => {
                        const allEntries = Array.isArray(variantsByColor) ? variantsByColor.flatMap(g => g.entries || []) : []
                        const sellingPrices = allEntries.map(e => Number(e.sellingPrice)).filter(n => !Number.isNaN(n))
                        const mrpPrices = allEntries.map(e => Number(e.mrp)).filter(n => !Number.isNaN(n))
                        const minSelling = sellingPrices.length ? Math.min(...sellingPrices) : Number(variant?.sellingPrice ?? 0)
                        const maxSelling = sellingPrices.length ? Math.max(...sellingPrices) : Number(variant?.sellingPrice ?? 0)
                        const minMrp = mrpPrices.length ? Math.min(...mrpPrices) : Number(variant?.mrp ?? 0)
                        const maxMrp = mrpPrices.length ? Math.max(...mrpPrices) : Number(variant?.mrp ?? 0)
                        const hasDiscount = (minMrp && minMrp > minSelling) || (maxMrp && maxMrp > maxSelling)
                        return (
                            <div className="flex items-center gap-3 mb-3">
                                {hasDiscount && (
                                    <span className="text-lg text-muted-foreground line-through">
                                        BDT {minMrp.toLocaleString()}{maxMrp !== minMrp ? ` - ${maxMrp.toLocaleString()}` : ''}
                                    </span>
                                )}
                                <span className="text-2xl font-semibold text-foreground">
                                    BDT {minSelling.toLocaleString()}{maxSelling !== minSelling ? ` - ${maxSelling.toLocaleString()}` : ''}
                                </span>
                            </div>
                        )
                    })()}

                    {/* Short Description Section */}
                    {product.shortDescription && (
                        <div className="mb-2 md:mb-4">
                            <ShortDescription text={product.shortDescription} />
                        </div>
                    )}

                    {/* Offer Section - Show instead of top description */}
                    {product.offer && (
                        <div className="mb-2 md:mb-4 p-4 bg-secondary/20 border border-secondary/30 rounded-lg">
                            <h3 className="font-semibold text-secondary-foreground mb-2">Special Offer</h3>
                            <div dangerouslySetInnerHTML={{ __html: decode(product.offer) }}></div>
                        </div>
                    )}


                    {Array.isArray(variantsByColor) && variantsByColor.length > 0 && (
                        <div className="mt-3 md:mt-6 space-y-4">
                            {variantsByColor.map(group => {
                                const isMultiSize = (group.entries?.length || 0) > 1
                                const selectedSize = selectedSizeByColor[group.color]
                                return (
                                    <div key={group.color} className="border border-border rounded overflow-hidden bg-card">
                                        <div className="flex min-h-[120px]">
                                            {/* Variant image on the left taking full height */}
                                            {group.entries[0]?.media?.filePath && (
                                                <div className="w-24 flex-shrink-0">
                                                    <Image
                                                        src={group.entries[0].media.filePath}
                                                        width={96}
                                                        height={120}
                                                        alt={`${group.color} variant`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            
                                            {/* Content and right-side controls */}
                                            <div className="flex-1 p-3 flex flex-col gap-2">
                                                {/* Line 1: Title and Recommended */}
                                                <div className="flex items-start justify-between">
                                                    <div className="font-medium text-card-foreground">{group.color}</div>
                                                    {(() => {
                                                        const rec = (group.entries.find(e => e.recommendedFor)?.recommendedFor) || ''
                                                        return rec ? (
                                                            <div className="px-3 py-2 bg-blue-100/20 border border-blue-300/30 rounded-lg">
                                                                <h4 className="font-semibold text-blue-800 mb-1">Recommended</h4>
                                                                <div className="text-sm text-blue-700">{rec}</div>
                                                            </div>
                                                        ) : null
                                                    })()}
                                                </div>
                                                {!isMultiSize && (
                                                    <div className="space-y-2">
                                                        {group.entries.map(e => {
                                                            const isOut = (e.stock ?? 0) <= 0
                                                            const qtyVal = qtyByVariant[e.variantId] || 0
                                                            return (
                                                                <div key={e.variantId} className={`flex items-center justify-between gap-3 border border-border rounded-md px-3 py-2 ${isOut ? 'opacity-60' : ''}`}>
                                                                    <div className="flex flex-col gap-0.5">
                                                                        {/* Line 2: Size and Stock */}
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm text-card-foreground">Size: {e.size}</span>
                                                                            <span className="text-xs text-muted-foreground">Stock: {e.stock ?? 0}</span>
                                                                        </div>
                                                                        {/* Line 3: Prices */}
                                                                        <div className="flex items-center gap-2">
                                                                            {(Number(e.mrp) > Number(e.sellingPrice)) && (
                                                                                <span className="text-xs text-muted-foreground line-through">BDT {Number(e.mrp || 0).toLocaleString()}</span>
                                                                            )}
                                                                            <span className="text-sm font-semibold text-foreground">BDT {Number(e.sellingPrice || 0).toLocaleString()}</span>
                                                                            {(Number(e.mrp) > Number(e.sellingPrice)) && (
                                                                                <span className="text-xs text-green-600">({Math.round(((Number(e.mrp)-Number(e.sellingPrice))/Number(e.mrp))*100)}% off)</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <div className="flex items-center h-9 border border-border rounded-full bg-background">
                                                                            <button type="button" disabled={isOut} className={`h-9 w-9 flex justify-center items-center text-foreground hover:bg-accent ${isOut ? 'cursor-not-allowed' : ''}`} onClick={() => handleEntryQty(e.variantId, 'desc')}>
                                                                                <HiMinus />
                                                                            </button>
                                                                            <input type="text" value={qtyVal} className="w-12 text-center border-none outline-offset-0 bg-transparent text-foreground" readOnly />
                                                                            <button type="button" disabled={isOut} className={`h-9 w-9 flex justify-center items-center text-foreground hover:bg-accent ${isOut ? 'cursor-not-allowed' : ''}`} onClick={() => handleEntryQty(e.variantId, 'inc')}>
                                                                                <HiPlus />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                                {isMultiSize && (
                                                    <div className="flex items-center justify-between gap-3 border border-border rounded-md px-3 py-2">
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {group.entries.map(e => {
                                                                    const isSelected = selectedSize === e.size
                                                                    const isOut = (e.stock ?? 0) <= 0
                                                                    return (
                                                                        <button
                                                                            key={e.variantId}
                                                                            type="button"
                                                                            disabled={isOut}
                                                                            onClick={() => handleVariantSizeSelect(group.color, e.size)}
                                                                            className={`border border-border py-1 px-2 rounded text-sm ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent hover:text-accent-foreground'} ${isOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            {e.size}
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                            {/* Selected size summary */}
                                                            {selectedSize && (() => {
                                                                const entry = group.entries.find(en => en.size === selectedSize)
                                                                if (!entry) return null
                                                                return (
                                                                    <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                                                        <span>Stock: {entry.stock ?? 0}</span>
                                                                        {(Number(entry.mrp) > Number(entry.sellingPrice)) && (
                                                                            <span className="line-through">BDT {Number(entry.mrp || 0).toLocaleString()}</span>
                                                                        )}
                                                                        <span className="text-foreground font-medium">BDT {Number(entry.sellingPrice || 0).toLocaleString()}</span>
                                                                        {(Number(entry.mrp) > Number(entry.sellingPrice)) && (
                                                                            <span className="text-green-600">({Math.round(((Number(entry.mrp)-Number(entry.sellingPrice))/Number(entry.mrp))*100)}% off)</span>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })()}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <div className="flex items-center h-9 border border-border rounded-full bg-background">
                                                                <button type="button" disabled={!selectedSize} className={`h-9 w-9 flex justify-center items-center text-foreground hover:bg-accent ${!selectedSize ? 'cursor-not-allowed opacity-50' : ''}`} onClick={() => handleColorQty(group.color, 'desc')}>
                                                                    <HiMinus />
                                                                </button>
                                                                <input type="text" value={qtyByColor[group.color] || 0} className="w-12 text-center border-none outline-offset-0 bg-transparent text-foreground" readOnly />
                                                                <button type="button" disabled={!selectedSize} className={`h-9 w-9 flex justify-center items-center text-foreground hover:bg-accent ${!selectedSize ? 'cursor-not-allowed opacity-50' : ''}`} onClick={() => handleColorQty(group.color, 'inc')}>
                                                                    <HiPlus />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {(() => {
                                const selections = []
                                variantsByColor.forEach(v => {
                                    const isMultiSize = (v.entries?.length || 0) > 1
                                    if (isMultiSize) {
                                        const selSize = selectedSizeByColor[v.color]
                                        const qty = qtyByColor[v.color] || 0
                                        if (selSize && qty > 0) {
                                            const entry = v.entries.find(e => e.size === selSize)
                                            if (entry) {
                                                selections.push({ color: v.color, size: entry.size, qty, price: entry.sellingPrice, stock: entry.stock ?? 0, variantId: entry.variantId, media: entry?.media?.filePath, mrp: entry.mrp })
                                            }
                                        }
                                    } else {
                                        v.entries.forEach(e => {
                                            const q = qtyByVariant[e.variantId] || 0
                                            if (q > 0) {
                                                selections.push({ color: v.color, size: e.size, qty: q, price: e.sellingPrice, stock: e.stock ?? 0, variantId: e.variantId, media: e?.media?.filePath, mrp: e.mrp })
                                            }
                                        })
                                    }
                                })
                                const totalQty = selections.reduce((sum, it) => sum + it.qty, 0)
                                const totalPrice = selections.reduce((sum, it) => sum + (it.price * it.qty), 0)
                                return (
                                    <>
                                        {selections.length > 0 && (
                                            <div className="text-sm text-muted-foreground border-t border-border pt-3">
                                                Selected: {selections.map((it, idx) => (
                                                    <span key={`${it.color}-${it.size}`}>
                                                        {it.color} - {it.size} (qty {it.qty}, stock {it.stock}){idx < selections.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                                <span className="ml-2 font-medium text-foreground">| Total: {totalQty} item(s), BDT {Number(totalPrice).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                            <Button 
                                                variant="secondary"
                                                className={`w-full rounded-full py-5 text-md cursor-pointer ${selections.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                type="button" 
                                                disabled={selections.length === 0}
                                                onClick={() => {
                                                    // Add all selected variants to cart
                                                    selections.forEach(sel => {
                                                        const cartProduct = {
                                                            productId: product._id,
                                                            variantId: sel.variantId,
                                                            name: product.name,
                                                            url: product.slug,
                                                            size: sel.size,
                                                            color: sel.color,
                                                            mrp: sel.mrp,
                                                            sellingPrice: sel.price,
                                                            media: sel.media,
                                                            qty: sel.qty
                                                        }
                                                        dispatch(addIntoCart(cartProduct))
                                                    })
                                                }}
                                            >
                                                Add Selected To Cart
                                            </Button>
                                            <Button 
                                                variant="destructive"
                                                className={`w-full rounded-full py-5 text-md cursor-pointer ${selections.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                type="button" 
                                                disabled={selections.length === 0}
                                                onClick={() => {
                                                    // Add all selected variants to cart
                                                    selections.forEach(sel => {
                                                        const cartProduct = {
                                                            productId: product._id,
                                                            variantId: sel.variantId,
                                                            name: product.name,
                                                            url: product.slug,
                                                            size: sel.size,
                                                            color: sel.color,
                                                            mrp: sel.mrp,
                                                            sellingPrice: sel.price,
                                                            media: sel.media,
                                                            qty: sel.qty
                                                        }
                                                        dispatch(addIntoCart(cartProduct))
                                                    })
                                                    // Redirect directly to checkout
                                                    window.location.href = WEBSITE_CHECKOUT
                                                }}
                                            >
                                                Order Now (অর্ডার করুন)
                                            </Button>
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    )}

                    {/* WhatsApp Chat Button - Bottom of buy now and add to cart buttons */}
                    <div className="mt-4">
                        <WhatsAppChat 
                            productName={product.name}
                            whatsappLink={product.whatsappLink}
                            className="w-full rounded-full py-5 text-md"
                        />
                    </div>

                </div>
            </div>


            <div className="mb-10">
                <div className="shadow rounded border border-border bg-card">
                    <div className="p-3 bg-muted border-b border-border">
                        <h2 className="font-semibold text-2xl text-card-foreground">Product Description</h2>
                    </div>
                    <div className="p-3">
                        <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: decode(product.description) }}></div>
                    </div>
                </div>
            </div>

            {/* Company Details Section - Show before reviews */}
            {product.companyDetails && (
                <div className="mb-10">
                    <div className="shadow rounded border border-border bg-card">
                        <div className="p-3 bg-muted border-b border-border">
                            <h2 className="font-semibold text-2xl text-card-foreground">Company Details</h2>
                        </div>
                        <div className="p-3">
                            <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: decode(product.companyDetails) }}></div>
                        </div>
                    </div>
                </div>
            )}
            
            <ProductReveiw productId={product._id} />

            

        </div>
    )
}

export default ProductDetails