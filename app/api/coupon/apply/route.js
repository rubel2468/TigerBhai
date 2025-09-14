import { connectDB } from "@/lib/databaseConnection";
import { catchError, response, formatZodErrors } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import CouponModel from "@/models/Coupon.model";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const couponFormSchema = zSchema.pick({
            code: true,
            minShoppingAmount: true
        })

        const validate = couponFormSchema.safeParse(payload)
        if (!validate.success) {
            const fieldErrors = formatZodErrors(validate.error)
            return response(false, 400, 'Validation failed', { errors: fieldErrors })
        }

        const { code, minShoppingAmount } = validate.data

        const couponData = await CouponModel.findOne({ code }).lean()
        if (!couponData) {
            return response(false, 400, 'Invalid or expired coupon code.')
        }

        if (new Date() > couponData.validity) {
            return response(false, 400, 'Coupon code expired.')
        }

        if (minShoppingAmount < couponData.minShoppingAmount) {
            return response(false, 400, 'In-sufficient shopping amount.')
        }


        return response(true, 200, 'Coupon applied successfully.', { discountPercentage: couponData.discountPercentage })


    } catch (error) {
        return catchError(error)
    }
}