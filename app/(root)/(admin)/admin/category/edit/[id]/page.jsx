'use client'
import dynamic from 'next/dynamic'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
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
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'
import Select from '@/components/Application/Select'
const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
    { href: '', label: 'Edit Category' },
]

const EditCategory = ({ params }) => {

    const { id } = use(params)
    const { data: categoryData } = useFetch(`/api/category/get/${id}`)
    const { data: mainCategories } = useFetch('/api/category?deleteType=SD&&size=10000')

    // media modal states  
    const [open, setOpen] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState([])
    const [parentOptions, setParentOptions] = useState([])

    const [loading, setLoading] = useState(false)
    const formSchema = zSchema.pick({
        _id: true, name: true, slug: true, image: true, parent: true, isMainCategory: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            _id: id,
            name: "",
            slug: "",
            image: "",
            parent: null,
            isMainCategory: true,
        },
    })
 


    useEffect(() => {
        if (mainCategories && mainCategories.success) {
            const data = mainCategories.data.filter(cat => cat.isMainCategory && cat._id !== id)
            const options = data.map((cat) => ({ label: cat.name, value: cat._id }))
            setParentOptions(options)
        }
    }, [mainCategories, id])

    useEffect(() => {
        if (categoryData && categoryData.success) {
            const data = categoryData.data
            form.reset({
                _id: data?._id,
                name: data?.name,
                slug: data?.slug,
                image: data?.image || "",
                parent: data?.parent || null,
                isMainCategory: data?.isMainCategory !== undefined ? data.isMainCategory : true
            })
            
            // Set selected media if image exists
            if (data?.image) {
                setSelectedMedia([{ _id: 'existing', url: data.image }])
            }
        }
    }, [categoryData])


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
            const imageUrl = selectedMedia.length > 0 ? selectedMedia[0].url : ""
            
            const payload = {
                ...values,
                image: imageUrl
            }
            
            const { data: response } = await axios.put('/api/category/update', payload)
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
                    <h4 className='text-xl font-semibold'>Edit Category</h4>
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
                                <div className='border border-dashed rounded p-5 text-center'>
                                    <MediaModal
                                        open={open}
                                        setOpen={setOpen}
                                        selectedMedia={selectedMedia}
                                        setSelectedMedia={setSelectedMedia}
                                        isMultiple={false}
                                    />

                                    {selectedMedia.length > 0
                                        && <div className='flex justify-center items-center mb-3'>
                                            <div className='h-24 w-24 border rounded overflow-hidden'>
                                                <Image
                                                    src={selectedMedia[0].url}
                                                    height={100}
                                                    width={100}
                                                    alt='Category Image'
                                                    className='size-full object-cover'
                                                />
                                            </div>
                                        </div>
                                    }

                                    <div onClick={() => setOpen(true)} className='bg-gray-50 dark:bg-card border w-[200px] mx-auto p-5 cursor-pointer rounded'>
                                        <span className='font-semibold'>Select Image</span>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-3'>
                                <ButtonLoading loading={loading} type="submit" text="Update Category" className="cursor-pointer" />
                            </div>

                        </form>
                    </Form>

                </CardContent>
            </Card>

        </div>
    )
}

export default dynamic(() => Promise.resolve(EditCategory), {
    ssr: false,
    loading: () => <div className='flex justify-center items-center h-64'>Loading...</div>
})