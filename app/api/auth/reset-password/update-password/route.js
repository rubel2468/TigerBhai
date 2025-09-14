import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";

export async function PUT(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const validationSchema = zSchema.pick({
            phone: true, password: true
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { phone, password } = validatedData.data

        const getUser = await UserModel.findOne({ deletedAt: null, phone }).select("+password")

        if (!getUser) {
            return response(false, 404, 'User not found.')
        }

        getUser.password = password
        await getUser.save()

        return response(true, 200, 'Password update success.')
    } catch (error) {
        catchError(error)
    }
}