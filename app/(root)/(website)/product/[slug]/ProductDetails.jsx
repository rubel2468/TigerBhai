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
import { useEffect, useState } from "react"
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
import CartConfirmationPopup from "@/components/Application/Website/CartConfirmationPopup";
import WhatsAppChat from "@/components/Application/Website/WhatsAppChat";
const ProductDetails = ({ product, variant, colors, sizes, reviewCount, variantsByColor = [] }) => {

    const dispatch = useDispatch()
    const searchParams = useSearchParams()
    const selectedSize = searchParams?.get('size')
    const cartStore = useSelector(store => store.cartStore)
    
    const [activeThumb, setActiveThumb] = useState()
    const [qty, setQty] = useState(1)
    const [isAddedIntoCart, setIsAddedIntoCart] = useState(false)
    const [selectedSizeByColor, setSelectedSizeByColor] = useState({})
    const [qtyByColor, setQtyByColor] = useState({})
    const [isProductLoading, setIsProductLoading] = useState(false)
    const [allImages, setAllImages] = useState([])
    const [showCartPopup, setShowCartPopup] = useState(false)
    const [popupData, setPopupData] = useState(null)
    
    useEffect(() => {
        // Show only product images in thumbnails
        const productImages = product?.media?.map(img => ({
            src: img.filePath,
            type: 'product'
        })) || []
        
        setAllImages(productImages)
        
        // Set initial active thumbnail to first product image
        if (productImages.length > 0) {
            setActiveThumb(productImages[0].src)
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

    const handleThumb = (thumbUrl) => {
        setActiveThumb(thumbUrl)
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
        
        // Show popup with selected item
        setPopupData({
            selectedItems: [{
                name: product.name,
                color: variant.color,
                size: variant.size,
                qty: qty,
                price: variant.sellingPrice,
                media: variant?.media?.filePath,
                stock: variant.stock || 0
            }],
            totalQty: qty,
            totalPrice: variant.sellingPrice * qty,
            actionType: 'add'
        })
        setShowCartPopup(true)
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
        
        // Show popup with selected item
        setPopupData({
            selectedItems: [{
                name: product.name,
                color: variant.color,
                size: variant.size,
                qty: qty,
                price: variant.sellingPrice,
                media: variant?.media?.filePath,
                stock: variant.stock || 0
            }],
            totalQty: qty,
            totalPrice: variant.sellingPrice * qty,
            actionType: 'buy'
        })
        setShowCartPopup(true)
    }

    const handleVariantSizeSelect = (color, size) => {
        setSelectedSizeByColor(prev => {
            const current = prev[color]
            if (current === size) {
                const { [color]: _omit, ...rest } = prev
                return rest
            }
            return { ...prev, [color]: size }
        })
    }

    const handleVariantQty = (color, actionType) => {
        setQtyByColor(prev => {
            const current = prev[color] || 1
            if (actionType === 'inc') return { ...prev, [color]: current + 1 }
            if (current === 1) return prev
            return { ...prev, [color]: current - 1 }
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
        
        // Show popup for single variant
        setPopupData({
            selectedItems: [{
                name: product.name,
                color: color,
                size: entry.size,
                qty: desiredQty,
                price: entry.sellingPrice,
                media: entry?.media?.filePath,
                stock: entry.stock || 0
            }],
            totalQty: desiredQty,
            totalPrice: entry.sellingPrice * desiredQty,
            actionType: 'add'
        })
        setShowCartPopup(true)
    }

    const buyNowVariant = (color) => {
        addVariantToCart(color)
        window.location.href = WEBSITE_CHECKOUT
    }

    const handleProceedToCart = () => {
        setShowCartPopup(false)
        window.location.href = WEBSITE_CART
    }

    const handleProceedToCheckout = () => {
        setShowCartPopup(false)
        window.location.href = WEBSITE_CHECKOUT
    }

    const handleClosePopup = () => {
        setShowCartPopup(false)
        setPopupData(null)
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
                    <div className="xl:order-last xl:mb-0 mb-5 xl:w-[calc(100%-144px)]">
                        <Image
                            src={activeThumb || imgPlaceholder.src}
                            width={650}
                            height={650}
                            alt="product"
                            className="border rounded max-w-full"
                        />
                    </div>
                    <div className="flex xl:flex-col items-center xl:gap-5 gap-3 xl:w-36 overflow-auto xl:pb-0 pb-2 max-h-[600px]">
                        {allImages.map((image, index) => (
                            <Image
                                key={index}
                                src={image.src || imgPlaceholder.src}
                                width={100}
                                height={100}
                                alt={`product thumbnail ${index + 1}`}
                                className={`md:max-w-full max-w-16 rounded cursor-pointer ${image.src === activeThumb ? 'border-2 border-primary' : 'border'}`}
                                onClick={() => handleThumb(image.src)}
                            />
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
                        const minSelling = sellingPrices.length ? Math.min(...sellingPrices) : Number(variant?.sellingPrice ?? 0)
                        const maxSelling = sellingPrices.length ? Math.max(...sellingPrices) : Number(variant?.sellingPrice ?? 0)
                        return (
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl font-semibold text-foreground">
                                    BDT {minSelling.toLocaleString()}{maxSelling !== minSelling ? ` - ${maxSelling.toLocaleString()}` : ''}
                                </span>
                            </div>
                        )
                    })()}

                    {/* Offer Section - Show instead of top description */}
                    {product.offer && (
                        <div className="mb-4 p-4 bg-secondary/20 border border-secondary/30 rounded-lg">
                            <h3 className="font-semibold text-secondary-foreground mb-2">Special Offer</h3>
                            <div dangerouslySetInnerHTML={{ __html: decode(product.offer) }}></div>
                        </div>
                    )}

                    <div className="line-clamp-3 text-muted-foreground" dangerouslySetInnerHTML={{ __html: decode(product.description) }}></div>


                    {Array.isArray(variantsByColor) && variantsByColor.length > 0 && (
                        <div className="mt-6 space-y-4">
                            {variantsByColor.map(group => {
                                const selected = selectedSizeByColor[group.color]
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
                                            
                                            {/* Content on the right */}
                                            <div className="flex-1 p-3 flex flex-col justify-between">
                                                <div>
                                                    <div className="font-medium mb-2 text-card-foreground">{group.color}</div>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {group.entries.map(e => {
                                                            const isSelected = selected === e.size
                                                            const isOut = (e.stock ?? 0) <= 0
                                                            return (
                                                                <button
                                                                    key={e.variantId}
                                                                    type="button"
                                                                    disabled={isOut}
                                                                    onClick={() => handleVariantSizeSelect(group.color, e.size)}
                                                                    className={`border border-border py-1 px-2 rounded text-sm flex items-center gap-2 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent hover:text-accent-foreground'} ${isOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    <span>{e.size}</span>
                                                                    <span className="text-xs text-muted-foreground">(Stock: {e.stock ?? 0})</span>
                                                                    <span className={`text-xs ${isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>BDT {Number(e.sellingPrice || 0).toLocaleString()}</span>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center h-9 border border-border rounded-full bg-background">
                                                        <button type="button" className="h-9 w-9 flex justify-center items-center text-foreground hover:bg-accent" onClick={() => handleVariantQty(group.color, 'desc')}>
                                                            <HiMinus />
                                                        </button>
                                                        <input type="text" value={qtyByColor[group.color] || 1} className="w-12 text-center border-none outline-offset-0 bg-transparent text-foreground" readOnly />
                                                        <button type="button" className="h-9 w-9 flex justify-center items-center text-foreground hover:bg-accent" onClick={() => handleVariantQty(group.color, 'inc')}>
                                                            <HiPlus />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {(() => {
                                const selections = variantsByColor.map(v => {
                                    const s = selectedSizeByColor[v.color]
                                    if (!s) return null
                                    const e = v.entries.find(en => en.size === s)
                                    if (!e) return null
                                    const q = qtyByColor[v.color] || 1
                                    return { color: v.color, size: s, qty: q, price: e.sellingPrice, stock: e.stock ?? 0 }
                                }).filter(Boolean)
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
                                                    if (selections.length === 0) {
                                                        showToast('warning', 'Please select variant and quantity first.')
                                                        return
                                                    }
                                                    
                                                    // Add all selected variants to cart
                                                    selections.forEach(sel => {
                                                        const variantGroup = variantsByColor.find(v => v.color === sel.color)
                                                        const entry = variantGroup?.entries?.find(e => e.size === sel.size)
                                                        if (entry) {
                                                            const cartProduct = {
                                                                productId: product._id,
                                                                variantId: entry.variantId,
                                                                name: product.name,
                                                                url: product.slug,
                                                                size: entry.size,
                                                                color: sel.color,
                                                                mrp: entry.mrp,
                                                                sellingPrice: entry.sellingPrice,
                                                                media: entry?.media?.filePath,
                                                                qty: sel.qty
                                                            }
                                                            dispatch(addIntoCart(cartProduct))
                                                        }
                                                    })
                                                    
                                                    // Show popup with all selected items
                                                    setPopupData({
                                                        selectedItems: selections.map(sel => ({
                                                            name: product.name,
                                                            color: sel.color,
                                                            size: sel.size,
                                                            qty: sel.qty,
                                                            price: sel.price,
                                                            media: variantsByColor.find(v => v.color === sel.color)?.entries?.find(e => e.size === sel.size)?.media?.filePath,
                                                            stock: sel.stock
                                                        })),
                                                        totalQty: totalQty,
                                                        totalPrice: totalPrice,
                                                        actionType: 'add'
                                                    })
                                                    setShowCartPopup(true)
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
                                                    if (selections.length === 0) {
                                                        showToast('warning', 'Please select variant and quantity first.')
                                                        return
                                                    }
                                                    
                                                    // Add all selected variants to cart
                                                    selections.forEach(sel => {
                                                        const variantGroup = variantsByColor.find(v => v.color === sel.color)
                                                        const entry = variantGroup?.entries?.find(e => e.size === sel.size)
                                                        if (entry) {
                                                            const cartProduct = {
                                                                productId: product._id,
                                                                variantId: entry.variantId,
                                                                name: product.name,
                                                                url: product.slug,
                                                                size: entry.size,
                                                                color: sel.color,
                                                                mrp: entry.mrp,
                                                                sellingPrice: entry.sellingPrice,
                                                                media: entry?.media?.filePath,
                                                                qty: sel.qty
                                                            }
                                                            dispatch(addIntoCart(cartProduct))
                                                        }
                                                    })
                                                    
                                                    // Show popup with all selected items
                                                    setPopupData({
                                                        selectedItems: selections.map(sel => ({
                                                            name: product.name,
                                                            color: sel.color,
                                                            size: sel.size,
                                                            qty: sel.qty,
                                                            price: sel.price,
                                                            media: variantsByColor.find(v => v.color === sel.color)?.entries?.find(e => e.size === sel.size)?.media?.filePath,
                                                            stock: sel.stock
                                                        })),
                                                        totalQty: totalQty,
                                                        totalPrice: totalPrice,
                                                        actionType: 'buy'
                                                    })
                                                    setShowCartPopup(true)
                                                }}
                                            >
                                                Buy Now
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

            {/* Cart Confirmation Popup */}
            {popupData && (
                <CartConfirmationPopup
                    isOpen={showCartPopup}
                    onClose={handleClosePopup}
                    selectedItems={popupData.selectedItems}
                    totalQty={popupData.totalQty}
                    totalPrice={popupData.totalPrice}
                    onProceedToCart={handleProceedToCart}
                    onProceedToCheckout={handleProceedToCheckout}
                    actionType={popupData.actionType}
                />
            )}

        </div>
    )
}

export default ProductDetails