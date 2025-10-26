'use client'
import React from "react";
import { BsCart2 } from "react-icons/bs";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { removeFromCart } from "@/store/reducer/cartReducer";
import Link from "next/link";
import { WEBSITE_CART, WEBSITE_CHECKOUT } from "@/routes/WebsiteRoute";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/showToast";
import { BLUR_DATA_URL, getImageSizes, getImageQuality } from '@/lib/imageUtils';
const Cart = React.memo(() => {
    const [open, setOpen] = useState(false)
    const [subtotal, setSubTotal] = useState(0)


    const cart = useSelector(store => store.cartStore)
    const dispatch = useDispatch()


    useEffect(() => {
        const cartProducts = cart.products

        const totalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * product.qty), 0)

        setSubTotal(totalAmount)

    }, [cart])


    return (
        <Sheet open={open} onOpenChange={setOpen} >
            <SheetTrigger className="relative p-2 rounded-full bg-white hover:bg-white/90 transition-all duration-200 group">
                <BsCart2 size={20} className="text-primary transition-colors duration-200" />
                <span className="absolute bg-red-500 text-white text-xs rounded-full w-4 h-4 flex justify-center items-center -right-1 -top-1 font-semibold shadow-lg">{cart.count}</span>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[450px] w-full">
                <SheetHeader className='py-2'>
                    <SheetTitle className="text-2xl">My Cart</SheetTitle>
                    <SheetDescription></SheetDescription>
                </SheetHeader>

                <div className="h-[calc(100vh-40px)] pb-10 ">
                    <div className="h-[calc(100%-128px)]  overflow-auto px-2">
                        {cart.count === 0 && <div className="h-full flex justify-center items-center text-xl font-semibold">
                            Your Cart Is Empty.
                        </div>}

                        {cart.products?.map(product => (
                            <div key={product.variantId} className="flex justify-between items-center gap-5 mb-4 border-b pb-4">
                                <div className="flex gap-5 items-center">
                                    <Image src={product?.media || imgPlaceholder.src} height={100} width={100} alt={product.name} className="w-20 h-20 rounded border" sizes={getImageSizes('thumbnail')} quality={getImageQuality(false)} placeholder="blur" blurDataURL={BLUR_DATA_URL} loading="lazy" />

                                    <div >
                                        <h4 className="text-lg mb-1">{product.name}</h4>
                                        <p className="text-gray-500">
                                            {product.size}/{product.color}
                                        </p>
                                    </div>

                                </div>

                                <div>
                                    <button type="button" className="text-red-500 underline underline-offset-1 mb-2 cursor-pointer"
                                        onClick={() => dispatch(removeFromCart({ productId: product.productId, variantId: product.variantId }))}
                                    >
                                        Remove
                                    </button>

                                    <p className="font-semibold">
                                        {product.qty} X BDT {product.sellingPrice.toLocaleString()}
                                    </p>

                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="h-32 border-t pt-5 px-2">
                        <h2 className="flex justify-between items-center text-lg font-semibold"><span >Subtotal</span> <span>BDT {subtotal?.toLocaleString()}</span></h2>
                        <h2 className="flex justify-between items-center text-lg font-semibold"><span >Total</span> <span>BDT {subtotal?.toLocaleString()}</span></h2>

                        <div className="flex justify-between mt-3 gap-5">
                            <Button type="button" asChild variant="secondary" className="w-[200px]" onClick={() => setOpen(false)}>
                                <Link href={WEBSITE_CART}>View Cart</Link>
                            </Button>
                            <Button type="button" asChild className="w-[200px]" onClick={() => setOpen(false)}>
                                {cart.count ?
                                    <Link href={WEBSITE_CHECKOUT}>Checkout</Link>
                                    :
                                    <button type="button" onClick={() => showToast('error', 'Your cart is empty!')}>Checkout</button>
                                }
                            </Button>
                        </div>
                    </div>
                </div>

            </SheetContent>
        </Sheet>

    )
})

export default Cart
