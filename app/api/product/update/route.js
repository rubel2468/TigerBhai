import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { zSchema } from "@/lib/zodSchema"
import ProductModel from "@/models/Product.model"
import { encode } from "entities"
import { revalidateTag } from "next/cache"

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const schema = zSchema.pick({
            _id: true,
            name: true,
            slug: true,
            category: true,
            mrp: true,
            sellingPrice: true,
            discountPercentage: true,
            description: true,
            shortDescription: true,
            whatsappLink: true,
            offer: true,
            companyDetails: true,
            media: true,
            videos: true
        })
        const validate = schema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const validatedData = validate.data

        const getProduct = await ProductModel.findOne({ deletedAt: null, _id: validatedData._id })
        if (!getProduct) {
            return response(false, 404, 'Data not found.')
        }

        getProduct.name = validatedData.name
        getProduct.slug = validatedData.slug
        getProduct.category = validatedData.category
        getProduct.mrp = validatedData.mrp
        getProduct.sellingPrice = validatedData.sellingPrice
        getProduct.discountPercentage = validatedData.discountPercentage
        getProduct.description = encode(validatedData.description)
        getProduct.shortDescription = validatedData.shortDescription || ''
        getProduct.whatsappLink = validatedData.whatsappLink || ''
        getProduct.offer = validatedData.offer || ''
        getProduct.companyDetails = validatedData.companyDetails || ''
        getProduct.media = validatedData.media
        getProduct.videos = validatedData.videos || []
        await getProduct.save()

        // Revalidate caches for product listings, featured and product details
        try {
            revalidateTag('shop-products')
            revalidateTag('featured-products')
            revalidateTag(`product:${getProduct.slug}`)
        } catch (_) { /* noop in dev */ }

        return response(true, 200, 'Product updated successfully.')

    } catch (error) {
        return catchError(error)
    }
}