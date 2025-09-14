'use client'
import React, { memo } from 'react'

const MobileOptimizedLoader = memo(() => {
    return (
        <div className="h-[calc(100vh-4rem)] w-full relative flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Loading...</p>
            </div>
        </div>
    )
})

export default MobileOptimizedLoader
