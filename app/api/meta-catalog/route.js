import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import CategoryModel from "@/models/Category.model"
import MediaModel from "@/models/Media.model"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        await connectDB()
        
        // Check authentication for admin access
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const { searchParams } = new URL(request.url)
        const categorySlug = searchParams.get('category')
        const subcategorySlug = searchParams.get('subcategory')
        const format = searchParams.get('format') || 'json'

        let query = { deletedAt: null }

        // If specific category is requested
        if (categorySlug) {
            const category = await CategoryModel.findOne({ slug: categorySlug, isMainCategory: true })
            if (!category) {
                return response(false, 404, 'Category not found.')
            }

            if (subcategorySlug) {
                // Find specific subcategory
                const subcategory = await CategoryModel.findOne({ 
                    slug: subcategorySlug, 
                    parent: category._id,
                    isMainCategory: false 
                })
                if (!subcategory) {
                    return response(false, 404, 'Subcategory not found.')
                }
                query.category = subcategory._id
            } else {
                // Get all subcategories of the main category
                const subcategories = await CategoryModel.find({ 
                    parent: category._id, 
                    isMainCategory: false,
                    deletedAt: null 
                }).select('_id')
                const subcategoryIds = subcategories.map(sub => sub._id)
                query.category = { $in: subcategoryIds }
            }
        }

        // Get products with populated data for Meta catalog
        const products = await ProductModel.find(query)
            .populate({
                path: 'category',
                select: 'name slug parent',
                populate: {
                    path: 'parent',
                    select: 'name slug'
                }
            })
            .populate({
                path: 'media',
                select: 'filePath'
            })
            .populate({
                path: 'vendor',
                select: 'name'
            })
            .select('name slug category mrp sellingPrice discountPercentage description shortDescription media vendor')
            .lean()

        // Format products for Meta catalog
        const catalogProducts = products.map(product => {
            const rawImage = product.media && product.media.length > 0 ? product.media[0].filePath : null
            const mainImage = rawImage ?
                (rawImage.startsWith('http') ? rawImage : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${rawImage}`) : null
            const categoryName = product.category?.parent ?
                `${product.category.parent.name} - ${product.category.name}` :
                product.category?.name

            return {
                id: product._id,
                title: product.name,
                slug: product.slug,
                description: product.shortDescription || product.description?.substring(0, 200) + '...',
                category: categoryName,
                price: product.sellingPrice,
                compare_at_price: product.mrp,
                availability: 'in_stock', // Default to in_stock, can be enhanced later
                image_url: mainImage,
                url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product/${product.slug}`,
                brand: product.vendor?.name || 'Tiger Bhai',
                condition: 'new'
            }
        })

        if (format === 'xml') {
            // Generate XML format for Meta catalog
            const xmlContent = generateMetaCatalogXML(catalogProducts)
            return new NextResponse(xmlContent, {
                headers: {
                    'Content-Type': 'application/xml',
                },
            })
        }

        return response(true, 200, 'Meta catalog retrieved successfully.', {
            products: catalogProducts,
            total: catalogProducts.length,
            category: categorySlug,
            subcategory: subcategorySlug
        })

    } catch (error) {
        return catchError(error)
    }
}

function generateMetaCatalogXML(products) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n'
    xml += '  <channel>\n'
    xml += '    <title>Tiger Bhai Product Catalog</title>\n'
    xml += '    <link>' + (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '</link>\n'
    xml += '    <description>Product catalog for Meta (Facebook) integration</description>\n'

    products.forEach(product => {
        xml += '    <item>\n'
        xml += '      <g:id>' + product.id + '</g:id>\n'
        xml += '      <g:title>' + escapeXml(product.title) + '</g:title>\n'
        xml += '      <g:description>' + escapeXml(product.description) + '</g:description>\n'
        xml += '      <g:link>' + escapeXml(product.url) + '</g:link>\n'
        xml += '      <g:image_link>' + escapeXml(product.image_url) + '</g:image_link>\n'
        xml += '      <g:brand>' + escapeXml(product.brand) + '</g:brand>\n'
        xml += '      <g:condition>' + product.condition + '</g:condition>\n'
        xml += '      <g:availability>' + product.availability + '</g:availability>\n'
        xml += '      <g:price>' + product.price + ' BDT</g:price>\n'
        xml += '      <g:google_product_category>' + escapeXml(product.category) + '</g:google_product_category>\n'
        if (product.compare_at_price && product.compare_at_price > product.price) {
            xml += '      <g:sale_price>' + product.price + ' BDT</g:sale_price>\n'
        }
        xml += '    </item>\n'
    })

    xml += '  </channel>\n'
    xml += '</rss>'
    
    return xml
}

function escapeXml(unsafe) {
    if (!unsafe) return ''
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;'
            case '>': return '&gt;'
            case '&': return '&amp;'
            case '\'': return '&apos;'
            case '"': return '&quot;'
            default: return c
        }
    })
}
