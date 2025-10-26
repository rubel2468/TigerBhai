'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Building2, User, MapPin, FileText, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import Image from 'next/image'
import { getImageSizes, BLUR_DATA_URL } from '@/lib/imageUtils'

const vendorRegistrationSchema = z.object({
    // Business Information
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
    businessType: z.enum(['individual', 'company', 'partnership']),
    businessDescription: z.string().min(50, "Business description must be at least 50 characters"),
    website: z.string().url().optional().or(z.literal("")),
    
    // Contact Person
    contactPersonName: z.string().min(2, "Contact person name is required"),
    contactPersonEmail: z.string().email("Valid email is required"),
    contactPersonPhone: z.string().min(10, "Valid phone number is required"),
    
    // Business Address (Bangladesh format)
    houseApartment: z.string().min(1, "House/Apartment is required"),
    roadStreet: z.string().min(1, "Road/Street is required"),
    areaLocality: z.string().min(1, "Area/Locality is required"),
    postOffice: z.string().min(1, "Post Office is required"),
    upazilaThana: z.string().min(1, "Upazila/Thana is required"),
    district: z.string().min(1, "District is required"),
    postcode: z.string().min(3, "Postcode is required"),
    
    // Login Credentials
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function VendorRegistration() {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [documents, setDocuments] = useState({
        tradeLicense: { url: '', public_id: '' },
        nationalId: { url: '', public_id: '' },
        taxCertificate: { url: '', public_id: '' }
    })
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(vendorRegistrationSchema),
        defaultValues: {
            businessName: '',
            businessType: 'individual',
            businessDescription: '',
            website: '',
            contactPersonName: '',
            contactPersonEmail: '',
            contactPersonPhone: '',
            houseApartment: '',
            roadStreet: '',
            areaLocality: '',
            postOffice: '',
            upazilaThana: '',
            district: '',
            postcode: '',
            password: '',
            confirmPassword: ''
        }
    })

    const handleDocumentUpload = async (file, type) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            
            const { data } = await axios.post('/api/cloudinary-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                setDocuments(prev => ({
                    ...prev,
                    [type]: {
                        url: data.data[0].filePath,
                        public_id: data.data[0].fileName
                    }
                }))
                showToast('success', `${type} uploaded successfully`)
            }
        } catch (error) {
            showToast('error', `Error uploading ${type}`)
        }
    }

    const onSubmit = async (values) => {
        try {
            setLoading(true)

            // Check if required documents are uploaded
            if (!documents.tradeLicense.url || !documents.nationalId.url) {
                showToast('error', 'Please upload trade license and national ID documents')
                return
            }

            const payload = {
                businessName: values.businessName,
                businessType: values.businessType,
                businessDescription: values.businessDescription,
                website: values.website,
                contactPerson: {
                    name: values.contactPersonName,
                    email: values.contactPersonEmail,
                    phone: values.contactPersonPhone
                },
                businessAddress: {
                    houseApartment: values.houseApartment,
                    roadStreet: values.roadStreet,
                    areaLocality: values.areaLocality,
                    postOffice: values.postOffice,
                    upazilaThana: values.upazilaThana,
                    district: values.district,
                    postcode: values.postcode,
                    country: 'Bangladesh'
                },
                documents,
                password: values.password
            }

            const { data } = await axios.post('/api/vendor/register', payload)
            
            if (data.success) {
                showToast('success', data.message)
                router.push('/vendor/dashboard')
            } else {
                showToast('error', data.message)
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Become a Vendor</h1>
                    <p className="text-gray-600 mt-2">
                        Join our marketplace and start selling your products to customers worldwide
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building2 className="h-5 w-5 mr-2" />
                            Vendor Registration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Business Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center">
                                        <Building2 className="h-4 w-4 mr-2" />
                                        Business Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="businessName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Business Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter business name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="businessType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Business Type *</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select business type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="individual">Individual</SelectItem>
                                                            <SelectItem value="company">Company</SelectItem>
                                                            <SelectItem value="partnership">Partnership</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="businessDescription"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Description *</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder="Describe your business, products, and services (minimum 50 characters)"
                                                        className="min-h-20"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://yourwebsite.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Contact Person */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        Contact Person
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="contactPersonName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Contact person name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="contactPersonEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email *</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="email@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="contactPersonPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+1234567890" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Business Address (Bangladesh format) */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Business Address (Bangladesh)
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="houseApartment"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>House/Apartment Number *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 12/B" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="roadStreet"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Road Number/Street Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Road 5, Lake Drive" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="areaLocality"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Area/Locality/Union/Ward *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Banani, Ward 19" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="postOffice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Post Office *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Banani" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="upazilaThana"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Upazila/Thana *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Gulshan" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="district"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>District *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Dhaka" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="postcode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Postcode *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., 1212" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Required Documents
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Trade License */}
                                        <div className="space-y-2">
                                            <Label>Trade License *</Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                                {documents.tradeLicense.url ? (
                                                    <div className="space-y-3">
                                                        {/\.pdf($|\?)/i.test(documents.tradeLicense.url) ? (
                                                            <div className="flex items-center justify-center gap-2 text-green-700">
                                                                <FileText className="h-8 w-8" />
                                                                <a href={documents.tradeLicense.url} target="_blank" rel="noreferrer" className="underline text-sm">View PDF</a>
                                                            </div>
                                                        ) : (
                                                            <Image src={documents.tradeLicense.url} alt="Trade License" width={112} height={112} className="mx-auto h-28 object-contain rounded" sizes={getImageSizes('thumbnail')} placeholder="blur" blurDataURL={BLUR_DATA_URL} loading="lazy" />
                                                        )}
                                                        <div className="flex items-center justify-center gap-3">
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => handleDocumentUpload(e.target.files[0], 'tradeLicense')}
                                                                className="hidden"
                                                                id="tradeLicense"
                                                            />
                                                            <Label htmlFor="tradeLicense" className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm">
                                                                Change
                                                            </Label>
                                                            <button type="button" className="text-red-600 hover:text-red-700 text-sm" onClick={() => setDocuments(prev => ({ ...prev, tradeLicense: { url: '', public_id: '' } }))}>Remove</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                        <p className="text-sm text-gray-600">Upload Trade License (Image or PDF)</p>
                                                        <input
                                                            type="file"
                                                            accept="image/*,.pdf"
                                                            onChange={(e) => handleDocumentUpload(e.target.files[0], 'tradeLicense')}
                                                            className="hidden"
                                                            id="tradeLicense"
                                                        />
                                                        <Label htmlFor="tradeLicense" className="cursor-pointer text-blue-600 hover:text-blue-700">
                                                            Choose File
                                                        </Label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* National ID */}
                                        <div className="space-y-2">
                                            <Label>National ID *</Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                                {documents.nationalId.url ? (
                                                    <div className="space-y-3">
                                                        {/\.pdf($|\?)/i.test(documents.nationalId.url) ? (
                                                            <div className="flex items-center justify-center gap-2 text-green-700">
                                                                <FileText className="h-8 w-8" />
                                                                <a href={documents.nationalId.url} target="_blank" rel="noreferrer" className="underline text-sm">View PDF</a>
                                                            </div>
                                                        ) : (
                                                            <Image src={documents.nationalId.url} alt="National ID" width={112} height={112} className="mx-auto h-28 object-contain rounded" sizes={getImageSizes('thumbnail')} placeholder="blur" blurDataURL={BLUR_DATA_URL} loading="lazy" />
                                                        )}
                                                        <div className="flex items-center justify-center gap-3">
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => handleDocumentUpload(e.target.files[0], 'nationalId')}
                                                                className="hidden"
                                                                id="nationalId"
                                                            />
                                                            <Label htmlFor="nationalId" className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm">
                                                                Change
                                                            </Label>
                                                            <button type="button" className="text-red-600 hover:text-red-700 text-sm" onClick={() => setDocuments(prev => ({ ...prev, nationalId: { url: '', public_id: '' } }))}>Remove</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                        <p className="text-sm text-gray-600">Upload National ID (Image or PDF)</p>
                                                        <input
                                                            type="file"
                                                            accept="image/*,.pdf"
                                                            onChange={(e) => handleDocumentUpload(e.target.files[0], 'nationalId')}
                                                            className="hidden"
                                                            id="nationalId"
                                                        />
                                                        <Label htmlFor="nationalId" className="cursor-pointer text-blue-600 hover:text-blue-700">
                                                            Choose File
                                                        </Label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tax Certificate */}
                                        <div className="space-y-2">
                                            <Label>Tax Certificate (Optional)</Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                                {documents.taxCertificate.url ? (
                                                    <div className="space-y-3">
                                                        {/\.pdf($|\?)/i.test(documents.taxCertificate.url) ? (
                                                            <div className="flex items-center justify-center gap-2 text-green-700">
                                                                <FileText className="h-8 w-8" />
                                                                <a href={documents.taxCertificate.url} target="_blank" rel="noreferrer" className="underline text-sm">View PDF</a>
                                                            </div>
                                                        ) : (
                                                            <Image src={documents.taxCertificate.url} alt="Tax Certificate" width={112} height={112} className="mx-auto h-28 object-contain rounded" sizes={getImageSizes('thumbnail')} placeholder="blur" blurDataURL={BLUR_DATA_URL} loading="lazy" />
                                                        )}
                                                        <div className="flex items-center justify-center gap-3">
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => handleDocumentUpload(e.target.files[0], 'taxCertificate')}
                                                                className="hidden"
                                                                id="taxCertificate"
                                                            />
                                                            <Label htmlFor="taxCertificate" className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm">
                                                                Change
                                                            </Label>
                                                            <button type="button" className="text-red-600 hover:text-red-700 text-sm" onClick={() => setDocuments(prev => ({ ...prev, taxCertificate: { url: '', public_id: '' } }))}>Remove</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                        <p className="text-sm text-gray-600">Upload Tax Certificate (Image or PDF)</p>
                                                        <input
                                                            type="file"
                                                            accept="image/*,.pdf"
                                                            onChange={(e) => handleDocumentUpload(e.target.files[0], 'taxCertificate')}
                                                            className="hidden"
                                                            id="taxCertificate"
                                                        />
                                                        <Label htmlFor="taxCertificate" className="cursor-pointer text-blue-600 hover:text-blue-700">
                                                            Choose File
                                                        </Label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Login Credentials */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Login Credentials</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password *</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input 
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="Enter password" 
                                                                {...field} 
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                            >
                                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password *</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input 
                                                                type={showConfirmPassword ? "text" : "password"}
                                                                placeholder="Confirm password" 
                                                                {...field} 
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                            >
                                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Registering...' : 'Register as Vendor'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="text-center mt-6 text-sm text-gray-600">
                    <p>
                        Already have an account?{' '}
                        <button 
                            onClick={() => router.push('/auth/login')}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}
