import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import MediaModel from "@/models/Media.model";

export async function GET() {
    try {
        await connectDB()

        const getProduct = await ProductModel.find({ deletedAt: null }).populate('media').limit(6).lean()

        if (!getProduct) {
            return response(false, 404, 'Product not found.')
        }

        const result = response(true, 200, 'Product found.', getProduct)
        
        // Add caching headers
        result.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
        
        return result

    } catch (error) {
        return catchError(error)
    }
}