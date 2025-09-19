'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { showToast } from '@/lib/showToast'
import useFetch from '@/hooks/useFetch'
import useDeleteMutation from '@/hooks/useDeleteMutation'
import ImageUpload from '@/components/Application/Admin/ImageUpload'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const CarouselManagement = () => {
    const [carousels, setCarousels] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCarousel, setEditingCarousel] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: { url: '', publicId: '' },
        buttonText: 'Shop Now',
        buttonUrl: '',
        isActive: true,
        order: 0
    })

    // Fetch carousels
    const { data: carouselData, refetch } = useFetch('/api/carousel/admin')
    const deleteMutation = useDeleteMutation('/api/carousel/admin')

    useEffect(() => {
        if (carouselData?.success) {
            setCarousels(carouselData.data)
            setLoading(false)
        }
    }, [carouselData])

    const handleInputChange = (field, value) => {
        if (field === 'image') {
            setFormData(prev => ({
                ...prev,
                image: { ...prev.image, ...value }
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const url = editingCarousel 
                ? `/api/carousel/admin/${editingCarousel._id}`
                : '/api/carousel'
            
            const method = editingCarousel ? 'PUT' : 'POST'
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                showToast('success', result.message)
                setIsDialogOpen(false)
                resetForm()
                refetch()
            } else {
                showToast('error', result.message)
            }
        } catch (error) {
            showToast('error', 'Failed to save carousel item')
        }
    }

    const handleEdit = (carousel) => {
        setEditingCarousel(carousel)
        setFormData({
            title: carousel.title,
            description: carousel.description || '',
            image: carousel.image,
            buttonText: carousel.buttonText,
            buttonUrl: carousel.buttonUrl || '',
            isActive: carousel.isActive,
            order: carousel.order
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this carousel item?')) {
            await deleteMutation.mutate(id)
            refetch()
        }
    }

    const toggleActive = async (id, currentStatus) => {
        try {
            const response = await fetch(`/api/carousel/admin/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !currentStatus })
            })

            const result = await response.json()

            if (result.success) {
                showToast('success', 'Status updated successfully')
                refetch()
            } else {
                showToast('error', result.message)
            }
        } catch (error) {
            showToast('error', 'Failed to update status')
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image: { url: '', publicId: '' },
            buttonText: 'Shop Now',
            buttonUrl: '',
            isActive: true,
            order: 0
        })
        setEditingCarousel(null)
    }

    const openDialog = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Carousel Management</h1>
                    <p className="text-gray-600">Manage your homepage carousel slides</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openDialog} className="flex items-center gap-2">
                            <Plus size={20} />
                            Add New Slide
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCarousel ? 'Edit Carousel Slide' : 'Add New Carousel Slide'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Title (Optional)</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="Enter slide title (leave empty for default)"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="order">Display Order</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Enter slide description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Upload Image *</Label>
                                <ImageUpload
                                    selectedImage={formData.image.url ? { url: formData.image.url, originalName: formData.image.publicId } : null}
                                    setSelectedImage={(img) => {
                                        if (!img) {
                                            handleInputChange('image', { url: '', publicId: '' })
                                        } else {
                                            handleInputChange('image', { url: img.url, publicId: img.fileName || img.originalName || '' })
                                        }
                                    }}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="buttonText">Button Text</Label>
                                    <Input
                                        id="buttonText"
                                        value={formData.buttonText}
                                        onChange={(e) => handleInputChange('buttonText', e.target.value)}
                                        placeholder="Shop Now"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="buttonUrl">Button URL</Label>
                                    <Input
                                        id="buttonUrl"
                                        value={formData.buttonUrl}
                                        onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingCarousel ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {carousels.map((carousel) => (
                    <Card key={carousel._id}>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-32 h-20 relative rounded-lg overflow-hidden bg-gray-100">
                                    {carousel.image?.url ? (
                                        <Image
                                            src={carousel.image.url}
                                            alt={carousel.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{carousel.title}</h3>
                                            {carousel.description && (
                                                <p className="text-gray-600 text-sm mt-1">{carousel.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2">
                                                <Badge variant={carousel.isActive ? "default" : "secondary"}>
                                                    {carousel.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                <span className="text-sm text-gray-500">Order: {carousel.order}</span>
                                                {carousel.buttonUrl && (
                                                    <Badge variant="outline">Has Button</Badge>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleActive(carousel._id, carousel.isActive)}
                                            >
                                                {carousel.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(carousel)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(carousel._id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {carousels.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500 text-lg">No carousel slides found</p>
                        <p className="text-gray-400 mt-2">Create your first carousel slide to get started</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default dynamic(() => Promise.resolve(CarouselManagement), {
    ssr: false,
    loading: () => <div className="flex justify-center items-center h-64">Loading...</div>
})
