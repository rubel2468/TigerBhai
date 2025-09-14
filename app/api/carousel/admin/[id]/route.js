import { NextResponse } from "next/server";
import { connectDB } from "@/lib/databaseConnection";
import Carousel from "@/models/Carousel.model";
import { handleTokenVerification } from "@/lib/authentication";

// GET - Fetch single carousel item
export async function GET(request, { params }) {
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
        
        const carousel = await Carousel.findById(params.id)
            .populate("createdBy", "name email");

        if (!carousel) {
            return NextResponse.json({
                success: false,
                message: "Carousel item not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: carousel
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to fetch carousel item",
            error: error.message
        }, { status: 500 });
    }
}

// PUT - Update carousel item
export async function PUT(request, { params }) {
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
        
        const body = await request.json();
        const { title, description, image, buttonText, buttonUrl, isActive, order } = body;

        const carousel = await Carousel.findById(params.id);

        if (!carousel) {
            return NextResponse.json({
                success: false,
                message: "Carousel item not found"
            }, { status: 404 });
        }

        // Update fields
        if (title !== undefined) carousel.title = title;
        if (description !== undefined) carousel.description = description;
        if (image !== undefined) carousel.image = image;
        if (buttonText !== undefined) carousel.buttonText = buttonText;
        if (buttonUrl !== undefined) carousel.buttonUrl = buttonUrl;
        if (isActive !== undefined) carousel.isActive = isActive;
        if (order !== undefined) carousel.order = order;

        await carousel.save();

        return NextResponse.json({
            success: true,
            message: "Carousel item updated successfully",
            data: carousel
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to update carousel item",
            error: error.message
        }, { status: 500 });
    }
}

// DELETE - Delete carousel item
export async function DELETE(request, { params }) {
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
        
        const carousel = await Carousel.findById(params.id);

        if (!carousel) {
            return NextResponse.json({
                success: false,
                message: "Carousel item not found"
            }, { status: 404 });
        }

        await Carousel.findByIdAndDelete(params.id);

        return NextResponse.json({
            success: true,
            message: "Carousel item deleted successfully"
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to delete carousel item",
            error: error.message
        }, { status: 500 });
    }
}
