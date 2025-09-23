'use client'
import dynamic from 'next/dynamic'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_SHOW } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { use, useEffect, useState } from 'react'
import slugify from 'slugify'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'
import Select from '@/components/Application/Select'
import Editor from '@/components/Application/Admin/Editor'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRef } from 'react'
const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants' },
  { href: '', label: 'Edit Product Variant' },
]

const EditProductVariant = ({ params }) => {
  const { id } = use(params)

  const [loading, setLoading] = useState(false)
  const [productOption, setProductOption] = useState([])
  const { data: getProduct } = useFetch('/api/product?deleteType=SD&&size=10000')
  const { data: getProductVariant, loading: getProductVariantLoading } = useFetch(`/api/product-variant/get/${id}`)

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

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message)
      }

      const uploaded = (uploadResponse.data || []).map(m => ({ _id: m._id, url: m.filePath }))
      setSelectedMedia(uploaded) // Replace instead of append for single image
      showToast('success', uploadResponse.message || 'Image uploaded successfully')
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteImage = (mediaId) => {
    setSelectedMedia(prev => prev.filter(media => media._id !== mediaId))
    showToast('success', 'Image removed successfully')
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
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
    sizesWithStock: true,
    recommendedFor: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id: id,
      product: "",
      sku: "",
      color: "",
      sizesWithStock: [{ name: "", stock: 0 }],
      mrp: "",
      sellingPrice: "",
      discountPercentage: "",
      recommendedFor: "",
    },
  })

  // Load existing variant data
  useEffect(() => {
    if (getProductVariant && getProductVariant.success) {
      const variant = getProductVariant.data
      
      // Convert single size/stock to sizesWithStock format
      const sizesWithStock = variant.size && variant.stock !== undefined 
        ? [{ name: variant.size, stock: variant.stock }]
        : [{ name: "", stock: 0 }]

      form.reset({
        _id: variant._id,
        product: variant.product,
        sku: variant.sku,
        color: variant.color,
        sizesWithStock: sizesWithStock,
        mrp: variant.mrp,
        sellingPrice: variant.sellingPrice,
        discountPercentage: variant.discountPercentage,
        recommendedFor: variant.recommendedFor || "",
      })

      if (variant.media) {
        const media = { _id: variant.media._id, url: variant.media.filePath }
        setSelectedMedia([media])
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
      if (selectedMedia.length !== 1) {
        return showToast('error', 'Please upload exactly 1 image for the product variant.')
      }

      // Convert sizesWithStock back to single size/stock for API
      const sizesWithStock = values.sizesWithStock
        .map(item => ({ name: (item.name || '').trim(), stock: Number(item.stock) || 0 }))
        .filter(item => item.name)
      
      if (sizesWithStock.length === 0) {
        return showToast('error', 'Please add at least one size with stock.')
      }

      // For now, we'll use the first size/stock entry
      // In a real implementation, you might want to create multiple variants
      const firstSize = sizesWithStock[0]

      const mediaId = selectedMedia[0]._id
      const payload = {
        _id: values._id,
        product: values.product,
        sku: values.sku,
        color: values.color,
        size: firstSize.name,
        stock: firstSize.stock,
        mrp: values.mrp,
        sellingPrice: values.sellingPrice,
        discountPercentage: values.discountPercentage,
        media: mediaId,
        recommendedFor: values.recommendedFor,
      }

      const { data: response } = await axios.put('/api/product-variant/update', payload)
      if (!response.success) {
        throw new Error(response.message)
      }

      showToast('success', response.message)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="py-0 rounded shadow-sm">
        <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
          <h4 className='text-xl font-semibold'>Edit Product Variant</h4>
        </CardHeader>
        <CardContent className="pb-5">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >

              <div className='grid md:grid-cols-2 grid-cols-1 gap-5'>

                <div className=''>
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Select
                            options={productOption}
                            selected={field.value}
                            setSelected={field.onChange}
                            isMulti={false}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter SKU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='md:col-span-2'>
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant <span className='text-red-500'>*</span></FormLabel>
                        <div className='border rounded-md'>
                          <div className='grid grid-cols-12 gap-3 p-3 bg-gray-50 dark:bg-card/60 border-b rounded-t-md'>
                            <div className='col-span-10 font-semibold'>Variant Name</div>
                            <div className='col-span-2'></div>
                          </div>
                          <div className='p-3'>
                            <Input
                              type="text"
                              placeholder="Variant (e.g., Red, 64GB, etc.)"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='md:col-span-2'>
                  <FormField
                    control={form.control}
                    name="sizesWithStock"
                    render={() => (
                      <FormItem>
                        <FormLabel>Sizes with Stock <span className='text-red-500'>*</span></FormLabel>
                        <div className='border rounded-md'>
                          <div className='grid grid-cols-12 gap-3 p-3 bg-gray-50 dark:bg-card/60 border-b rounded-t-md'>
                            <div className='col-span-6 font-semibold'>Size Name</div>
                            <div className='col-span-4 font-semibold'>Stock</div>
                            <div className='col-span-2'></div>
                          </div>
                          <div className='divide-y'>
                            {form.watch('sizesWithStock').map((row, index) => (
                              <div key={index} className='grid grid-cols-12 gap-3 p-3 items-center'>
                                <div className='col-span-6'>
                                  <Input
                                    type="text"
                                    placeholder="Size name (e.g., S, M, Custom)"
                                    value={row.name}
                                    onChange={(e) => {
                                      const next = [...form.getValues('sizesWithStock')]
                                      next[index].name = e.target.value
                                      form.setValue('sizesWithStock', next, { shouldDirty: true, shouldValidate: true })
                                    }}
                                  />
                                </div>
                                <div className='col-span-4'>
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="Stock"
                                    value={row.stock}
                                    onChange={(e) => {
                                      const next = [...form.getValues('sizesWithStock')]
                                      const parsed = parseInt(e.target.value, 10)
                                      next[index].stock = isNaN(parsed) ? 0 : parsed
                                      form.setValue('sizesWithStock', next, { shouldDirty: true, shouldValidate: true })
                                    }}
                                  />
                                </div>
                                <div className='col-span-2 flex justify-end'>
                                  <Button
                                    type='button'
                                    variant='destructive'
                                    onClick={() => {
                                      const next = [...form.getValues('sizesWithStock')]
                                      next.splice(index, 1)
                                      form.setValue('sizesWithStock', next.length ? next : [{ name: "", stock: 0 }], { shouldDirty: true, shouldValidate: true })
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className='p-3 border-t rounded-b-md flex justify-between'>
                            <Button type='button' variant='secondary' onClick={() => form.setValue('sizesWithStock', [...form.getValues('sizesWithStock'), { name: "", stock: 0 }], { shouldDirty: true, shouldValidate: true })}>Add Row</Button>
                            <span className='text-sm text-gray-500'>Add custom size names with their stock.</span>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='md:col-span-2'>
                  <FormField
                    control={form.control}
                    name="recommendedFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommended For (Optional)</FormLabel>
                        <FormControl>
                          <Input type="text" maxLength={120} placeholder="e.g., Kids, Runners, Heavy duty" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='md:col-span-2'>
                  <div className='grid md:grid-cols-3 grid-cols-1 gap-5 items-end'>
                    <FormField
                      control={form.control}
                      name="mrp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MRP <span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter MRP" {...field} />
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
                          <FormLabel>Selling Price <span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter Selling Price" {...field} />
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
                          <FormLabel>Discount Percentage <span className='text-red-500'>*</span></FormLabel>
                          <FormControl>
                            <Input type="number" readOnly placeholder="Discount %" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

              </div>

              <div className='md:col-span-2 border border-dashed rounded p-5 text-center'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleUploadChange}
                />

                {selectedMedia.length > 0 && (
                  <div className='mb-3'>
                    <p className='text-sm text-gray-600 mb-2 text-center'>
                      Product variant image. Click the × to delete and upload a new one.
                    </p>
                    <div className='flex justify-center items-center'>
                      {selectedMedia.map(media => (
                        <div key={media._id} className='relative h-32 w-32 border group'>
                          <Image
                            src={media.url}
                            height={128}
                            width={128}
                            alt=''
                            className='size-full object-cover'
                          />
                          <button
                            type='button'
                            onClick={() => handleDeleteImage(media._id)}
                            className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg'
                            title='Delete image'
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button type='button' onClick={handleUploadClick} className='w-[200px] mx-auto'>
                  Upload Image
                </Button>

              </div>

              <div className='mb-3 mt-5'>
                <ButtonLoading loading={loading} type="submit" text="Save Changes" className="cursor-pointer" />
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
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
})