'use client'
import ButtonLoading from '@/components/Application/ButtonLoading'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { WEBSITE_ORDER_DETAILS, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { addIntoCart, clearCart } from '@/store/reducer/cartReducer'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import React, { useActionState, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { IoCloseCircleSharp } from "react-icons/io5";
import { z } from 'zod'
import { FaShippingFast } from "react-icons/fa";
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import PathaoChargeTable from '@/components/Application/Website/PathaoChargeTable'
import { pushToDataLayer } from '@/lib/gtm'

import loading from '@/public/assets/images/loading.svg'
const breadCrumb = {
    title: 'Checkout',
    links: [
        { label: "Checkout" }
    ]
}
const Checkout = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const cart = useSelector(store => store.cartStore)
    const authStore = useSelector(store => store.authStore)
    const [verifiedCartData, setVerifiedCartData] = useState([])
    const { data: getVerifiedCartData } = useFetch('/api/cart-verification', 'POST', { data: cart.products })

    const [isCouponApplied, setIsCouponApplied] = useState(false)
    const [subtotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [couponDiscountAmount, setCouponDiscountAmount] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponCode, setCouponCode] = useState('')

    const [placingOrder, setPlacingOrder] = useState(false)
    const [savingOrder, setSavingOrder] = useState(false)
    const [thana, setThana] = useState('')
    useEffect(() => {
        if (getVerifiedCartData && getVerifiedCartData.success) {
            const cartData = getVerifiedCartData.data
            setVerifiedCartData(cartData)
            dispatch(clearCart())
            cartData.forEach(cartItem => {
                dispatch(addIntoCart(cartItem))
            });
        }
    }, [getVerifiedCartData])


    useEffect(() => {
        const cartProducts = cart.products
        const userEmail = authStore?.auth?.email
        const userPhone = authStore?.auth?.phone

        const subTotalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * product.qty), 0)

        const discount = cartProducts.reduce((sum, product) => sum + ((product.mrp - product.sellingPrice) * product.qty), 0)

        setSubTotal(subTotalAmount)
        setDiscount(discount)
        setTotalAmount(subTotalAmount - couponDiscountAmount)

        couponForm.setValue('minShoppingAmount', subTotalAmount)

        // GTM initiatecheckout when we have items and totals
        if (cartProducts.length > 0) {
            const items = cartProducts.map(p => ({
                item_id: p.variantId,
                item_name: p.name,
                item_variant: `${p.color || ''} ${p.size || ''}`.trim(),
                price: Number(p.sellingPrice),
                quantity: Number(p.qty),
            }))

            pushToDataLayer('initiatecheckout', {
                currency: 'BDT',
                value: Number(subTotalAmount - couponDiscountAmount),
                coupon: isCouponApplied ? couponCode : undefined,
                // TikTok enrichment
                email: userEmail,
                phone_number: userPhone,
                content_type: 'product',
                content_id: items?.[0]?.item_id,
                items
            })
        }

    }, [cart])

    useEffect(() => {
        setTotalAmount(subtotal - couponDiscountAmount)
    }, [couponDiscountAmount, subtotal])



    // coupon form 

    const couponFormSchema = zSchema.pick({
        code: true,
        minShoppingAmount: true
    })

    const couponForm = useForm({
        resolver: zodResolver(couponFormSchema),
        defaultValues: {
            code: "",
            minShoppingAmount: subtotal
        }
    })

    const applyCoupon = async (values) => {
        setCouponLoading(true)
        try {
            const { data: response } = await axios.post('/api/coupon/apply', values)
            if (!response.success) {
                throw new Error(response.message)
            }

            const discountPercentage = response.data.discountPercentage
            // get coupon discount amount 
            setCouponDiscountAmount((subtotal * discountPercentage) / 100)
            setTotalAmount(subtotal - ((subtotal * discountPercentage) / 100))
            showToast('success', response.message)
            setCouponCode(couponForm.getValues('code'))
            setIsCouponApplied(true)

            couponForm.resetField('code', '')
        } catch (error) {
            // Handle specific field validation errors for coupon
            if (error.response?.data?.errors) {
                const fieldErrors = error.response.data.errors
                
                Object.keys(fieldErrors).forEach(field => {
                    couponForm.setError(field, {
                        type: 'manual',
                        message: fieldErrors[field]
                    })
                })
                showToast('error', 'Please fix the coupon validation errors')
            } else {
                showToast('error', error.message)
            }
        } finally {
            setCouponLoading(false)
        }
    }

    const removeCoupon = () => {
        setIsCouponApplied(false)
        setCouponCode('')
        setCouponDiscountAmount(0)
        setTotalAmount(subtotal)
    }


    // place order 
    const orderFormSchema = zSchema.pick({
        name: true,
        phone: true,
        address: true,
        ordernote: true
    }).extend({
        userId: z.string().optional(),
        thana: z.string().min(1, "Thana is required")
    })

    const orderForm = useForm({
        resolver: zodResolver(orderFormSchema),
        defaultValues: {
            name: '',
            phone: '',
            address: '',
            ordernote: '',
            thana: '',
            userId: authStore?.auth?._id,
        }
    })


    useEffect(() => {
        if (authStore) {
            orderForm.setValue('userId', authStore?.auth?._id)
        }
    }, [authStore])

    const placeOrder = async (formData) => {
        setPlacingOrder(true)
        setSavingOrder(true)
        
        try {
            const products = verifiedCartData.map((cartItem) => (
                {
                    productId: cartItem.productId,
                    variantId: cartItem.variantId,
                    name: cartItem.name,
                    qty: cartItem.qty,
                    mrp: cartItem.mrp,
                    sellingPrice: cartItem.sellingPrice,
                }
            ))

            const { data: orderResponseData } = await axios.post('/api/orders/create', {
                ...formData,
                products: products,
                subtotal: subtotal,
                discount: discount,
                couponDiscountAmount: couponDiscountAmount,
                totalAmount: totalAmount
            })

            if (orderResponseData.success) {
                // GTM purchase
                const items = verifiedCartData.map(p => ({
                    item_id: p.variantId,
                    item_name: p.name,
                    item_variant: `${p.color || ''} ${p.size || ''}`.trim(),
                    price: Number(p.sellingPrice),
                    quantity: Number(p.qty),
                }))

                pushToDataLayer('purchase', {
                    transaction_id: orderResponseData.data.orderNumber,
                    value: Number(totalAmount),
                    currency: 'BDT',
                    coupon: isCouponApplied ? couponCode : undefined,
                    // TikTok enrichment
                    email: authStore?.auth?.email,
                    phone_number: formData?.phone,
                    content_type: 'product',
                    content_id: items?.[0]?.item_id,
                    items,
                })

                showToast('success', 'Order placed successfully!')
                dispatch(clearCart())
                orderForm.reset()
                router.push(WEBSITE_ORDER_DETAILS(orderResponseData.data.orderNumber))
            } else {
                showToast('error', orderResponseData.message)
            }

        } catch (error) {
            // Handle specific field validation errors
            if (error.response?.data?.errors) {
                const fieldErrors = error.response.data.errors
                
                // Set form errors for each field
                Object.keys(fieldErrors).forEach(field => {
                    orderForm.setError(field, {
                        type: 'manual',
                        message: fieldErrors[field]
                    })
                })
                showToast('error', 'Please fix the validation errors below')
            } else {
                showToast('error', error.response?.data?.message || error.message || 'Failed to place order')
            }
        } finally {
            setPlacingOrder(false)
            setSavingOrder(false)
        }
    }

    return (
        <div>

            {savingOrder &&
                <div className='h-screen w-screen fixed top-0 left-0 z-50 bg-black/10'>
                    <div className='h-screen flex justify-center items-center'>
                        <Image src={loading.src} height={80} width={80} alt='Loading' />
                        <h4 className='font-semibold'>Order Confirming...</h4>
                    </div>
                </div>
            }

            <WebsiteBreadcrumb props={{
                ...breadCrumb,
                titleClassName: 'text-5xl font-extrabold mb-2 text-center',
                titleIcons: {
                    before: '/assets/images/shopping-cart.png',
                    after: ['/assets/images/delivery.png', '/assets/images/food-delivery_7541708.png']
                }
            }} />
            {cart.count === 0
                ?
                <div className='w-screen h-[500px] flex justify-center items-center py-32'>
                    <div className='text-center'>
                        <h4 className='text-4xl font-semibold mb-5'>Your cart is empty!</h4>

                        <Button type="button" asChild>
                            <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
                        </Button>

                    </div>
                </div>
                :
                <div className='flex lg:flex-nowrap flex-wrap gap-10 my-10 lg:px-32 px-4'>
                    <div className='lg:w-[60%] w-full order-1'>
                        <div className='flex font-semibold gap-2 items-center justify-center text-blue-600 text-3xl'>
                            <FaShippingFast size={25} /> <span className='text-center'>Shipping Address</span>
                        </div>
                        <p className='text-center text-base text-gray-700 mt-2'>আপনার পণ্য ডেলিভারি করার জন্য নিম্নে তথ্যগুলো দিয়ে সহযোগিতা করবেন</p>
                        <div className='mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm p-6'>

                            <Form {...orderForm}>
                                <form className='grid grid-cols-1 gap-5' onSubmit={orderForm.handleSubmit(placeOrder)}>
                                    <div className='mb-1'>
                                        <FormField
                                            control={orderForm.control}
                                            name='name'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Full name* (পূর্ণ নাম লিখুন)" className='h-12 rounded-xl' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-1'>
                                        <FormField
                                            control={orderForm.control}
                                            name='phone'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Phone* (ফোন নাম্বার লিখুন)" className='h-12 rounded-xl' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-1'>
                                        <FormField
                                            control={orderForm.control}
                                            name='address'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea placeholder="Full address* (সম্পূর্ণ ঠিকানা লিখুন)" className='rounded-xl min-h-28' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>
                                    <div className='mb-1'>
                                        <FormField
                                            control={orderForm.control}
                                            name='thana'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Thana* (থানার নাম লিখুন)" className='h-12 rounded-xl' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >
                                        </FormField>
                                    </div>
                                    <div className='mb-1'>
                                        <FormField
                                            control={orderForm.control}
                                            name='ordernote'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea placeholder="Order notes (optional) (অর্ডার সংক্রান্ত নির্দেশনা চাইলে দিতে পারেন)" className='rounded-xl min-h-24' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        >

                                        </FormField>
                                    </div>

                                    <div className='mt-2'>
                                        <ButtonLoading type="submit" text="Place Order / অর্ডার সম্পন্ন করুন" loading={placingOrder} className="bg-red-600 hover:bg-red-700 rounded-full px-6 h-12 text-base cursor-pointer" />
                                    </div>

                                </form>
                            </Form>
                        </div>

                    </div>
                    <div className='lg:w-[40%] w-full order-2'>
                        <div className='lg:mt-0 mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm p-6'>
                            <h4 className='text-lg font-semibold mb-5'>Order Summary</h4>

                            <div>

                                <table className='w-full border'>
                                    <tbody>
                                        {verifiedCartData && verifiedCartData?.map(product => (
                                            <tr key={product.variantId}>
                                                <td className='p-3'>
                                                    <div className='flex items-center gap-5'>
                                                        <Image src={product.media} width={60} height={60} alt={product.name} className='rounded' />
                                                        <div>
                                                            <h4 className='font-medium line-clamp-1'>
                                                                <Link href={WEBSITE_PRODUCT_DETAILS(product.url)}>{product.name}</Link>
                                                            </h4>
                                                            <p className='text-sm'>Color: {product.color}</p>
                                                            <p className='text-sm'>Size: {product.size}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='p-3 text-center'>
                                                    <p className='text-nowrap text-sm'>
                                                        {product.qty} x BDT {product.sellingPrice.toLocaleString()}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <table className='w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='font-medium py-2'>Subtotal</td>
                                            <td className='text-end py-2'>
                                                BDT {subtotal.toLocaleString()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2'>Discount</td>
                                            <td className='text-end py-2'>
                                                - BDT {discount.toLocaleString()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2'>Coupon Discount</td>
                                            <td className='text-end py-2'>
                                                - BDT {couponDiscountAmount.toLocaleString()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2 text-xl'>Total</td>
                                            <td className='text-end py-2'>
                                                BDT {totalAmount.toLocaleString()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className='mt-2 mb-5'>
                                    {!isCouponApplied
                                        ?
                                        <Form {...couponForm}>
                                            <form className='flex justify-between gap-5' onSubmit={couponForm.handleSubmit(applyCoupon)}>
                                                <div className='w-[calc(100%-100px)]'>
                                                    <FormField
                                                        control={couponForm.control}
                                                        name='code'
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input placeholder="Enter coupon code" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    >

                                                    </FormField>
                                                </div>
                                                <div className='w-[100px]'>
                                                    <ButtonLoading type="submit" text="Apply" className="w-full cursor-pointer" loading={couponLoading} />
                                                </div>
                                            </form>
                                        </Form>
                                        :
                                        <div className='flex justify-between py-1 px-5 rounded-lg bg-gray-200'>
                                            <div>
                                                <span className='text-xs'>Coupon:</span>
                                                <p className='text-sm font-semibold'>{couponCode}</p>
                                            </div>
                                            <button type='button' onClick={removeCoupon} className='text-red-500 cursor-pointer'>
                                                <IoCloseCircleSharp size={25} />
                                            </button>
                                        </div>
                                    }
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* Pathao Charge Table */}
            <div className='my-16'>
                <PathaoChargeTable />
            </div>

        </div>
    )
}

export default Checkout