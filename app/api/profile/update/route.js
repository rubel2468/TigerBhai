import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import UserModel from "@/models/User.model";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwccfnus5',
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '297231592464872',
    api_secret: process.env.CLOUDINARY_SECRET_KEY || 'A0_zt4C8T1SP4UfWhyHy4C_MvdE',
    secure: true
});

export async function PUT(request) {
    try {
        await connectDB()
        const auth = await isAuthenticated('user')
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const userId = auth.userId
        const user = await UserModel.findById(userId)

        if (!user) {
            return response(false, 404, 'User not found.')
        }

        const formData = await request.formData()
        const file = formData.get('file')


        user.name = formData.get('name')
        user.phone = formData.get('phone')
        user.address = formData.get('address')

        if (file) {
            // Basic type and size validation (allow images only)
            if (!file.type.startsWith('image/')) {
                return response(false, 400, 'Unsupported file type. Only images are allowed.');
            }
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                return response(false, 400, 'File too large. Max 5MB allowed.');
            }

            // Delete old avatar from Cloudinary if exists
            if (user?.avatar?.public_id) {
                try {
                    await cloudinary.uploader.destroy(user.avatar.public_id);
                } catch (error) {
                    console.error('Failed to delete old avatar from Cloudinary:', error);
                }
            }

            const fileBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(fileBuffer);

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileName = `tigerbhai_avatar_${timestamp}_${randomString}`;
            
            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        public_id: fileName,
                        folder: 'tigerbhai/avatars',
                        resource_type: 'auto',
                        quality: 'auto',
                        fetch_format: 'auto'
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(buffer);
            });

            user.avatar = {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            };
        }

        await user.save()

        return response(true, 200, 'Profile updated successfully.', {
            _id: user._id.toString(),
            role: user.role,
            name: user.name,
            avatar: user.avatar
        })
    } catch (error) {
        return catchError(error)
    }
}