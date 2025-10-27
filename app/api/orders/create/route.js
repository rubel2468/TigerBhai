import { orderNotification } from "@/email/orderNotification";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response, formatZodErrors } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { calculateCommission } from "@/lib/commissionCalculator";
import { z } from "zod";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const productSchema = z.object({
            productId: z.string().length(24, 'Invalid product id format'),
            variantId: z.string().length(24, 'Invalid variant id format'),
            name: z.string().min(1),
            qty: z.number().min(1),
            mrp: z.number().nonnegative(),
            sellingPrice: z.number().nonnegative(),
        })

        const orderSchema = zSchema.pick({
            name: true, email: true, phone: true, address: true, ordernote: true
        }).extend({
            userId: z.string().optional().or(z.literal("")),
            subtotal: z.number().nonnegative(),
            discount: z.number().nonnegative().optional().default(0),
            couponDiscountAmount: z.number().nonnegative(),
            totalAmount: z.number().nonnegative(),
            products: z.array(productSchema).min(1, 'At least one product is required')
        })

        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            const fieldErrors = formatZodErrors(validate.error)
            return response(false, 400, 'Validation failed', { errors: fieldErrors })
        }

        const validatedData = validate.data

        // Compute monetary fields on the server to avoid integrity issues
        const computedSubtotal = validatedData.products.reduce((sum, p) => sum + (p.sellingPrice * p.qty), 0)
        const computedDiscount = validatedData.couponDiscountAmount  // Use coupon discount as the main discount
        const computedCouponDiscount = 0  // Set coupon discount to 0 to avoid double deduction
        const computedTotalAmount = Math.max(0, computedSubtotal - computedDiscount)

        if (computedSubtotal <= 0) {
            return response(false, 400, 'Invalid order: subtotal must be greater than 0')
        }

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        // Group products by vendor and calculate vendor-specific order items
        const vendorOrderItems = {}
        
        for (const product of validatedData.products) {
            // Get product details to find vendor
            const productDoc = await ProductModel.findById(product.productId)
            const variantDoc = await ProductVariantModel.findById(product.variantId)
            
            if (!productDoc) {
                return response(false, 404, `Product not found: ${product.productId}`)
            }
            
            if (!variantDoc) {
                return response(false, 404, `Product variant not found: ${product.variantId}`)
            }
            
            const vendorId = productDoc.vendor
            
            // If no vendor is assigned, we'll handle it in the fallback logic below
            if (!vendorId) {
                continue
            }
            
            // Initialize vendor order item if not exists
            if (!vendorOrderItems[vendorId]) {
                vendorOrderItems[vendorId] = {
                    vendor: vendorId,
                    products: [],
                    subtotal: 0,
                    commission: 0,
                    vendorEarning: 0
                }
            }
            
            // Calculate commission and vendor earning
            const itemTotal = product.sellingPrice * product.qty
            const commissionData = calculateCommission(itemTotal)
            const commission = commissionData.commission
            const vendorEarning = commissionData.vendorEarning
            
            // Add product to vendor order item
            vendorOrderItems[vendorId].products.push({
                productId: product.productId,
                variantId: product.variantId,
                name: product.name,
                qty: product.qty,
                mrp: product.mrp,
                sellingPrice: product.sellingPrice,
                vendorPrice: vendorEarning / product.qty // Price per unit after commission
            })
            
            vendorOrderItems[vendorId].subtotal += itemTotal
            vendorOrderItems[vendorId].commission += commission
            vendorOrderItems[vendorId].vendorEarning += vendorEarning
        }

        // Check if any vendor order items were created
        const vendorOrderItemsArray = Object.values(vendorOrderItems)
        
        // If no vendors are found, create a default order item for admin
        if (vendorOrderItemsArray.length === 0) {
            vendorOrderItemsArray.push({
                vendor: null, // Admin order
                products: validatedData.products.map(product => ({
                    productId: product.productId,
                    variantId: product.variantId,
                    name: product.name,
                    qty: product.qty,
                    mrp: product.mrp,
                    sellingPrice: product.sellingPrice,
                    vendorPrice: product.sellingPrice // No commission for admin orders
                })),
                subtotal: computedSubtotal,
                commission: 0,
                vendorEarning: computedSubtotal,
                status: 'pending'
            })
        }
        
        // Final guard: ensure aggregated products are present
        const aggregatedProductsCount = vendorOrderItemsArray.reduce((acc, item) => acc + (item.products?.length || 0), 0)
        if (aggregatedProductsCount === 0) {
            return response(false, 400, 'Invalid order: no products present in order items')
        }
        
        const newOrder = await OrderModel.create({
            user: validatedData.userId && validatedData.userId.trim() !== '' ? validatedData.userId : null,
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            address: validatedData.address,
            ordernote: validatedData.ordernote,
            products: validatedData.products, // Keep legacy field for backward compatibility
            orderItems: vendorOrderItemsArray, // New multivendor structure
            discount: computedDiscount,
            couponDiscountAmount: computedCouponDiscount,
            totalAmount: computedTotalAmount,
            deliveryCharge: 0, // Set default delivery charge to 0
            subtotal: computedSubtotal,
            paymentMethod: 'cod',
            orderNumber: orderNumber,
            status: 'pending'
        })

        // Only send email if email is provided and not empty
        if (validatedData.email && validatedData.email.trim() !== '') {
            try {
                const mailData = {
                    order_id: orderNumber,
                    orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${orderNumber}`
                }

                await sendMail('Order placed successfully.', validatedData.email, orderNotification(mailData))

            } catch (error) {
                // Email sending failed, but order was created successfully
            }
        }

        return response(true, 200, 'Order placed successfully.', { orderNumber })

    } catch (error) {
        return catchError(error)
    }
}
