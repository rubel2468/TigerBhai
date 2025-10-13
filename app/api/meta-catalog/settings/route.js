import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import CategoryModel from "@/models/Category.model"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        await connectDB()
        
        // Check authentication for admin access
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        // Get all main categories with their subcategories
        const mainCategories = await CategoryModel.find({ 
            isMainCategory: true, 
            deletedAt: null 
        }).select('_id name slug image').lean()

        const categoriesWithSubcategories = await Promise.all(
            mainCategories.map(async (category) => {
                const subcategories = await CategoryModel.find({ 
                    parent: category._id, 
                    isMainCategory: false,
                    deletedAt: null 
                }).select('_id name slug').lean()

                return {
                    ...category,
                    subcategories
                }
            })
        )

        return response(true, 200, 'Meta catalog settings retrieved successfully.', {
            categories: categoriesWithSubcategories,
            catalogUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/meta-catalog`,
            xmlCatalogUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/meta-catalog?format=xml`
        })

    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        await connectDB()
        
        // Check authentication for admin access
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        const body = await request.json()
        const { action, categorySlug, subcategorySlug } = body

        if (action === 'get_products_count') {
            let query = { deletedAt: null }

            if (categorySlug) {
                const category = await CategoryModel.findOne({ slug: categorySlug, isMainCategory: true })
                if (!category) {
                    return response(false, 404, 'Category not found.')
                }

                if (subcategorySlug) {
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
                    const subcategories = await CategoryModel.find({ 
                        parent: category._id, 
                        isMainCategory: false,
                        deletedAt: null 
                    }).select('_id')
                    const subcategoryIds = subcategories.map(sub => sub._id)
                    query.category = { $in: subcategoryIds }
                }
            }

            const ProductModel = (await import("@/models/Product.model")).default
            const productCount = await ProductModel.countDocuments(query)

            return response(true, 200, 'Product count retrieved successfully.', {
                count: productCount,
                category: categorySlug,
                subcategory: subcategorySlug
            })
        }

        return response(false, 400, 'Invalid action.')

    } catch (error) {
        return catchError(error)
    }
}
