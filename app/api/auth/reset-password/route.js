import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import { z } from "zod";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()
        
        const validationSchema = z.object({
            phone: z.string().optional(),
            email: z.string().email().optional(),
            password: z.string()
        }).refine((data) => data.phone || data.email, {
            message: "Either phone number or email is required",
            path: ["phone", "email"]
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { phone, email, password } = validatedData.data

        // Build query to find user by phone or email
        let query = { deletedAt: null }
        if (phone) {
            query.phone = phone
        } else if (email) {
            query.email = email
        }

        const getUser = await UserModel.findOne(query).select("+password")
        if (!getUser) {
            return response(false, 404, 'User not found.')
        }

        getUser.password = password
        await getUser.save()

        return response(true, 200, 'Password updated successfully.')
    } catch (error) {
        return catchError(error)
    }
}
