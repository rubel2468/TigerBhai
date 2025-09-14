import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";

import CategoryModel from "@/models/Category.model";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {

        await connectDB()

        const getMainCategories = await CategoryModel.find({ 
            deletedAt: null, 
            isMainCategory: true 
        }).select('_id name slug image').lean()

        const getSubCategories = await CategoryModel.find({ 
            deletedAt: null, 
            isMainCategory: false 
        }).select('_id name slug image parent').lean()

        if (!getMainCategories) {
            return response(false, 404, 'Category not found.')
        }

        const result = response(true, 200, 'Category found.', {
            mainCategories: getMainCategories,
            subCategories: getSubCategories
        })

        return result

    } catch (error) {
        return catchError(error)
    }
}