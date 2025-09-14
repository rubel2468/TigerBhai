import { emailVerificationLink } from "@/email/emailVerificationLink";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import { SignJWT } from "jose";
import { z } from "zod";

export async function POST(request) {
    try {
        await connectDB()
        // validation schema  
        const validationSchema = zSchema.pick({
            name: true, phone: true, password: true
        }).extend({
            email: z.string().email().optional()
        })

        const payload = await request.json()

        const validatedData = validationSchema.safeParse(payload)

        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { name, phone, password, email } = validatedData.data

        // check already registered user 
        const checkUser = await UserModel.exists({ phone })
        if (checkUser) {
            return response(false, 409, 'User already registered with this phone number.')
        }

        // new registration  

        const NewRegistration = new UserModel({
            name, phone, password, email
        })

        await NewRegistration.save()

        // Send email verification only if email is provided
        if (email) {
            const secret = new TextEncoder().encode(process.env.SECRET_KEY)
            const token = await new SignJWT({ userId: NewRegistration._id.toString() })
                .setIssuedAt()
                .setExpirationTime('1h')
                .setProtectedHeader({ alg: 'HS256' })
                .sign(secret)

            await sendMail('Email Verification request from Tiger Bhai', email, emailVerificationLink(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/${token}`))
        }

        return response(true, 200, 'Registration successful. You can now login with your phone number.')

    } catch (error) {
        catchError(error)
    }
}