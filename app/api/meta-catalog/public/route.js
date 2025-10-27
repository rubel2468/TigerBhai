import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import CategoryModel from "@/models/Category.model"
import MediaModel from "@/models/Media.model"
import VendorModel from "@/models/Vendor.model"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const categorySlug = searchParams.get('category')
        const subcategorySlug = searchParams.get('subcategory')
        const format = searchParams.get('format') || 'xml'

        let query = { deletedAt: null }

        // If specific category is requested
        if (categorySlug) {
            const category = await CategoryModel.findOne({ slug: categorySlug, isMainCategory: true })
            if (!category) {
                return new NextResponse('Category not found', { status: 404 })
            }

            if (subcategorySlug) {
                // Find specific subcategory
                const subcategory = await CategoryModel.findOne({ 
                    slug: subcategorySlug, 
                    parent: category._id,
                    isMainCategory: false 
                })
                if (!subcategory) {
                    return new NextResponse('Subcategory not found', { status: 404 })
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
                path: 'media',
                select: 'filePath'
            })
            .populate({
                path: 'category',
                select: 'name slug parent',
                populate: {
                    path: 'parent',
                    select: 'name slug'
                }
            })
            .populate({
                path: 'vendor',
                select: 'name'
            })
            .select('name slug category mrp sellingPrice discountPercentage description shortDescription media vendor')
            .lean()

        // Get variants for these products
        const productIds = products.map(p => p._id)
        const variants = await ProductVariantModel.find({ product: { $in: productIds }, deletedAt: null })
            .populate({
                path: 'media',
                select: 'filePath'
            })
            .select('product color size mrp sellingPrice stock media')
            .lean()

        // Format variants for Meta catalog
        const catalogProducts = variants.map(variant => {
            const product = products.find(p => p._id.toString() === variant.product.toString())
            if (!product) return null

            const rawImage = variant.media?.filePath || (product.media && product.media.length > 0 ? product.media[0].filePath : null)
            const mainImage = rawImage ?
                (rawImage.startsWith('http') ? rawImage : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${rawImage}`) : null
            const categoryName = product.category?.parent ?
                `${product.category.parent.name} - ${product.category.name}` :
                product.category?.name || 'Product'

            const availability = variant.stock > 0 ? 'in_stock' : 'out_of_stock'

            return {
                id: variant._id,
                title: `${product.name} - ${variant.color} ${variant.size}`,
                slug: product.slug,
                description: product.shortDescription || (product.description ? product.description.substring(0, 200) + '...' : ''),
                category: categoryName,
                price: variant.sellingPrice,
                compare_at_price: variant.mrp,
                availability: availability,
                image_url: mainImage,
                url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product/${product.slug}?size=${variant.size}&color=${variant.color}`,
                brand: product.vendor?.name || 'Tiger Bhai',
                condition: 'new'
            }
        }).filter(Boolean)

        if (format === 'xml') {
            // Generate XML format for Meta catalog
            const xmlContent = generateMetaCatalogXML(catalogProducts)
            return new NextResponse(xmlContent, {
                headers: {
                    'Content-Type': 'application/xml',
                    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                },
            })
        }

        // Return JSON format
        return new NextResponse(JSON.stringify({
            success: true,
            statusCode: 200,
            message: 'Meta catalog retrieved successfully.',
            data: {
                products: catalogProducts,
                total: catalogProducts.length,
                category: categorySlug,
                subcategory: subcategorySlug
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        })

    } catch (error) {
        console.error('Meta catalog error:', error)
        return new NextResponse('Internal server error', { status: 500 })
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
