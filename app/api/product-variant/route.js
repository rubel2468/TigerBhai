import { isAuthenticated, handleTokenVerification } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ProductVariantModel from "@/models/ProductVariant.model"
import ProductModel from "@/models/Product.model"
import VendorModel from "@/models/Vendor.model"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET(request) {
    try {
        await connectDB()
        
        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value
        
        // Check if user is admin or vendor
        let auth = await isAuthenticated('admin')
        let isVendor = false
        let vendorId = null
        
        if (!auth.isAuth) {
            // Try vendor authentication
            const tokenResult = await handleTokenVerification(token, 'vendor')
            if (!tokenResult.success) {
                return response(false, 403, 'Unauthorized.')
            }
            
            const { user } = tokenResult
            vendorId = user.vendorId
            
            // Check if vendor is approved
            const vendor = await VendorModel.findById(vendorId)
            if (!vendor || vendor.status !== 'approved') {
                return response(false, 403, 'Your vendor account is not approved yet.')
            }
            
            isVendor = true
        }

        const searchParams = request.nextUrl.searchParams

        // Extract query parameters 
        const start = parseInt(searchParams.get('start') || 0, 10)
        const size = parseInt(searchParams.get('size') || 10, 10)
        const filters = JSON.parse(searchParams.get('filters') || "[]")
        const globalFilter = searchParams.get('globalFilter') || ""
        const sorting = JSON.parse(searchParams.get('sorting') || "[]")
        const deleteType = searchParams.get('deleteType')

        // Build match query  
        let matchQuery = {}

        if (deleteType === 'SD') {
            matchQuery = { deletedAt: null }
        } else if (deleteType === 'PD') {
            matchQuery = { deletedAt: { $ne: null } }
        }

        // Add vendor filtering if it's a vendor request
        if (isVendor && vendorId) {
            // For vendors, we need to filter by products that belong to them
            // This will be handled in the aggregation pipeline
        }

        // Global search 
        if (globalFilter) {
            matchQuery["$or"] = [
                { color: { $regex: globalFilter, $options: 'i' } },
                { size: { $regex: globalFilter, $options: 'i' } },
                { sku: { $regex: globalFilter, $options: 'i' } },
                { "productData.name": { $regex: globalFilter, $options: 'i' } },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$mrp" },
                            regex: globalFilter,
                            options: 'i'
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$sellingPrice" },
                            regex: globalFilter,
                            options: 'i'
                        }
                    }
                },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$discountPercentage" },
                            regex: globalFilter,
                            options: 'i'
                        }
                    }
                },
            ]
        }

        //  Column filteration  

        filters.forEach(filter => {
            if (filter.id === 'mrp' || filter.id === 'sellingPrice' || filter.id === 'discountPercentage') {
                matchQuery[filter.id] = Number(filter.value)
            } else if (filter.id === 'product') {
                matchQuery["productData.name"] = { $regex: filter.value, $options: 'i' }
            }
            else {
                matchQuery[filter.id] = { $regex: filter.value, $options: 'i' }
            }
        });

        //   Sorting  
        let sortQuery = {}
        sorting.forEach(sort => {
            sortQuery[sort.id] = sort.desc ? -1 : 1
        });


        // Aggregate pipeline  

        const aggregatePipeline = [
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            {
                $unwind: {
                    path: "$productData", preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'media',
                    localField: 'media',
                    foreignField: '_id',
                    as: 'mediaData'
                }
            },
            // Add vendor filtering if it's a vendor request
            ...(isVendor && vendorId ? [{
                $match: {
                    "productData.vendor": new mongoose.Types.ObjectId(vendorId)
                }
            }] : []),
            { $match: matchQuery },
            { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
            { $skip: start },
            { $limit: size },
            {
                $project: {
                    _id: 1,
                    product: {
                        _id: "$productData._id",
                        name: "$productData.name"
                    },
                    color: 1,
                    size: 1,
                    sku: 1,
                    mrp: 1,
                    sellingPrice: 1,
                    discountPercentage: 1,
                    media: {
                        $arrayElemAt: ["$mediaData", 0]
                    },
                    sizesWithStock: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    deletedAt: 1
                }
            }
        ]

        // Execute query  

        const getProductVariant = await ProductVariantModel.aggregate(aggregatePipeline)

        // Get totalRowCount  
        const totalRowCount = await ProductVariantModel.countDocuments(matchQuery)


        return NextResponse.json({
            success: true,
            data: getProductVariant,
            meta: { totalRowCount }
        })

    } catch (error) {
        return catchError(error)
    }
}