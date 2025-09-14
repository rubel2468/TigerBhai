import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'images');
        
        // Ensure upload directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const uploadedFiles = [];

        for (const file of files) {
            if (!file || typeof file === 'string') continue;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExtension = file.name.split('.').pop();
            const fileName = `${timestamp}_${randomString}.${fileExtension}`;
            
            const filePath = join(uploadDir, fileName);
            
            // Write file to disk
            await writeFile(filePath, buffer);
            
            // Create media document
            const mediaData = {
                fileName: fileName,
                originalName: file.name,
                filePath: `/uploads/images/${fileName}`,
                size: file.size,
                type: file.type
            };
            
            const newMedia = new MediaModel(mediaData);
            await newMedia.save();
            
            uploadedFiles.push(newMedia);
        }

        return response(true, 200, 'Media uploaded successfully.', uploadedFiles);

    } catch (error) {
        return catchError(error);
    }
}