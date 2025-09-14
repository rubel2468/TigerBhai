import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response, formatZodErrors } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import ReviewModel from "@/models/Review.model"

export async function POST(request) {
    try {
        const auth = await isAuthenticated('user')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const schema = zSchema.pick({
            product: true,
            userId: true,
            rating: true,
            title: true,
            review: true
        })

        const validate = schema.safeParse(payload)
        if (!validate.success) {
            const fieldErrors = formatZodErrors(validate.error)
            return response(false, 400, 'Validation failed', { errors: fieldErrors })
        }

        const { product, userId, rating, title, review } = validate.data

        const newReview = new ReviewModel({
            product: product,
            user: userId,
            rating: rating,
            title: title,
            review: review,
        })

        await newReview.save()

        return response(true, 200, 'Your review submitted successfully.')

    } catch (error) {
        return catchError(error)
    }
}