'use client'
import dynamic from 'next/dynamic'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD, ADMIN_PRODUCT_SHOW } from '@/routes/AdminPanelRoute'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import slugify from 'slugify'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import useFetch from '@/hooks/useFetch'
import Select from '@/components/Application/Select'
import Editor from '@/components/Application/Admin/Editor'
// import MediaModal from '@/components/Application/Admin/MediaModal'
import { Button } from '@/components/ui/button'
import { useRef } from 'react'
import Image from 'next/image'
const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_PRODUCT_SHOW, label: 'Products' },
  { href: '', label: 'Add Product' },
]

const AddProduct = () => {
  const [loading, setLoading] = useState(false)
  const [categoryOption, setCategoryOption] = useState([])
  const { data: getCategory } = useFetch('/api/category/public?size=10000')

  // image upload states  
  const [open, setOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])
  const [videos, setVideos] = useState([])
  const [videoInput, setVideoInput] = useState('')
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUploadChange = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }

      const { data: uploadResponse } = await axios.post('/api/cloudinary-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message)
      }

      const uploaded = (uploadResponse.data || []).map(m => ({ _id: m._id, url: m.filePath }))
      setSelectedMedia(prev => [...prev, ...uploaded])
      showToast('success', uploadResponse.message || 'Images uploaded successfully')
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

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (dragIndex === dropIndex) return

    setSelectedMedia(prev => {
      const newMedia = [...prev]
      const draggedItem = newMedia[dragIndex]
      newMedia.splice(dragIndex, 1)
      newMedia.splice(dropIndex, 0, draggedItem)
      return newMedia
    })
    
    showToast('success', 'Image order updated')
  }

  useEffect(() => {
    if (getCategory && getCategory.success) {
      const data = getCategory.data
      const options = data.map((cat) => ({ label: cat.name, value: cat._id }))
      setCategoryOption(options)
    }
  }, [getCategory])

  const formSchema = zSchema.pick({
    name: true,
    slug: true,
    category: true,
    mrp: true,
    sellingPrice: true,
    discountPercentage: true,
    description: true,
    shortDescription: true,
    // whatsappLink removed
    offer: true,
    companyDetails: true,
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      mrp: 0,
      sellingPrice: 0,
      discountPercentage: 0,
      description: "",
      shortDescription: "",
      // whatsappLink removed
      offer: "",
      companyDetails: "",
    },
  })

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
      // Normalize videos to satisfy server validation and persistence
      const normalizedVideos = (videos || []).map(v => {
        const id = v.videoId || ''
        const url = v.url || (id ? `https://youtu.be/${id}` : '')
        const thumb = v.thumbnail || (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '')
        return { platform: 'youtube', url, videoId: id, title: v.title || '', thumbnail: thumb }
      }).filter(v => v.videoId && v.url)
      values.videos = normalizedVideos

      const { data: response } = await axios.post('/api/product/create', values)
      if (!response.success) {
        throw new Error(response.message)
      }

      form.reset()
      setSelectedMedia([])
      setVideos([])
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
          <h4 className='text-xl font-semibold'>Add Product</h4>
        </CardHeader>
        <CardContent className="pb-5">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >

              <div className='grid md:grid-cols-2 grid-cols-1 gap-5'>

                <div className=''>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name<span className='text-red-500'>*</span></FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter product name" {...field} />
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
                  <Editor onChange={editor} />
                  <FormMessage></FormMessage>
                </div>
                <div className='mb-5 md:col-span-2'>
                  <FormLabel className="mb-2">Company Details (Optional)</FormLabel>
                  <Editor onChange={(event, editor) => {
                    const data = editor.getData()
                    form.setValue('companyDetails', data)
                  }} />
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
                  <Editor onChange={(event, editor) => {
                    const data = editor.getData()
                    form.setValue('offer', data)
                  }} />
                  <FormMessage></FormMessage>
                </div>
                

              </div>

              <div className='md:col-span-2 border border-dashed rounded p-5 text-center'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  multiple
                  className='hidden'
                  onChange={handleUploadChange}
                />

                {selectedMedia.length > 0 && (
                  <div className='mb-3'>
                    <p className='text-sm text-gray-600 mb-2 text-center'>
                      Drag and drop images to reorder them. Click the × to delete.
                    </p>
                    <div className='flex justify-center items-center flex-wrap gap-2'>
                      {selectedMedia.map((media, index) => (
                        <div 
                          key={media._id} 
                          className='relative h-24 w-24 border group cursor-move hover:border-blue-400 transition-colors'
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          <Image
                            src={media.url}
                            height={100}
                            width={100}
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
                          <div className='absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg'>
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button type='button' onClick={handleUploadClick} className='w-[200px] mx-auto'>
                  Upload Images
                </Button>

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
                      const { id, thumb } = (function extractYouTubeId(u){
                        try {
                          const parsed = new URL(u)
                          if (parsed.hostname.includes('youtu.be')) {
                            return { id: parsed.pathname.replace('/', ''), thumb: `https://img.youtube.com/vi/${parsed.pathname.replace('/', '')}/hqdefault.jpg` }
                          }
                          if (parsed.hostname.includes('youtube.com')) {
                            const v = new URLSearchParams(parsed.search).get('v')
                            if (v) return { id: v, thumb: `https://img.youtube.com/vi/${v}/hqdefault.jpg` }
                          }
                        } catch (_) {}
                        return { id: '', thumb: '' }
                      })(url)
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
                      <div key={`${v.videoId}-${idx}`} className='relative w-32'>
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
                <ButtonLoading loading={loading} type="submit" text="Add Product" className="cursor-pointer" />
              </div>

            </form>
          </Form>

        </CardContent>
      </Card>

    </div>
  )
}

export default dynamic(() => Promise.resolve(AddProduct), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
})