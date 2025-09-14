import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import { z } from "zod";
import { cookies } from "next/headers";

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

        // get user data 
        const getUser = await UserModel.findOne(query).select("+password")
        if (!getUser) {
            return response(false, 400, 'Invalid login credentials.')
        }

        // Phone verification is no longer required for login

        // password verification 
        const isPasswordVerified = await getUser.comparePassword(password)

        if (!isPasswordVerified) {
            return response(false, 400, 'Invalid login credentials.')
        }

        // Direct login without OTP - create JWT token immediately
        const loggedInUserData = {
            _id: getUser._id.toString(),
            role: getUser.role,
            name: getUser.name,
            avatar: getUser.avatar,
            vendorId: getUser.vendorId ? getUser.vendorId.toString() : undefined,
        }

        const secret = new TextEncoder().encode(process.env.SECRET_KEY)
        const token = await new SignJWT(loggedInUserData)
            .setIssuedAt()
            .setExpirationTime('24h')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)

        const cookieStore = await cookies()

        cookieStore.set({
            name: 'access_token',
            value: token,
            httpOnly: process.env.NODE_ENV === 'production',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })

        return response(true, 200, 'Login successful.', loggedInUserData)
    } catch (error) {
        return catchError(error)
    }
}