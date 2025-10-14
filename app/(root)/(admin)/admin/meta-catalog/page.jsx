'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FaFacebook, FaDownload, FaLink, FaCopy, FaEye } from 'react-icons/fa'
import { BiCategory } from 'react-icons/bi'
import { IoShirtOutline } from 'react-icons/io5'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { ADMIN_META_CATALOG_CATEGORY, ADMIN_META_CATALOG_SUBCATEGORY } from '@/routes/AdminPanelRoute'

const MetaCatalogPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedSubcategory, setSelectedSubcategory] = useState('')
    const [productCount, setProductCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const { data: catalogData, loading: catalogLoading } = useFetch('/api/meta-catalog/settings')

    useEffect(() => {
        if (selectedCategory || selectedSubcategory) {
            fetchProductCount()
        }
    }, [selectedCategory, selectedSubcategory])

    const fetchProductCount = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/meta-catalog/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_products_count',
                    categorySlug: selectedCategory !== 'all' ? selectedCategory : null,
                    subcategorySlug: selectedSubcategory !== 'all' ? selectedSubcategory : null
                })
            })

            const result = await response.json()
            if (result.success) {
                setProductCount(result.data.count)
            }
        } catch (error) {
            showToast('Error fetching product count', 'error')
        } finally {
            setLoading(false)
        }
    }

    const generateCatalogUrl = () => {
        let url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/meta-catalog/public`
        const params = new URLSearchParams()
        
        if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory)
        if (selectedSubcategory && selectedSubcategory !== 'all') params.append('subcategory', selectedSubcategory)
        
        if (params.toString()) {
            url += `?${params.toString()}`
        }
        
        return url
    }

    const generateXmlCatalogUrl = () => {
        let url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/meta-catalog/public`
        const params = new URLSearchParams()
        
        params.append('format', 'xml')
        if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory)
        if (selectedSubcategory && selectedSubcategory !== 'all') params.append('subcategory', selectedSubcategory)
        
        url += `?${params.toString()}`
        return url
    }

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            showToast('URL copied to clipboard!', 'success')
        } catch (error) {
            showToast('Failed to copy URL', 'error')
        }
    }

    const downloadCatalog = async (format = 'json') => {
        try {
            const url = format === 'xml' ? generateXmlCatalogUrl() : generateCatalogUrl()
            const response = await fetch(url)
            
            if (!response.ok) {
                throw new Error('Failed to download catalog')
            }
            
            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = `meta-catalog-${selectedCategory || 'all'}-${selectedSubcategory || 'all'}.${format}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)
            
            showToast(`Catalog downloaded successfully as ${format.toUpperCase()}`, 'success')
        } catch (error) {
            showToast('Failed to download catalog', 'error')
        }
    }

    if (catalogLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading Meta Catalog...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FaFacebook className="text-blue-600" />
                        Meta Product Catalog
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage and export your product catalog for Meta (Facebook) integration
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BiCategory />
                            Category Selection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="category">Main Category</Label>
                            <Select value={selectedCategory} onValueChange={(value) => {
                                setSelectedCategory(value)
                                setSelectedSubcategory('')
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select main category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {catalogData?.data?.categories?.map((category) => (
                                        <SelectItem key={category._id} value={category.slug}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedCategory && selectedCategory !== 'all' && (
                            <div>
                                <Label htmlFor="subcategory">Subcategory</Label>
                                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select subcategory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subcategories</SelectItem>
                                        {catalogData?.data?.categories
                                            ?.find(cat => cat.slug === selectedCategory)
                                            ?.subcategories?.map((subcategory) => (
                                                <SelectItem key={subcategory._id} value={subcategory.slug}>
                                                    {subcategory.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <IoShirtOutline className="text-green-600" />
                                <span className="font-medium">Products Available:</span>
                            </div>
                            {loading ? (
                                <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                            ) : (
                                <Badge variant="secondary" className="text-lg">
                                    {productCount} products
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Catalog URLs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaLink />
                            Catalog URLs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>JSON Catalog URL</Label>
                            <div className="flex gap-2 mt-1">
                                <Input 
                                    value={generateCatalogUrl()} 
                                    readOnly 
                                    className="text-sm"
                                />
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => copyToClipboard(generateCatalogUrl())}
                                >
                                    <FaCopy />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label>XML Catalog URL (for Meta)</Label>
                            <div className="flex gap-2 mt-1">
                                <Input 
                                    value={generateXmlCatalogUrl()} 
                                    readOnly 
                                    className="text-sm"
                                />
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => copyToClipboard(generateXmlCatalogUrl())}
                                >
                                    <FaCopy />
                                </Button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button 
                                onClick={() => window.open(generateCatalogUrl(), '_blank')}
                                variant="outline"
                                className="w-full"
                            >
                                <FaEye className="mr-2" />
                                Preview Catalog
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Download Options */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaDownload />
                            Export Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <Button 
                                onClick={() => downloadCatalog('json')}
                                className="w-full"
                                disabled={productCount === 0}
                            >
                                <FaDownload className="mr-2" />
                                Download JSON Catalog
                            </Button>

                            <Button 
                                onClick={() => downloadCatalog('xml')}
                                variant="outline"
                                className="w-full"
                                disabled={productCount === 0}
                            >
                                <FaDownload className="mr-2" />
                                Download XML Catalog
                            </Button>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>For Meta Integration:</strong> Use the XML format URL in your Meta Business Manager catalog settings.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>Meta Catalog Integration Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">1. Access Meta Business Manager</h4>
                            <p className="text-gray-600">Go to your Meta Business Manager and navigate to Catalog Manager.</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-2">2. Add Data Source</h4>
                            <p className="text-gray-600">Create a new data source and select "Website" as the upload method.</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-2">3. Configure Feed URL</h4>
                            <p className="text-gray-600">
                                Use the XML Catalog URL from above: <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                    {generateXmlCatalogUrl()}
                                </code>
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-2">4. Set Update Schedule</h4>
                            <p className="text-gray-600">Configure how frequently Meta should check for updates (daily recommended).</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default MetaCatalogPage
