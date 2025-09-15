import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import MediaModel from "@/models/Media.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import ReviewModel from "@/models/Review.model";

export async function GET(request, { params }) {
    try {

        await connectDB()

        const getParams = await params
        const slug = getParams.slug

        const searchParams = request.nextUrl.searchParams
        const size = searchParams.get('size')
        const color = searchParams.get('color')


        const filter = {
            deletedAt: null
        }

        if (!slug) {
            return response(false, 404, 'Product not found.')
        }

        filter.slug = slug

        // get product 
        const getProduct = await ProductModel.findOne(filter).populate('media', 'filePath').lean()

        if (!getProduct) {
            return response(false, 404, 'Product not found.')
        }

        // get product variant 
        const variantFilter = {
            product: getProduct._id
        }

        if (size) {
            variantFilter.size = size
        }
        if (color) {
            variantFilter.color = color
        }

        const variant = await ProductVariantModel.findOne(variantFilter).populate('media', 'filePath').lean()

        if (!variant) {
            return response(false, 404, 'Product not found.')
        }

        // get color and size (sizes filtered by selected color if provided)

        const getColor = await ProductVariantModel.distinct('color', { product: getProduct._id })

        const sizeMatch = { product: getProduct._id }
        if (color) {
            sizeMatch.color = color
        }

        const getSize = await ProductVariantModel.aggregate([
            { $match: sizeMatch },
            { $sort: { _id: 1 } },
            {
                $group: {
                    _id: "$size",
                    first: { $first: "$_id" }
                }
            },
            { $sort: { first: 1 } },
            { $project: { _id: 0, size: "$_id" } }
        ])


        // get review  

        const review = await ReviewModel.countDocuments({ product: getProduct._id })

        // group variants by color with size entries
        const allVariants = await ProductVariantModel.find({ product: getProduct._id })
            .select('color size sku mrp sellingPrice discountPercentage media stock recommendedFor')
            .populate('media', 'filePath')
            .lean()

        const variantsByColorMap = new Map()
        for (const v of allVariants) {
            if (!variantsByColorMap.has(v.color)) {
                variantsByColorMap.set(v.color, [])
            }
            variantsByColorMap.get(v.color).push({
                size: v.size,
                variantId: v._id,
                stock: v.stock ?? 0,
                mrp: v.mrp,
                sellingPrice: v.sellingPrice,
                discountPercentage: v.discountPercentage,
                media: v.media, // single populated Media doc
                recommendedFor: v.recommendedFor || ''
            })
        }
        const variantsByColor = Array.from(variantsByColorMap.entries()).map(([color, entries]) => ({ color, entries }))


        const productData = {
            product: getProduct,
            variant: variant,
            colors: getColor,
            sizes: getSize.length ? getSize.map(item => item.size) : [],
            reviewCount: review,
            variantsByColor
        }

        return response(true, 200, 'Product data found.', productData)

    } catch (error) {
        return catchError(error)
    }
}