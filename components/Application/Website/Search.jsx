"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { WEBSITE_SHOP } from "@/routes/WebsiteRoute";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { IoSearchOutline } from "react-icons/io5";


const Search = React.memo(({ isShow, onClose }) => {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const searchRef = useRef(null)

    const handleSearch = useCallback(() => {
        if (query?.trim()) {
            router.push(`${WEBSITE_SHOP}?q=${query}`)
            onClose?.()
        }
    }, [query, router, onClose])

    const handleInputChange = (e) => {
        setQuery(e.target.value)
    }


    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (query?.trim()) {
                router.push(`${WEBSITE_SHOP}?q=${query}`)
                onClose?.()
            }
        }
    }

    // Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                onClose?.()
            }
        }

        if (isShow) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isShow, onClose])
    return (
        <div
            ref={searchRef}
            className={`absolute border-t border-white/20 transition-all duration-300 left-0 py-5 md:px-32 px-5 z-40 bg-white/95 backdrop-blur-sm w-full ${
                isShow ? "top-full opacity-100 visible" : "-top-full opacity-0 invisible"
            }`}
        >
            <div className="flex justify-between items-center relative">
                <Input
                    className="rounded-full md:h-12 ps-5 border-primary/30 focus:border-primary transition-colors duration-200"
                    placeholder="Search products..."
                    value={query || ''}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    autoFocus={isShow}
                />
                <button 
                    type="button" 
                    onClick={handleSearch} 
                    className="absolute right-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                    <IoSearchOutline size={20} className="text-gray-500 hover:text-primary transition-colors duration-200" />
                </button>
            </div>
        </div>
    );
});

export default Search;
