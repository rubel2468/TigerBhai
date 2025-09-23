'use client'
import dynamic from 'next/dynamic'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { VENDOR_DASHBOARD, VENDOR_PRODUCTS } from '@/routes/VendorRoute'
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
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'

const breadcrumbData = [
  { href: VENDOR_DASHBOARD, label: 'Dashboard' },
  { href: VENDOR_PRODUCTS, label: 'Products' },
  { href: '', label: 'Edit Product' },
]

const EditVendorProduct = ({ params }) => {
  const { id } = use(params)

  const [loading, setLoading] = useState(false)
  const [categoryOption, setCategoryOption] = useState([])
  const { data: getCategory } = useFetch('/api/category?deleteType=SD&&size=10000')
  const { data: getProduct, loading: getProductLoading } = useFetch(`/api/vendor/products/${id}`)

  // media modal states  
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])

  useEffect(() => {
    if (getCategory && getCategory.success) {
      const data = getCategory.data
      const options = data.map((cat) => ({ label: cat.name, value: cat._id }))
      setCategoryOption(options)
    }
  }, [getCategory])

  const formSchema = zSchema.pick({
    _id: true,
    name: true,
    slug: true,
    category: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
    description: true,
    // whatsappLink removed
    offer: true,
    companyDetails: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      _id: id,
      name: "",
      slug: "",
      category: "",
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
      description: "",
      // whatsappLink removed
      offer: "",
      companyDetails: "",
    },
  })

  useEffect(() => {
    if (getProduct && getProduct.success) {
      const product = getProduct.data
      form.reset({
        _id: product?._id,
        name: product?.name,
        slug: product?.slug,
        category: product?.category,
        mrp: product?.mrp,
        sellingPrice: product?.sellingPrice,
        discountPercentage: product?.discountPercentage,
        description: product?.description,
        // whatsappLink removed
        offer: product?.offer || "",
        companyDetails: product?.companyDetails || "",
      })

      if (product.media) {
        const media = product.media.map((media) => ({ _id: media._id, url: media.filePath }))
        setSelectedMedia(media)
      }
    }
  }, [getProduct])

  useEffect(() => {
    const name = form.getValues('name')
    if (name) {
      form.setValue('slug', slugify(name).toLowerCase())
    }
  }, [form.watch('name')])

  // discount percentage calculation 
  useEffect(() => {
    const mrp = form.getValues('mrp') || 0
    const sellingPrice = form.getValues('sellingPrice') || 0

    if (mrp > 0 && sellingPrice > 0) {
      const discountPercentage = ((mrp - sellingPrice) / mrp) * 100
      form.setValue('discountPercentage', Math.round(discountPercentage))
    }
  }, [form.watch('mrp'), form.watch('sellingPrice')])

  const editor = (event, editor) => {
    const data = editor.getData()
    form.setValue('description', data)
  }

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const payload = {
        ...values,
        media: selectedMedia.map(media => media._id)
      }

      const { data: response } = await axios.put(`/api/vendor/products/${id}`, payload)
      
      if (response.success) {
        showToast('success', 'Product updated successfully')
      } else {
        showToast('error', response.message)
      }
    } catch (error) {
      showToast('error', 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  if (getProductLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="py-0 rounded shadow-sm gap-0">
        <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
          <h4 className='text-xl font-semibold'>Edit Product</h4>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          options={categoryOption}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select category"
                        />
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                          placeholder="Enter selling price" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                          placeholder="Discount percentage" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Editor
                        data={field.value}
                        onChange={editor}
                        placeholder="Enter product description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer (Optional)</FormLabel>
                    <FormControl>
                      <Editor
                        data={field.value}
                        onChange={(event, editor) => {
                          const data = editor.getData()
                          form.setValue('offer', data)
                        }}
                        placeholder="Enter offer details"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Details (Optional)</FormLabel>
                    <FormControl>
                      <Editor
                        data={field.value}
                        onChange={(event, editor) => {
                          const data = editor.getData()
                          form.setValue('companyDetails', data)
                        }}
                        placeholder="Enter company details"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              

              <div className="flex justify-end gap-4">
                <ButtonLoading
                  type="submit"
                  loading={loading}
                  text="Update Product"
                />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default dynamic(() => Promise.resolve(EditVendorProduct), {
    ssr: false,
    loading: () => <div className='flex justify-center items-center h-64'>Loading...</div>
})


