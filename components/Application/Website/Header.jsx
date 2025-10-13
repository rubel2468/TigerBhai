'use client'
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { VENDOR_DASHBOARD, VENDOR_REGISTER } from '@/routes/VendorRoute'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import logo from '@/public/assets/images/logo-black.png'
// Optimized icon imports
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { VscAccount } from "react-icons/vsc";
import { HiMiniBars3 } from "react-icons/hi2";
import Cart from './Cart'
import { useSelector } from 'react-redux'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/images/user.png'
import Search from './Search'
import useFetch from '@/hooks/useFetch'


const Header = () => {
    const auth = useSelector(store => store.authStore.auth)
    const [isMobileMenu, setIsMobileMenu] = useState(false)
    const [isAccountOpen, setIsAccountOpen] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [hoveredCategory, setHoveredCategory] = useState(null)

    // categories
    const { data: categoryRes } = useFetch('/api/category/get-category')
    const mainCategories = categoryRes?.data?.mainCategories || []
    const subCategories = categoryRes?.data?.subCategories || []

    // Add scroll effect for enhanced glass effect with throttling
    React.useEffect(() => {
        let ticking = false
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 50)
                    ticking = false
                })
                ticking = true
            }
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-primary border-b border-primary/70 shadow-lg shadow-black/10`}>
            <div className='flex justify-between items-center h-20 lg:pl-8 pl-3 lg:pr-32 pr-6'>
                <Link href={WEBSITE_HOME} className="group">
                    <Image
                        src={logo}
                        width={200}
                        height={60} 
                        alt='logo'
                        className='h-10 lg:h-12 w-auto transition-all duration-300 group-hover:scale-105 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] object-contain'
                    />
                </Link>

                <div className='flex justify-between gap-20'>
                    <nav className={`lg:relative lg:w-auto lg:h-auto lg:top-0 lg:left-0 lg:p-0 fixed z-50 top-0 w-full h-screen transition-all duration-500 ease-in-out ${
                        isMobileMenu ? 'left-0' : '-left-full'
                    }`}>
                        {/* Mobile Menu Overlay */}
                        <div className={`lg:hidden absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
                            isMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`} onClick={() => setIsMobileMenu(false)}></div>
                        
                        {/* Mobile Menu Content */}
                        <div className={`lg:hidden absolute top-0 left-0 w-80 h-full bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl transition-transform duration-500 ease-in-out ${
                            isMobileMenu ? 'translate-x-0' : '-translate-x-full'
                        }`}>
                            <div className='flex justify-between items-center bg-white/10 backdrop-blur-sm py-4 px-6 border-b border-white/10'>
                                <Image
                                    src={logo}
                                    width={200}
                                    height={60}
                                    alt='logo'
                                    className='h-8 w-auto'
                                />
                                <button 
                                    type='button' 
                                    onClick={() => setIsMobileMenu(false)}
                                    className='p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200'
                                >
                                    <IoMdClose size={24} className='text-gray-600' />
                                </button>
                            </div>

                            <ul className='py-8 px-6 space-y-2'>
                                {[{ href: WEBSITE_HOME, label: 'Home' }, { href: "/about-us", label: 'About' }, { href: WEBSITE_SHOP, label: 'Shop' }].map((item, index) => (
                                    <li key={`static-${index}`}>
                                        <Link 
                                            href={item.href} 
                                            className='block py-4 px-4 text-gray-700 hover:text-primary hover:bg-white/20 rounded-lg transition-all duration-200 font-medium'
                                            onClick={() => setIsMobileMenu(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}

                                {mainCategories.map(mc => {
                                    const children = subCategories.filter(sc => sc.parent === mc._id)
                                    return (
                                        <li key={`m-${mc._id}`} className='pt-2'>
                                            <span className='block py-3 px-4 text-gray-800 font-semibold'>{mc.name}</span>
                                            {children.length > 0 && (
                                                <ul className='pl-4'>
                                                    {children.map(sc => (
                                                        <li key={`sc-${sc._id}`} className='mb-1'>
                                                            <Link 
                                                                href={`${WEBSITE_SHOP}?category=${encodeURIComponent(sc.slug)}`}
                                                                className='block py-2 px-4 text-gray-600 hover:text-primary hover:bg-white/20 rounded-md transition-all duration-200'
                                                                onClick={() => setIsMobileMenu(false)}
                                                            >
                                                                {sc.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>

                        {/* Desktop Navigation */}
                        <ul className='hidden lg:flex justify-between items-center gap-8'>
                            {[{ href: WEBSITE_HOME, label: 'Home' }, { href: "/about-us", label: 'About' }, { href: WEBSITE_SHOP, label: 'Shop' }].map((item, index) => (
                                <li key={`d-static-${index}`}>
                                    <Link 
                                        href={item.href} 
                                        className='relative text-white hover:text-white font-medium transition-all duration-300 group'
                                    >
                                        {item.label}
                                        <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full'></span>
                                    </Link>
                                </li>
                            ))}

                            {mainCategories.map(mc => {
                                const children = subCategories.filter(sc => sc.parent === mc._id)
                                const isHovered = hoveredCategory === mc._id
                                return (
                                    <li key={`d-m-${mc._id}`} className='relative'>
                                        <span 
                                            className='relative text-white hover:text-white font-medium transition-all duration-300 cursor-pointer'
                                            onMouseEnter={() => setHoveredCategory(mc._id)}
                                            onMouseLeave={() => setHoveredCategory(null)}
                                        >
                                            {mc.name}
                                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-white transition-all duration-300 ${isHovered ? 'w-full' : 'w-0'}`}></span>
                                        </span>
                                        {children.length > 0 && (
                                            <div className={`absolute left-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-lg transition-all duration-200 ${
                                                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                                            }`}>
                                                <ul className='py-2'>
                                                    {children.map(sc => (
                                                        <li key={`d-sc-${sc._id}`}>
                                                            <Link 
                                                                href={`${WEBSITE_SHOP}?category=${encodeURIComponent(sc.slug)}`}
                                                                className='block px-4 py-2.5 text-gray-700 hover:bg-white/40 hover:text-primary transition-colors duration-150'
                                                            >
                                                                {sc.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>


                    <div className='flex justify-between items-center gap-2'>
                        {/* Search Button */}
                        <button 
                            type='button' 
                            onClick={() => setShowSearch(!showSearch)}
                            className='p-2 rounded-full bg-white hover:bg-white/90 transition-all duration-200 group'
                        >
                            <IoIosSearch
                                className='text-primary transition-colors duration-200'
                                size={20}
                            />
                        </button>

                        {/* Cart */}
                        <div className='relative'>
                            <Cart />
                        </div>

                        {/* Account */}
                        {!auth ? (
                            <Link 
                                href={WEBSITE_LOGIN}
                                className='p-2 rounded-full bg-white hover:bg-white/90 transition-all duration-200 group'
                            >
                                <VscAccount
                                    className='text-primary transition-colors duration-200'
                                    size={20}
                                />
                            </Link>
                        ) : (
                            <div className='relative'>
                                <button 
                                    type='button'
                                    onClick={() => setIsAccountOpen(prev => !prev)}
                                    className='p-1 rounded-full bg-white hover:bg-white/90 transition-all duration-200 group'
                                >
                                    <Avatar className='w-7 h-7 ring-2 ring-white/20 transition-all duration-200'>
                                        <AvatarImage src={auth?.avatar?.url || userIcon.src} />
                                    </Avatar>
                                </button>

                                {isAccountOpen && (
                                    <div className='absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl rounded-lg py-2 z-50'>
                                        <Link href={auth?.role === 'vendor' ? VENDOR_DASHBOARD : USER_DASHBOARD} className='block px-4 py-2.5 text-gray-700 hover:bg-white/40 hover:text-primary transition-colors duration-150' onClick={() => setIsAccountOpen(false)}>
                                            {auth?.role === 'vendor' ? 'Vendor Dashboard' : 'My Account'}
                                        </Link>
                                        {auth?.role !== 'vendor' && (
                                            <Link href={VENDOR_REGISTER} className='block px-4 py-2.5 text-gray-700 hover:bg-white/40 hover:text-primary transition-colors duration-150' onClick={() => setIsAccountOpen(false)}>
                                                Become a Vendor
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button 
                            type='button' 
                            className='lg:hidden p-2 rounded-full bg-white hover:bg-white/90 transition-all duration-200 group' 
                            onClick={() => setIsMobileMenu(true)}
                        >
                            <HiMiniBars3 
                                size={20} 
                                className='text-primary transition-colors duration-200' 
                            />
                        </button>
                    </div>

                </div>

            </div>

            <Search isShow={showSearch} onClose={() => setShowSearch(false)} />

        </div>
    )
}

export default Header