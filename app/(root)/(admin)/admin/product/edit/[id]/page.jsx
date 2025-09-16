'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Button } from '@/components/ui/button'
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
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
  { href: '', label: 'Edit Product' },
]

const EditProduct = ({ params }) => {

  const { id } = use(params)

  const [loading, setLoading] = useState(false)
  const [categoryOption, setCategoryOption] = useState([])
  const { data: getCategory } = useFetch('/api/category?deleteType=SD&&size=10000')
  const { data: getProduct, loading: getProductLoading } = useFetch(`/api/product/get/${id}`)



  // media modal states  
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])
  const [videos, setVideos] = useState([])
  const [videoInput, setVideoInput] = useState('')

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
    shortDescription: true,
    whatsappLink: true,
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
      shortDescription: "",
      whatsappLink: "",
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
        shortDescription: product?.shortDescription || "",
        whatsappLink: product?.whatsappLink || "",
        offer: product?.offer || "",
        companyDetails: product?.companyDetails || "",
      })

      if (product.media) {
        const media = product.media.map((media) => ({ _id: media._id, url: media.secure_url }))
        setSelectedMedia(media)
      }

      if (product.videos && Array.isArray(product.videos)) {
        // Normalize existing videos to ensure url/thumbnail presence
        const normalized = product.videos.map(v => {
          const id = v.videoId || ''
          const url = v.url || (id ? `https://youtu.be/${id}` : '')
          const thumb = v.thumbnail || (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '')
          return { platform: 'youtube', url, videoId: id, title: v.title || '', thumbnail: thumb }
        }).filter(v => v.videoId && v.url)
        setVideos(normalized)
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
      if (selectedMedia.length <= 0) {
        return showToast('error', 'Please select media.')
      }

      const mediaIds = selectedMedia.map(media => media._id)
      values.media = mediaIds
      // Normalize videos to satisfy server validation
      const normalizedVideos = (videos || []).map(v => {
        const id = v.videoId || ''
        const url = v.url || (id ? `https://youtu.be/${id}` : '')
        const thumb = v.thumbnail || (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '')
        return { platform: 'youtube', url, videoId: id, title: v.title || '', thumbnail: thumb }
      }).filter(v => v.videoId && v.url)
      values.videos = normalizedVideos

      const { data: response } = await axios.put('/api/product/update', values)
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
          <h4 className='text-xl font-semibold'>Edit Product</h4>
        </CardHeader>
        <CardContent className="pb-5">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >

              <div className='grid md:grid-cols-2  grid-cols-1 gap-5'>

                <div className=''>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name<span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter category name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Select
                            options={categoryOption}
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
                </div>
                <div className=''>
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
                </div>
                <div className=''>
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage <span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="number" readOnly placeholder="Enter Discount Percentage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='mb-5 md:col-span-2'>
                  <FormLabel className="mb-2">Description <span className='text-red-500'>*</span></FormLabel>
                  {!getProductLoading &&
                    <Editor onChange={editor} initialData={form.getValues('description')} />
                  }
                  <FormMessage></FormMessage>
                </div>
                <div className='mb-5 md:col-span-2'>
                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="Enter a brief description (2-3 lines)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='mb-5 md:col-span-2'>
                  <FormLabel className="mb-2">Offer (Optional)</FormLabel>
                  {!getProductLoading &&
                    <Editor onChange={(event, editor) => {
                      const data = editor.getData()
                      form.setValue('offer', data)
                    }} initialData={form.getValues('offer')} />
                  }
                  <FormMessage></FormMessage>
                </div>
                <div className='mb-5 md:col-span-2'>
                  <FormLabel className="mb-2">Company Details (Optional)</FormLabel>
                  {!getProductLoading &&
                    <Editor onChange={(event, editor) => {
                      const data = editor.getData()
                      form.setValue('companyDetails', data)
                    }} initialData={form.getValues('companyDetails')} />
                  }
                  <FormMessage></FormMessage>
                </div>
                <div className='md:col-span-2'>
                  <FormField
                    control={form.control}
                    name="whatsappLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Link (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://wa.me/1234567890" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </div>

              <div className='md:col-span-2 border border-dashed rounded p-5 text-center'>
                <MediaModal
                  open={open}
                  setOpen={setOpen}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  isMultiple={true}
                />

                {selectedMedia.length > 0
                  && <div className='flex justify-center items-center flex-wrap mb-3 gap-2'>
                    {selectedMedia.map(media => (
                      <div key={media._id} className='h-24 w-24 border'>
                        <Image
                          src={media.url}
                          height={100}
                          width={100}
                          alt=''
                          className='size-full object-cover'
                        />
                      </div>
                    ))}
                  </div>
                }

                <div onClick={() => setOpen(true)} className='bg-gray-50 dark:bg-card border w-[200px] mx-auto p-5 cursor-pointer'>
                  <span className='font-semibold'>Select Media</span>
                </div>

              </div>

              <div className='md:col-span-2 border border-dashed rounded p-5'>
                <FormLabel className='mb-2 block'>YouTube Videos (Optional)</FormLabel>
                <div className='flex gap-2 mb-3'>
                  <Input
                    type='url'
                    placeholder='https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID'
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                  />
                  <Button type='button' onClick={() => {
                    const url = videoInput.trim()
                    if (!url) return
                    try {
                      const extract = (u) => {
                        try {
                          const parsed = new URL(u)
                          if (parsed.hostname.includes('youtu.be')) {
                            const id = parsed.pathname.replace('/', '')
                            return { id, thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg` }
                          }
                          if (parsed.hostname.includes('youtube.com')) {
                            const v = new URLSearchParams(parsed.search).get('v')
                            if (v) return { id: v, thumb: `https://img.youtube.com/vi/${v}/hqdefault.jpg` }
                          }
                        } catch (_) {}
                        return { id: '', thumb: '' }
                      }
                      const { id, thumb } = extract(url)
                      if (!id) {
                        return showToast('error', 'Invalid YouTube URL')
                      }
                      const newItem = { platform: 'youtube', url, videoId: id, thumbnail: thumb }
                      setVideos(prev => [...prev, newItem])
                      setVideoInput('')
                      showToast('success', 'Video added')
                    } catch (e) {
                      showToast('error', 'Invalid YouTube URL')
                    }
                  }}>Add</Button>
                </div>
                {videos.length > 0 && (
                  <div className='flex flex-wrap gap-3'>
                    {videos.map((v, idx) => (
                      <div key={`${v.videoId || v._id || idx}-${idx}`} className='relative w-32'>
                        <Image src={v.thumbnail || `/assets/images/img-placeholder.webp`} width={128} height={72} alt='' className='w-full h-auto rounded border' />
                        <div className='text-xs mt-1 truncate'>youtube.com/{v.videoId}</div>
                        <button
                          type='button'
                          className='absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold'
                          onClick={() => setVideos(prev => prev.filter((_, i) => i !== idx))}
                          title='Remove video'
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

export default EditProduct