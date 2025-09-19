'use client'
import { Card, CardContent } from '@/components/ui/card'
import React, { useState, Suspense } from 'react'
import Logo from '@/public/assets/images/logo-black.png'
import Image from 'next/image'
import { zodResolver } from "@hookform/resolvers/zod"
import { zSchema } from '@/lib/zodSchema'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { z } from 'zod'
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa6";
import Link from 'next/link'
import { USER_DASHBOARD, WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from '@/routes/WebsiteRoute'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/authReducer'
import { useRouter, useSearchParams } from 'next/navigation'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
const LoginPage = () => {
    const dispatch = useDispatch()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isTypePassword, setIsTypePassword] = useState(true)
    const formSchema = z.object({
        identifier: z.string().min(1, 'Phone number or email is required'),
        password: z.string().min(3, 'Password field is required.')
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    })

    const handleLoginSubmit = async (values) => {
        try {
            setLoading(true)
            // Determine if identifier is phone or email
            const isEmail = values.identifier.includes('@')
            const loginData = {
                password: values.password
            }
            
            if (isEmail) {
                loginData.email = values.identifier
            } else {
                loginData.phone = values.identifier
            }
            
            const { data: loginResponse } = await axios.post('/api/auth/login', loginData)
            if (!loginResponse.success) {
                throw new Error(loginResponse.message)
            }

            // Direct login - no OTP required
            form.reset()
            showToast('success', loginResponse.message)

            // Dispatch login action with user data
            dispatch(login(loginResponse.data))

            // Redirect based on user role
            if (searchParams.has('callback')) {
                router.push(searchParams.get('callback'))
            } else {
                loginResponse.data.role === 'admin' ? router.push(ADMIN_DASHBOARD) : router.push(USER_DASHBOARD)
            }
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }


    return (
        <Card className="w-[400px]">
            <CardContent>
                <div className='flex justify-center'>
                    <Image src={Logo.src} width={1100} height={300} alt='logo' className='max-w-[150px]' />
                </div>

                <div className='text-center'>
                    <h1 className='text-3xl font-bold'>Login Into Account</h1>
                    <p>Login with your phone number or email address.</p>
                </div>
                <div className='mt-5'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLoginSubmit)} >
                            <div className='mb-5'>
                                <FormField
                                    control={form.control}
                                    name="identifier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number or Email</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="+1234567890 or example@gmail.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-5'>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type={isTypePassword ? 'password' : 'text'} placeholder="***********" {...field} />
                                            </FormControl>
                                            <button className='absolute top-1/2 right-2 cursor-pointer' type='button' onClick={() => setIsTypePassword(!isTypePassword)}>
                                                {isTypePassword ?
                                                    <FaRegEyeSlash />
                                                    :
                                                    <FaRegEye />
                                                }
                                            </button>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-3'>
                                <ButtonLoading loading={loading} type="submit" text="Login" className="w-full cursor-pointer" />
                            </div>
                            <div className='text-center'>
                                <div className='flex justify-center items-center gap-1'>
                                    <p>Don't have account?</p>
                                    <Link href={WEBSITE_REGISTER} className='text-primary underline'>Create account!</Link>
                                </div>
                                <div className='mt-3'>
                                    <Link href={WEBSITE_RESETPASSWORD} className='text-primary underline'>Forgot password?</Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>


            </CardContent>
        </Card>
    )
}

const LoginPageWrapper = () => {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
            <LoginPage />
        </Suspense>
    )
}

export default LoginPageWrapper