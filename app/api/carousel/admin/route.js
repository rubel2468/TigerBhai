import { NextResponse } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import Carousel from "@/models/Carousel.model";
import { handleTokenVerification } from "@/lib/authentication";

// GET - Fetch all carousel items for admin
export async function GET(request) {
    try {
        const token = request.cookies.get("access_token")?.value;
        
        const authResult = await handleTokenVerification(token, "admin");
        
        if (!authResult.success) {
            return NextResponse.json({
                success: false,
                message: authResult.message,
                error: authResult.error
            }, { status: authResult.status });
        }

        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = parseInt(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const carousels = await Carousel.find()
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "name email");

        const total = await Carousel.countDocuments();

        return NextResponse.json({
            success: true,
            data: carousels,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to fetch carousel items",
            error: error.message
        }, { status: 500 });
    }
}
