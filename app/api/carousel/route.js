import { NextResponse } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import Carousel from "@/models/Carousel.model";
import { handleTokenVerification } from "@/lib/authentication";

// GET - Fetch all carousel items
export async function GET() {
    try {
        await connectDB();
        
        const carousels = await Carousel.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 })
            .select("-createdBy -__v");

        const response = NextResponse.json({
            success: true,
            data: carousels
        });

        // Add caching headers
        response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        
        return response;
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to fetch carousel items",
            error: error.message
        }, { status: 500 });
    }
}

// POST - Create new carousel item
export async function POST(request) {
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
        
        const user = authResult.user;

        await connectDB();
        
        const body = await request.json();
        const { title, description, image, buttonText, buttonUrl, order } = body;

        // Validate required fields
        if (!title || !image?.url || !image?.publicId) {
            return NextResponse.json({
                success: false,
                message: "Title and image are required"
            }, { status: 400 });
        }

        const carousel = new Carousel({
            title,
            description,
            image,
            buttonText: buttonText || "Shop Now",
            buttonUrl,
            order: order || 0,
            createdBy: user._id
        });

        await carousel.save();

        return NextResponse.json({
            success: true,
            message: "Carousel item created successfully",
            data: carousel
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to create carousel item",
            error: error.message
        }, { status: 500 });
    }
}
