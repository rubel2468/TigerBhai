import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import ReviewModel from "@/models/Review.model"
import mongoose from "mongoose"

export async function GET(request) {
    try {
        await connectDB()
        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit')) || 10

        // Get recent reviews with user data and product info
        const aggregation = [
            {
                $lookup: {
                    from: "users",
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userData'
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            {
                $unwind: { path: '$userData', preserveNullAndEmptyArrays: true }
            },
            {
                $unwind: { path: '$productData', preserveNullAndEmptyArrays: true }
            },
            {
                $match: {
                    deletedAt: null,
                    rating: { $gte: 4 } // Only show 4+ star reviews for homepage
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: limit
            },
            {
                $project: {
                    _id: 1,
                    reviewedBy: '$userData.name',
                    avatar: "$userData.avatar",
                    rating: 1,
                    title: 1,
                    review: 1,
                    createdAt: 1,
                    productName: '$productData.name',
                    verified: { $literal: true } // Mark as verified for homepage display
                }
            }
        ]

        const reviews = await ReviewModel.aggregate(aggregation)

        // Get review statistics
        const statsAggregation = [
            {
                $match: {
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            }
        ]

        const statsResult = await ReviewModel.aggregate(statsAggregation)
        const stats = statsResult[0] || { totalReviews: 0, averageRating: 0, ratingDistribution: [] }

        // Calculate rating distribution
        const ratingDistribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        }

        stats.ratingDistribution.forEach(rating => {
            if (ratingDistribution.hasOwnProperty(rating)) {
                ratingDistribution[rating]++
            }
        })

        const reviewStats = {
            totalReviews: stats.totalReviews,
            averageRating: Math.round(stats.averageRating * 10) / 10,
            ratingDistribution
        }

        return response(true, 200, 'Homepage reviews data.', { 
            reviews, 
            stats: reviewStats 
        })

    } catch (error) {
        return catchError(error)
    }
}
