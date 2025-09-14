'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
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
import ImageUpload from '@/components/Application/Admin/ImageUpload'
import Select from '@/components/Application/Select'
import useFetch from '@/hooks/useFetch'
const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
  { href: '', label: 'Add Category' },
]

const AddCategory = () => {
  const [loading, setLoading] = useState(false)
  const [parentOptions, setParentOptions] = useState([])
  const { data: mainCategories } = useFetch('/api/category/get-category')
  
  // image upload state
  const [selectedImage, setSelectedImage] = useState(null)
  
  const formSchema = zSchema.pick({
    name: true, slug: true, image: true, parent: true, isMainCategory: true
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      image: "",
      parent: null,
      isMainCategory: true,
    },
  })

  useEffect(() => {
    if (mainCategories && mainCategories.success) {
      const data = mainCategories.data.mainCategories
      const options = data.map((cat) => ({ label: cat.name, value: cat._id }))
      setParentOptions(options)
    }
  }, [mainCategories])

  useEffect(() => {
    const name = form.getValues('name')
    if (name) {
      form.setValue('slug', slugify(name).toLowerCase())
    }
  }, [form.watch('name')])

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      // Get the selected image URL
      const imageUrl = selectedImage ? selectedImage.url : ""
      
      const payload = {
        ...values,
        image: imageUrl
      }
      
      const { data: response } = await axios.post('/api/category/create', payload)
      if (!response.success) {
        throw new Error(response.message)
      }

      form.reset()
      setSelectedImage(null)
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
          <h4 className='text-xl font-semibold'>Add Category</h4>
        </CardHeader>
        <CardContent className="pb-5">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >

              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name="isMainCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Type</FormLabel>
                      <FormControl>
                        <Select
                          options={[
                            { label: 'Main Category', value: true },
                            { label: 'Sub Category', value: false }
                          ]}
                          selected={field.value}
                          setSelected={(value) => {
                            field.onChange(value)
                            if (value === true) {
                              form.setValue('parent', null)
                            }
                          }}
                          placeholder="Select category type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!form.watch('isMainCategory') && (
                <div className='mb-5'>
                  <FormField
                    control={form.control}
                    name="parent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <FormControl>
                          <Select
                            options={parentOptions}
                            selected={field.value}
                            setSelected={field.onChange}
                            placeholder="Select parent category"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='mb-5'>
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Enter slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='mb-5'>
                <FormLabel className="mb-2">Category Image</FormLabel>
                <ImageUpload
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>

              <div className='mb-3'>
                <ButtonLoading loading={loading} type="submit" text="Add Category" className="cursor-pointer" />
              </div>

            </form>
          </Form>

        </CardContent>
      </Card>

    </div>
  )
}

export default AddCategory