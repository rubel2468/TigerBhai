import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError,  response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import CategoryModel from "@/models/Category.model"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const schema = zSchema.pick({
            name: true, slug: true, image: true, parent: true, isMainCategory: true
        })

        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { name, slug, image, parent, isMainCategory } = validate.data

        // Handle parent field - set to null if empty string or null
        const parentId = parent && parent.trim() !== '' ? parent : null

        const newCategory = new CategoryModel({
            name, slug, image, parent: parentId, isMainCategory
        })

        await newCategory.save()

        return response(true, 200, 'Category added successfully.')

    } catch (error) {
        return catchError(error)
    }
}