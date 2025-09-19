'use client'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'
import Select from '@/components/Application/Select'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'

const EditProductVariant = ({ params }) => {
  const { id } = params
  const [loading, setLoading] = useState(false)
  const [productOption, setProductOption] = useState([])
  const { data: getProduct } = useFetch('/api/product?deleteType=SD&size=10000')
  const { data: getProductVariant, loading: getProductVariantLoading } = useFetch(`/api/product-variant/get/${id}`)
  const router = useRouter()

  // image upload states  
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUploadChange = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Limit to only 1 image for variant
    if (files.length > 1) {
      showToast('error', 'Only 1 image can be uploaded for product variant')
      return
    }

    try {
      const formData = new FormData()
      formData.append('files', files[0])

      const { data: uploadResponse } = await axios.post('/api/cloudinary-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (uploadResponse.success) {
        const media = uploadResponse.data[0]
        setSelectedMedia([{ _id: media._id, url: media.filePath }])
        showToast('success', 'Image uploaded successfully')
      }
    } catch (error) {
      showToast('error', 'Failed to upload image')
    }
  }

  useEffect(() => {
    if (getProduct && getProduct.success) {
      const data = getProduct.data
      const options = data.map((product) => ({ label: product.name, value: product._id }))
      setProductOption(options)
    }
  }, [getProduct])

  const formSchema = zSchema.pick({
    _id: true,
    product: true,
    sku: true,
    color: true,
    size: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
    media: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id: id,
      product: "",
      sku: "",
      color: "",
      size: "",
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
      media: [],
    },
  })

  useEffect(() => {
    if (getProductVariant && getProductVariant.success) {
      const variant = getProductVariant.data
      form.reset({
        _id: variant?._id,
        product: variant?.product,
        sku: variant?.sku,
        color: variant?.color,
        size: variant?.size,
        mrp: variant?.mrp,
        sellingPrice: variant?.sellingPrice,
        discountPercentage: variant?.discountPercentage,
        media: variant?.media ? [variant.media] : [],
      })

      if (variant.media) {
        setSelectedMedia([{ _id: variant.media._id, url: variant.media.filePath }])
      }
    }
  }, [getProductVariant])

  // discount percentage calculation 
  useEffect(() => {
    const mrp = form.getValues('mrp') || 0
    const sellingPrice = form.getValues('sellingPrice') || 0

    if (mrp > 0 && sellingPrice > 0) {
      const discountPercentage = ((mrp - sellingPrice) / mrp) * 100
      form.setValue('discountPercentage', Math.round(discountPercentage))
    }
  }, [form.watch('mrp'), form.watch('sellingPrice')])

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      if (selectedMedia.length <= 0) {
        return showToast('error', 'Please select media.')
      }

      const mediaIds = selectedMedia.map(media => media._id)
      values.media = mediaIds

      const { data: response } = await axios.put('/api/product-variant/update', values)
      if (!response.success) {
        throw new Error(response.message)
      }

      showToast('success', response.message)
      router.push('/vendor/products/variants')
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (getProductVariantLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product Variant</h1>
        <p className="text-gray-600 mt-1">Update your product variant details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <FormControl>
                        <Select
                          options={productOption}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Product"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SKU" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Size" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mrp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MRP</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter MRP" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter Selling Price" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Discount %" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Media Upload */}
              <div className="space-y-4">
                <FormLabel>Product Image</FormLabel>
                <div className="flex items-center gap-4">
                  {selectedMedia.length > 0 ? (
                    <div className="relative w-24 h-24">
                      <Image
                        src={selectedMedia[0].url}
                        alt="Product variant"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <Button type="button" onClick={handleUploadClick} variant="outline">
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? <ButtonLoading /> : 'Update Variant'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/vendor/products/variants')}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default dynamic(() => Promise.resolve(EditProductVariant), {
    ssr: false,
    loading: () => <div className='flex justify-center items-center h-64'>Loading...</div>
})




