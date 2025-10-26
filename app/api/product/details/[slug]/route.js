import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import MediaModel from "@/models/Media.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import ReviewModel from "@/models/Review.model";

export async function GET(request, { params }) {
    try {
        const start = Date.now()
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

        // get product (project only needed fields)
        const getProduct = await ProductModel.findOne(filter)
            .select('name slug description shortDescription offer companyDetails media videos vendorSettings vendor')
            .populate('media', 'filePath')
            .lean()

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

        let variant = await ProductVariantModel.findOne(variantFilter).populate('media', 'filePath').lean()

        // If no variant found and no specific size/color requested, get the first available variant
        if (!variant && !size && !color) {
            const firstVariant = await ProductVariantModel.findOne({ product: getProduct._id }).populate('media', 'filePath').lean()
            if (firstVariant) {
                variant = firstVariant
            }
        }

        // If still no variant found, create a fallback variant from product data
        if (!variant) {
            variant = {
                _id: getProduct._id,
                color: 'default',
                size: 'default',
                mrp: getProduct.mrp || 0,
                sellingPrice: getProduct.sellingPrice || 0,
                discountPercentage: getProduct.discountPercentage || 0,
                stock: 0,
                media: getProduct.media || [],
                recommendedFor: ''
            }
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

        // If no variants exist, provide default values
        const colors = getColor.length > 0 ? getColor : ['default']
        const sizes = getSize.length > 0 ? getSize.map(item => item.size) : ['default']


        // get review  

        const review = await ReviewModel.countDocuments({ product: getProduct._id })

        // group variants by color with size entries
        const allVariants = await ProductVariantModel.find({ product: getProduct._id })
            .select('color size mrp sellingPrice discountPercentage media stock recommendedFor')
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
        
        // If no variants exist, create a default variant structure
        let variantsByColor = Array.from(variantsByColorMap.entries()).map(([color, entries]) => ({ color, entries }))
        if (variantsByColor.length === 0) {
            variantsByColor = [{
                color: 'default',
                entries: [{
                    size: 'default',
                    variantId: getProduct._id,
                    stock: 0,
                    mrp: getProduct.mrp || 0,
                    sellingPrice: getProduct.sellingPrice || 0,
                    discountPercentage: getProduct.discountPercentage || 0,
                    media: getProduct.media || [],
                    recommendedFor: ''
                }]
            }]
        }

        const productData = {
            product: getProduct,
            variant: variant,
            colors: colors,
            sizes: sizes,
            reviewCount: review,
            variantsByColor
        }

        const durationMs = Date.now() - start
        const res = response(true, 200, 'Product data found.', productData)
        res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800')
        return res

    } catch (error) {
        return catchError(error)
    }
}