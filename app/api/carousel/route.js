import { connectDB } from "@/lib/databaseConnection"
import { catchError } from "@/lib/helperFunction"
import CarouselModel from "@/models/Carousel.model"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        await connectDB()

        const carouselData = await CarouselModel.find({ isActive: true }).sort({ order: 1 })

        return NextResponse.json({
            success: true,
            data: carouselData
        })

    } catch (error) {
        return catchError(error)
    }
}
