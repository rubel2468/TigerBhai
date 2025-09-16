'use client'
import Image from 'next/image'
import React from 'react'
import logo from '@/public/assets/images/logo-black.png'
import Link from 'next/link'
// Optimized icon imports
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlinePhone, MdOutlineMail } from "react-icons/md";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { TiSocialFacebookCircular } from "react-icons/ti";
import { FiTwitter } from "react-icons/fi";

import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import useFetch from '@/hooks/useFetch'
const Footer = () => {
    const { data: categoryRes } = useFetch('/api/category/get-category')
    const subCategories = categoryRes?.data?.subCategories || []
    return (
        <footer className='bg-gray-50 border-t'>
            <div className='grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-10 py-10 lg:px-32 px-4'>

                <div className='lg:col-span-1 md:col-span-2 col-span-1'>
                    <Image
                        src={logo}
                        width={1100}
                        height={300}
                        alt='logo'
                        className='w-36 mb-2'
                    />
                    <p className='text-gray-500 text-sm'>
                        Tiger Bhai is your trusted destination for quality and convenience. From fashion to essentials, we bring everything you need right to your doorstep. Shop smart, live better — only at Tiger Bhai.
                    </p>
                </div>


                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Categories</h4>
                    <ul>
                        {subCategories.map(sc => (
                            <li key={sc._id} className='mb-2 text-gray-500'>
                                <Link href={`${WEBSITE_SHOP}?category=${encodeURIComponent(sc.slug)}`}>{sc.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Userfull Links</h4>
                    <ul>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_HOME}>Home</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_SHOP}>Shop</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/about-us">About</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_REGISTER}>Register</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_LOGIN}>Login</Link>
                        </li>

                    </ul>
                </div>
                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Help Center</h4>
                    <ul>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_REGISTER}>Register</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_LOGIN}>Login</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={USER_DASHBOARD}>My Account</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/privacy-policy">Privacy Policy</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/terms-and-conditions">Terms & Conditions</Link>
                        </li>


                    </ul>
                </div>
                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Contact Us </h4>
                    <ul>
                        <li className='mb-2 text-gray-500 flex gap-2'>
                            <IoLocationOutline size={20} />
                            <span className='text-sm'>1293 D.T Road Raza Supper Market , Dhaniyala Para. Chittagong</span>
                        </li>
                        <li className='mb-2 text-gray-500 flex gap-2'>
                            <MdOutlinePhone size={20} />
                            <Link href="tel:+8801611101430" className='hover:text-primary text-sm'>+88 01903-961752</Link>
                        </li>
                        <li className='mb-2 text-gray-500 flex gap-2'>
                            <MdOutlineMail size={20} />
                            <Link href="mailto:tigerbhaioffice@gmail.com" className='hover:text-primary text-sm'>tigerbhaioffice@gmail.com</Link>
                        </li>

                    </ul>


                    <div className='flex gap-3 sm:gap-4 mt-5 justify-end'>

                        <Link href="" className='p-1'>
                            <AiOutlineYoutube className='text-primary' size={22} />
                        </Link>
                        <Link href="" className='p-1'>
                            <FaInstagram className='text-primary' size={22} />
                        </Link>
                        <Link href="" className='p-1'>
                            <FaWhatsapp className='text-primary' size={22} />
                        </Link>
                        <Link href="" className='p-1'>
                            <TiSocialFacebookCircular className='text-primary' size={22} />
                        </Link>
                        <Link href="" className='p-1'>
                            <FiTwitter className='text-primary' size={22} />
                        </Link>

                    </div>

                </div>

            </div>


            <div className='py-5 bg-gray-100' >
                <p className='text-center'>© 2025 Tiger Bhai. All Rights Reserved.</p>
            </div>

        </footer>
    )
}

export default Footer