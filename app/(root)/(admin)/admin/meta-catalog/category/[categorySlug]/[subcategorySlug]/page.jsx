'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FaFacebook, FaDownload, FaLink, FaCopy, FaArrowLeft } from 'react-icons/fa'
import { BiCategory } from 'react-icons/bi'
import { IoShirtOutline } from 'react-icons/io5'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useFetch from '@/hooks/useFetch'
import { showToast } from '@/lib/showToast'
import { ADMIN_META_CATALOG_SHOW, ADMIN_META_CATALOG_CATEGORY } from '@/routes/AdminPanelRoute'
import Link from 'next/link'

const SubcategoryMetaCatalogPage = ({ params }) => {
    const [categorySlug, setCategorySlug] = useState('')
    const [subcategorySlug, setSubcategorySlug] = useState('')
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [categoryInfo, setCategoryInfo] = useState(null)
    const [subcategoryInfo, setSubcategoryInfo] = useState(null)

    const { data: catalogData, loading: catalogLoading } = useFetch('/api/meta-catalog/settings')

    useEffect(() => {
        const resolvedParams = params.then ? params : Promise.resolve(params)
        resolvedParams.then(p => {
            setCategorySlug(p.categorySlug)
            setSubcategorySlug(p.subcategorySlug)
        })
    }, [params])

    useEffect(() => {
        if (categorySlug && subcategorySlug && catalogData?.data?.categories) {
            const category = catalogData.data.categories.find(cat => cat.slug === categorySlug)
            if (category) {
                setCategoryInfo(category)
                const subcategory = category.subcategories?.find(sub => sub.slug === subcategorySlug)
                if (subcategory) {
                    setSubcategoryInfo(subcategory)
                }
            }
            fetchProducts()
        }
    }, [categorySlug, subcategorySlug, catalogData])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('category', categorySlug)
            params.append('subcategory', subcategorySlug)
            const url = `/api/meta-catalog/public?${params.toString()}`

            const response = await fetch(url)
            const result = await response.json()
            
            if (result.success) {
                setProducts(result.data.products)
            } else {
                showToast('Error fetching products', 'error')
            }
        } catch (error) {
            showToast('Error fetching products', 'error')
        } finally {
            setLoading(false)
        }
    }

    const generateCatalogUrl = () => {
        let url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/meta-catalog/public`
        const params = new URLSearchParams()
        
        params.append('category', categorySlug)
        params.append('subcategory', subcategorySlug)
        
        url += `?${params.toString()}`
        return url
    }

    const generateXmlCatalogUrl = () => {
        let url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/meta-catalog/public`
        const params = new URLSearchParams()
        
        params.append('format', 'xml')
        params.append('category', categorySlug)
        params.append('subcategory', subcategorySlug)
        
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
            link.download = `meta-catalog-${categorySlug}-${subcategorySlug}.${format}`
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

    if (!categoryInfo || !subcategoryInfo) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-600">Subcategory not found</h2>
                <div className="flex gap-2 justify-center mt-4">
                    <Link href={ADMIN_META_CATALOG_SHOW}>
                        <Button variant="outline">
                            <FaArrowLeft className="mr-2" />
                            Back to Meta Catalog
                        </Button>
                    </Link>
                    <Link href={ADMIN_META_CATALOG_CATEGORY(categorySlug)}>
                        <Button>
                            View Category
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href={ADMIN_META_CATALOG_SHOW}>
                            <Button variant="ghost" size="sm">
                                <FaArrowLeft className="mr-2" />
                                Meta Catalog
                            </Button>
                        </Link>
                        <span className="text-gray-400">/</span>
                        <Link href={ADMIN_META_CATALOG_CATEGORY(categorySlug)}>
                            <Button variant="ghost" size="sm">
                                {categoryInfo.name}
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BiCategory className="text-green-600" />
                        {subcategoryInfo.name}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Products from {categoryInfo.name} → {subcategoryInfo.name} for Meta integration
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BiCategory />
                            Subcategory Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <IoShirtOutline className="text-green-600" />
                                <span className="font-medium">Products:</span>
                            </div>
                            <Badge variant="secondary" className="text-lg">
                                {products.length} products
                            </Badge>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-800">
                                <strong>Category Path:</strong><br />
                                {categoryInfo.name} → {subcategoryInfo.name}
                            </div>
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
                    </CardContent>
                </Card>

                {/* Export Options */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FaDownload />
                            Export & Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button 
                            onClick={() => downloadCatalog('json')}
                            className="w-full"
                            disabled={products.length === 0}
                        >
                            <FaDownload className="mr-2" />
                            Download JSON
                        </Button>

                        <Button 
                            onClick={() => downloadCatalog('xml')}
                            variant="outline"
                            className="w-full"
                            disabled={products.length === 0}
                        >
                            <FaDownload className="mr-2" />
                            Download XML
                        </Button>

                        <Button 
                            onClick={() => window.open(generateCatalogUrl(), '_blank')}
                            variant="ghost"
                            className="w-full"
                        >
                            <FaLink className="mr-2" />
                            Preview Catalog
                        </Button>

                        <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={() => {
                                const url = generateXmlCatalogUrl()
                                navigator.clipboard.writeText(url)
                                showToast('Meta XML URL copied!', 'success')
                            }}
                        >
                            <FaFacebook className="mr-2" />
                            Copy Meta URL
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IoShirtOutline />
                        Products in {subcategoryInfo.name} ({products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-8">
                            <IoShirtOutline className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500">This subcategory doesn't have any products yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Availability</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{product.title}</div>
                                                <div className="text-sm text-gray-500">{product.slug}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">₹{product.price}</div>
                                                {product.compare_at_price > product.price && (
                                                    <div className="text-sm text-gray-500 line-through">
                                                        ₹{product.compare_at_price}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="destructive">
                                                {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{product.brand}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{product.availability}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => window.open(product.url, '_blank')}
                                            >
                                                <FaLink className="mr-1" />
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Meta Integration Guide */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FaFacebook className="text-blue-600" />
                        Meta Integration for {subcategoryInfo.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">XML Feed URL for Meta:</h4>
                            <code className="bg-white p-2 rounded border text-sm block">
                                {generateXmlCatalogUrl()}
                            </code>
                            <Button 
                                size="sm" 
                                className="mt-2"
                                onClick={() => copyToClipboard(generateXmlCatalogUrl())}
                            >
                                <FaCopy className="mr-2" />
                                Copy URL
                            </Button>
                        </div>

                        <div className="text-sm text-gray-600">
                            <p><strong>Instructions:</strong></p>
                            <ol className="list-decimal list-inside space-y-1 mt-2">
                                <li>Copy the XML feed URL above</li>
                                <li>Go to Meta Business Manager → Catalog Manager</li>
                                <li>Create a new data source and select "Website"</li>
                                <li>Paste the URL and configure update frequency</li>
                                <li>Set up your Facebook Shop or Instagram Shopping</li>
                            </ol>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SubcategoryMetaCatalogPage
