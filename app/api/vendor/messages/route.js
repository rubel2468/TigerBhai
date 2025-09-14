import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { handleTokenVerification } from "@/lib/authentication";
import VendorModel from "@/models/Vendor.model";
import MessageModel from "@/models/Message.model";
import UserModel from "@/models/User.model";
import { z } from "zod";
import { cookies } from "next/headers";

const messageSchema = z.object({
    receiver: z.string().min(1, "Receiver is required"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required"),
    type: z.enum(['general', 'order_inquiry', 'product_question', 'support', 'announcement']).optional(),
    order: z.string().optional(),
    product: z.string().optional()
});

export async function GET(request) {
    try {
        await connectDB()

        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value

        const tokenResult = await handleTokenVerification(token, 'vendor')
        if (!tokenResult.success) {
            return response(false, tokenResult.status, tokenResult.message)
        }

        const { user } = tokenResult
        const vendorId = user.vendorId

        // Get vendor information
        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return response(false, 404, 'Vendor not found')
        }

        if (vendor.status !== 'approved') {
            return response(false, 403, 'Vendor account is not approved yet')
        }

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page')) || 1
        const limit = parseInt(searchParams.get('limit')) || 10

        // Build query
        const query = {
            $or: [
                { sender: user._id },
                { receiver: user._id }
            ],
            deletedAt: null
        }

        if (type && type !== 'all') {
            query.type = type
        }

        if (status && status !== 'all') {
            query.status = status
        }

        // Calculate skip for pagination
        const skip = (page - 1) * limit

        // Get messages with pagination
        const messages = await MessageModel.find(query)
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .populate('order', 'orderNumber')
            .populate('product', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        // Get total count for pagination
        const totalMessages = await MessageModel.countDocuments(query)

        // Get unread message count
        const unreadCount = await MessageModel.countDocuments({
            receiver: user._id,
            status: { $ne: 'read' },
            deletedAt: null
        })

        // Get message statistics
        const stats = await MessageModel.aggregate([
            {
                $match: {
                    $or: [
                        { sender: user._id },
                        { receiver: user._id }
                    ],
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ])

        const result = {
            messages: messages.map(msg => ({
                _id: msg._id,
                sender: msg.sender,
                receiver: msg.receiver,
                subject: msg.subject,
                message: msg.message,
                type: msg.type,
                order: msg.order,
                product: msg.product,
                status: msg.status,
                threadId: msg.threadId,
                isReply: msg.isReply,
                attachments: msg.attachments,
                readAt: msg.readAt,
                createdAt: msg.createdAt,
                updatedAt: msg.updatedAt
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasNextPage: page < Math.ceil(totalMessages / limit),
                hasPrevPage: page > 1
            },
            stats: {
                unreadCount,
                typeStats: stats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count
                    return acc
                }, {})
            }
        }

        return response(true, 200, 'Messages retrieved successfully', result)

    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value

        const tokenResult = await handleTokenVerification(token, 'vendor')
        if (!tokenResult.success) {
            return response(false, tokenResult.status, tokenResult.message)
        }

        const { user } = tokenResult
        const vendorId = user.vendorId

        // Get vendor information
        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return response(false, 404, 'Vendor not found')
        }

        if (vendor.status !== 'approved') {
            return response(false, 403, 'Vendor account is not approved yet')
        }

        const payload = await request.json()

        // Validate the message data
        const validatedData = messageSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 400, 'Invalid input data', validatedData.error)
        }

        const { receiver, subject, message, type = 'general', order, product } = validatedData.data

        // Verify receiver exists
        const receiverUser = await UserModel.findById(receiver)
        if (!receiverUser) {
            return response(false, 404, 'Receiver not found')
        }

        // Generate thread ID for new conversations
        const threadId = new mongoose.Types.ObjectId()

        // Create message
        const newMessage = new MessageModel({
            sender: user._id,
            receiver: receiver,
            subject,
            message,
            type,
            order: order || null,
            product: product || null,
            threadId,
            status: 'sent'
        })

        await newMessage.save()

        // Populate the message for response
        await newMessage.populate([
            { path: 'sender', select: 'name email role' },
            { path: 'receiver', select: 'name email role' },
            { path: 'order', select: 'orderNumber' },
            { path: 'product', select: 'name' }
        ])

        return response(true, 201, 'Message sent successfully', {
            message: newMessage
        })

    } catch (error) {
        return catchError(error)
    }
}

export async function PUT(request) {
    try {
        await connectDB()

        const cookieStore = await cookies()
        const token = cookieStore.get('access_token')?.value

        const tokenResult = await handleTokenVerification(token, 'vendor')
        if (!tokenResult.success) {
            return response(false, tokenResult.status, tokenResult.message)
        }

        const { user } = tokenResult
        const vendorId = user.vendorId

        // Get vendor information
        const vendor = await VendorModel.findById(vendorId)
        if (!vendor) {
            return response(false, 404, 'Vendor not found')
        }

        if (vendor.status !== 'approved') {
            return response(false, 403, 'Vendor account is not approved yet')
        }

        const payload = await request.json()
        const { messageId, action } = payload

        if (!messageId || !action) {
            return response(false, 400, 'Message ID and action are required')
        }

        const message = await MessageModel.findById(messageId)
        if (!message) {
            return response(false, 404, 'Message not found')
        }

        // Check if user has permission to modify this message
        if (message.receiver.toString() !== user._id.toString()) {
            return response(false, 403, 'Permission denied')
        }

        switch (action) {
            case 'mark_read':
                const updatedMessage = await MessageModel.findByIdAndUpdate(
                    messageId,
                    { 
                        $set: { 
                            status: 'read',
                            readAt: new Date()
                        },
                        $addToSet: {
                            readBy: {
                                user: user._id,
                                readAt: new Date()
                            }
                        }
                    },
                    { new: true }
                )
                return response(true, 200, 'Message marked as read', { message: updatedMessage })

            case 'delete':
                await MessageModel.findByIdAndUpdate(
                    messageId,
                    { $set: { deletedAt: new Date() } }
                )
                return response(true, 200, 'Message deleted successfully')

            default:
                return response(false, 400, 'Invalid action')
        }

    } catch (error) {
        return catchError(error)
    }
}
