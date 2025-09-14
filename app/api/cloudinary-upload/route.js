import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
    // Use the complete URL if provided
    cloudinary.config({
        secure: true
    });
} else {
    // Use individual environment variables
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
}

export async function POST(request) {
    try {
        // Allow both admin and vendor access
        const adminAuth = await isAuthenticated('admin');
        const vendorAuth = await isAuthenticated('vendor');
        
        if (!adminAuth.isAuth && !vendorAuth.isAuth) {
            return response(false, 403, 'Unauthorized. Admin or vendor access required.');
        }
        
        const auth = adminAuth.isAuth ? adminAuth : vendorAuth;

        await connectDB();
        
        const formData = await request.formData();
        const files = formData.getAll('files');
        
        if (!files || files.length === 0) {
            return response(false, 400, 'No files provided.');
        }

        const uploadedFiles = [];

        for (const file of files) {
            if (!file || typeof file === 'string') continue;

            // Basic type and size validation (allow images up to 5MB)
            const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                return response(false, 400, 'Unsupported file type. Only images are allowed.');
            }
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                return response(false, 400, 'File too large. Max 5MB allowed.');
            }

            // Convert file to buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExtension = file.name.split('.').pop();
            const fileName = `tigerbhai_${timestamp}_${randomString}`;
            
            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        public_id: fileName,
                        folder: 'tigerbhai/uploads',
                        resource_type: 'auto',
                        quality: 'auto',
                        fetch_format: 'auto'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });
            
            // Create media document
            const mediaData = {
                fileName: uploadResult.public_id,
                originalName: file.name,
                filePath: uploadResult.secure_url,
                size: file.size,
                type: file.type,
                cloudinaryId: uploadResult.public_id
            };
            
            const newMedia = new MediaModel(mediaData);
            await newMedia.save();
            
            uploadedFiles.push(newMedia);
        }

        return response(true, 200, 'Media uploaded successfully.', uploadedFiles);

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return catchError(error);
    }
}
