'use client'
import { Card, CardContent } from '@/components/ui/card'
import React, { useState } from 'react'
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

import Link from 'next/link'
import { WEBSITE_LOGIN, } from '@/routes/WebsiteRoute'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import UpdatePassword from '@/components/Application/UpdatePassword'
const ResetPassword = () => {
    const [loading, setLoading] = useState(false)
    const [identifier, setIdentifier] = useState()
    const [isIdentifierVerified, setIsIdentifierVerified] = useState(false)
    const formSchema = z.object({
        identifier: z.string().min(1, 'Phone number or email is required')
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            identifier: ""
        }
    })

    const handleIdentifierVerification = async (values) => {
        try {
            setLoading(true)
            // Determine if identifier is phone or email
            const isEmail = values.identifier.includes('@')
            const checkData = {
                password: "dummy" // We just need to check if user exists
            }
            
            if (isEmail) {
                checkData.email = values.identifier
            } else {
                checkData.phone = values.identifier
            }
            
            const { data: checkResponse } = await axios.post('/api/auth/reset-password', checkData)
            
            // If we get here, user exists
            setIdentifier(values.identifier)
            setIsIdentifierVerified(true)
            const identifierType = isEmail ? 'email' : 'phone number'
            showToast('success', `${identifierType} verified. You can now reset your password.`)

        } catch (error) {
            if (error.response?.data?.statusCode === 404) {
                showToast('error', 'No account found with this phone number or email.')
            } else {
                showToast('error', 'Verification failed.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-[400px]">
            <CardContent>
                <div className='flex justify-center'>
                    <Image src={Logo.src} width={432} height={74} alt='logo' className='max-w-[150px]' />
                </div>

                {!isIdentifierVerified
                    ?
                    <>
                        <div className='text-center'>
                            <h1 className='text-3xl font-bold'>Reset Password</h1>
                            <p>Enter your phone number or email to reset your password.</p>
                        </div>
                        <div className='mt-5'>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleIdentifierVerification)} >
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

                                    <div className='mb-3'>
                                        <ButtonLoading loading={loading} type="submit" text="Verify" className="w-full cursor-pointer" />
                                    </div>
                                    <div className='text-center'>
                                        <div className='flex justify-center items-center gap-1'>
                                            <Link href={WEBSITE_LOGIN} className='text-primary underline'>Back To Login</Link>
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </>
                    :
                    <UpdatePassword identifier={identifier} />
                }
            </CardContent>
        </Card>
    )
}

export default ResetPassword