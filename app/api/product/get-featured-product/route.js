import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import MediaModel from "@/models/Media.model";

export async function GET() {
    try {
        await connectDB()

        const getProduct = await ProductModel.find({ deletedAt: null }).populate('media').sort({ createdAt: -1 }).limit(8).lean()

        if (!getProduct) {
            return response(false, 404, 'Product not found.')
        }

        const result = response(true, 200, 'Product found.', getProduct)
        
        // Add caching headers
        result.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');
        
        return result

    } catch (error) {
        return catchError(error)
    }
}