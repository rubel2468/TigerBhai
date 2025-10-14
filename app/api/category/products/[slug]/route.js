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

        // Find the subcategory by slug
        const subcategory = await CategoryModel.findOne({ slug, isMainCategory: { $ne: true } })
        
        if (!subcategory) {
            return NextResponse.json({
                success: false,
                statusCode: 404,
                message: 'Subcategory not found'
            })
        }

        // Find products in this subcategory
        const products = await ProductModel.find({
            category: subcategory._id,
            deletedAt: null
        })
        .populate('media', 'filePath')
        .populate('vendor', 'name')
        .select('name slug sellingPrice mrp discountPercentage media vendor')
        .limit(limit)
        .lean()

        return NextResponse.json({
            success: true,
            statusCode: 200,
            message: 'Products fetched successfully',
            data: {
                subcategory: {
                    _id: subcategory._id,
                    name: subcategory.name,
                    slug: subcategory.slug,
                    image: subcategory.image
                },
                products
            }
        })

    } catch (error) {
        console.error('Error fetching subcategory products:', error)
        return NextResponse.json({
            success: false,
            statusCode: 500,
            message: 'Internal server error'
        })
    }
}
