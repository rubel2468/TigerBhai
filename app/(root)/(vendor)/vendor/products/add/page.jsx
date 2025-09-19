'use client'
import React from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const AddProduct = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Add Product</h1>
        <p className="text-gray-600">This page is being loaded...</p>
      </div>
    </div>
  )
}

export default AddProduct