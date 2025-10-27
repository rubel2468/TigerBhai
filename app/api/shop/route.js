import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";
import ProductModel from "@/models/Product.model";
import MediaModel from "@/models/Media.model";

export async function GET(request) {
    try {

        await connectDB()

        const searchParams = request.nextUrl.searchParams

        // get filters from query params  
        const size = searchParams.get('size')
        const color = searchParams.get('color')
        const minPrice = parseInt(searchParams.get('minPrice')) || 0
        const maxPrice = parseInt(searchParams.get('maxPrice')) || 100000
        const categorySlug = searchParams.get('category')
        const search = searchParams.get('q')



        // pagination 
        const limit = parseInt(searchParams.get('limit')) || 12
        const page = parseInt(searchParams.get('page')) || 0
        const skip = page * limit


        // sorting 
        const sortOption = searchParams.get('sort') || 'default_sorting'
        let sortquery = {}
        if (sortOption === 'default_sorting') sortquery = { createdAt: -1 }
        if (sortOption === 'asc') sortquery = { name: 1 }
        if (sortOption === 'desc') sortquery = { name: -1 }
        if (sortOption === 'price_low_high') sortquery = { sellingPrice: 1 }
        if (sortOption === 'price_high_low') sortquery = { sellingPrice: -1 }


        // find category by slug 
        let categoryId = []
        if (categorySlug) {
            const slugs = categorySlug.split(',')
            const categoryData = await CategoryModel.find({ deletedAt: null, slug: { $in: slugs } }).select('_id').lean()
            categoryId = categoryData.map(category => category._id)
        }

        // match stage
        let matchStage = {}
        if (categoryId.length > 0) matchStage.category = { $in: categoryId }  // filter by category

        if (minPrice > 0 || maxPrice < 100000) {
            matchStage.sellingPrice = { $gte: minPrice, $lte: maxPrice }
        }

        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
                { $expr: { $regexMatch: { input: { $toString: "$sellingPrice" }, regex: search, options: "i" } } }
            ]
        }


        // Get total count for pagination calculation
        const totalProducts = await ProductModel.aggregate([
            { $match: matchStage },
            { $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }},
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            ...(search ? [{ $match: { 'category.name': { $regex: search, $options: 'i' } } }] : []),
            { $count: "total" }
        ]).then(res => res[0]?.total || 0)
        const totalPages = Math.ceil(totalProducts / limit)

        // Get products with proper pagination and media population
        const products = await ProductModel.aggregate([
            { $match: matchStage },
            { $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }},
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            ...(search ? [{ $match: { 'category.name': { $regex: search, $options: 'i' } } }] : []),
            { $lookup: {
                from: 'medias',
                localField: 'media',
                foreignField: '_id',
                as: 'media'
            }},
            { $sort: sortquery },
            { $skip: skip },
            { $limit: limit }
        ])

        // check if more data exists 
        let nextPage = null
        if (page + 1 < totalPages) {
            nextPage = page + 1
        }

        const res = response(true, 200, 'Product data found.', {
            products,
            nextPage,
            totalPages,
            totalProducts,
            currentPage: page
        })
        // Add caching for product listings (5 minutes for dynamic content)
        res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800')
        return res

    } catch (error) {
        return catchError(error)
    }
}
