import { NextResponse } from 'next/server'
import CategoryModel from '@/models/Category.model'
import ProductModel from '@/models/Product.model'
import { connectDB } from '@/lib/databaseConnection'

export async function GET(request, { params }) {
    try {
        await connectDB()

        const { slug } = params
        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit')) || 8

        // Find the category by slug (can be main or subcategory)
        const category = await CategoryModel.findOne({ 
            slug, 
            deletedAt: null 
        })
        
        if (!category) {
            return NextResponse.json({
                success: false,
                statusCode: 404,
                message: 'Category not found'
            })
        }

        // Get all subcategories if this is a main category
        let categoryIds = [category._id]
        if (category.isMainCategory) {
            const subcategories = await CategoryModel.find({
                parent: category._id,
                deletedAt: null
            }).select('_id')
            categoryIds = categoryIds.concat(subcategories.map(sub => sub._id))
        }

        // Find products in this category/subcategories
        const products = await ProductModel.find({
            category: { $in: categoryIds },
            deletedAt: null
        })
        .populate('media', 'filePath')
        .populate('vendor', 'name')
        .select('name slug sellingPrice mrp discountPercentage media vendor')
        .limit(limit)
        .lean()

        // Get total product count
        const totalProducts = await ProductModel.countDocuments({
            category: { $in: categoryIds },
            deletedAt: null
        })

        return NextResponse.json({
            success: true,
            statusCode: 200,
            message: 'Products fetched successfully',
            data: {
                category: {
                    _id: category._id,
                    name: category.name,
                    slug: category.slug,
                    image: category.image,
                    isMainCategory: category.isMainCategory
                },
                products,
                totalProducts
            }
        })

    } catch (error) {
        console.error('Error fetching category products:', error)
        return NextResponse.json({
            success: false,
            statusCode: 500,
            message: 'Internal server error'
        })
    }
}
