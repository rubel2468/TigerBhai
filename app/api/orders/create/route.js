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
            discount: z.number().nonnegative(),
            couponDiscountAmount: z.number().nonnegative(),
            totalAmount: z.number().nonnegative(),
            products: z.array(productSchema)
        })

        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            const fieldErrors = formatZodErrors(validate.error)
            return response(false, 400, 'Validation failed', { errors: fieldErrors })
        }

        const validatedData = validate.data

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
                console.warn(`Product ${product.name} does not have a vendor assigned, will be added to admin order item`)
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
            console.log('No vendors found for products, creating default admin order item')
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
                subtotal: validatedData.subtotal,
                commission: 0,
                vendorEarning: validatedData.subtotal,
                status: 'pending'
            })
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
            discount: validatedData.discount,
            couponDiscountAmount: validatedData.couponDiscountAmount,
            totalAmount: validatedData.totalAmount,
            deliveryCharge: 0, // Set default delivery charge to 0
            subtotal: validatedData.subtotal,
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
                console.log('Email sending failed:', error)
            }
        }

        return response(true, 200, 'Order placed successfully.', { orderNumber })

    } catch (error) {
        return catchError(error)
    }
}
