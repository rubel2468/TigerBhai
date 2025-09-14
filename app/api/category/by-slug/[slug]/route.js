import { NextResponse } from 'next/server'
import CategoryModel from '@/models/Category.model'
import { connectDB } from '@/lib/databaseConnection'

export async function GET(request, { params }) {
    try {
        await connectDB()

        const { slug } = params

        // First, find the parent category by slug
        const parentCategory = await CategoryModel.findOne({ slug, isMainCategory: true })
        
        if (!parentCategory) {
            return NextResponse.json({
                success: false,
                statusCode: 404,
                message: 'Parent category not found'
            })
        }

        // Find all subcategories of this parent category
        const subcategories = await CategoryModel.find({
            parent: parentCategory._id,
            isMainCategory: { $ne: true }
        }).sort({ name: 1 })

        return NextResponse.json({
            success: true,
            statusCode: 200,
            message: 'Subcategories fetched successfully',
            data: subcategories
        })

    } catch (error) {
        console.error('Error fetching subcategories:', error)
        return NextResponse.json({
            success: false,
            statusCode: 500,
            message: 'Internal server error'
        })
    }
}
