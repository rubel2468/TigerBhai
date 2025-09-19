'use client'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useFetch from '@/hooks/useFetch'
import Image from 'next/image'
import { showToast } from '@/lib/showToast'
import axios from 'axios'

const ViewProductVariant = ({ params }) => {
  const { id } = params
  const router = useRouter()
  const { data: getProductVariant, loading } = useFetch(`/api/product-variant/get/${id}`)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product variant?')) {
      return
    }

    try {
      const { data } = await axios.put('/api/product-variant/delete', {
        ids: [id],
        deleteType: 'SD'
      })
      
      if (data.success) {
        showToast('success', 'Product variant deleted successfully')
        router.push('/vendor/products/variants')
      }
    } catch (error) {
      showToast('error', 'Failed to delete product variant')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!getProductVariant || !getProductVariant.success) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product Variant Not Found</h3>
        <p className="text-gray-500 mb-4">The product variant you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/vendor/products/variants')}>
          Back to Variants
        </Button>
      </div>
    )
  }

  const variant = getProductVariant.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/vendor/products/variants')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Variant Details</h1>
          <p className="text-gray-600 mt-1">View and manage your product variant</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product</label>
                  <p className="text-lg font-semibold">{variant.product || 'Unknown Product'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">SKU</label>
                  <p className="text-lg font-semibold">{variant.sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Color</label>
                  <p className="text-lg font-semibold">{variant.color || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Size</label>
                  <p className="text-lg font-semibold">{variant.size || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">MRP</label>
                  <p className="text-lg font-semibold">BDT {variant.mrp?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Selling Price</label>
                  <p className="text-lg font-semibold">BDT {variant.sellingPrice?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Discount Percentage</label>
                  <p className="text-lg font-semibold text-green-600">{variant.discountPercentage || '0'}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stock</label>
                  <p className="text-lg font-semibold">{variant.stock || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sizes and Stock */}
          {variant.sizesWithStock && variant.sizesWithStock.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sizes & Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {variant.sizesWithStock.map((size, index) => (
                    <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                      {size.name}: {size.stock}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              {variant.media && variant.media.filePath ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={variant.media.filePath}
                    alt="Product variant"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No Image Available</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => router.push(`/vendor/products/variants/edit/${id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Variant
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Variant
              </Button>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm">{new Date(variant.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated At</label>
                <p className="text-sm">{new Date(variant.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(ViewProductVariant), {
    ssr: false,
    loading: () => <div className='flex justify-center items-center h-64'>Loading...</div>
})




