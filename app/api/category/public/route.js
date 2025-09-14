import { connectDB } from "@/lib/databaseConnection"
import { catchError } from "@/lib/helperFunction"
import CategoryModel from "@/models/Category.model"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        await connectDB()

        const searchParams = request.nextUrl.searchParams
        const size = parseInt(searchParams.get('size') || 100, 10)

        // Get only active categories (not deleted)
        const categories = await CategoryModel.find(
            { deletedAt: null },
            { _id: 1, name: 1, slug: 1 }
        ).limit(size).sort({ name: 1 })

        return NextResponse.json({
            success: true,
            data: categories
        })

    } catch (error) {
        return catchError(error)
    }
}
