import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
    try {
        await connectDB();
        
        const formData = await request.formData();
        let files = formData.getAll('files');
        // Support single file field name 'file'
        const singleFile = formData.get('file');
        if ((!files || files.length === 0) && singleFile) {
            files = [singleFile];
        }
        
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

            // Basic type and size validation (allow images and PDFs up to 5MB)
            const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                return response(false, 400, 'Unsupported file type.');
            }
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                return response(false, 400, 'File too large. Max 5MB allowed.');
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExtension = (file.name?.split('.')?.pop() || '').toLowerCase() || (file.type === 'application/pdf' ? 'pdf' : 'bin');
            const fileName = `${timestamp}_${randomString}.${fileExtension}`;
            
            const filePath = join(uploadDir, fileName);
            
            // Write file to disk
            await writeFile(filePath, buffer);
            
            // Create file info object
            const fileInfo = {
                fileName: fileName,
                originalName: file.name,
                filePath: `/uploads/images/${fileName}`,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
            };
            
            uploadedFiles.push(fileInfo);
        }

        return response(true, 200, 'Files uploaded successfully.', uploadedFiles);

    } catch (error) {
        return catchError(error);
    }
}
