import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import UserModel from "@/models/User.model";
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
            
            // Ensure upload directory exists
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            // Remove old avatar file if exists
            if (user?.avatar?.filePath) {
                try {
                    const oldFilePath = join(process.cwd(), 'public', user.avatar.filePath);
                    await unlink(oldFilePath);
                } catch (error) {
                    console.error('Failed to delete old avatar:', error);
                }
            }

            const fileBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(fileBuffer);

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExtension = file.name.split('.').pop();
            const fileName = `${timestamp}_${randomString}.${fileExtension}`;
            
            const filePath = join(uploadDir, fileName);
            
            // Write file to disk
            await writeFile(filePath, buffer);

            user.avatar = {
                fileName: fileName,
                filePath: `/uploads/avatars/${fileName}`,
                originalName: file.name,
                size: file.size,
                type: file.type
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