'use client'
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/showToast';
import axios from 'axios';
import { FiPlus, FiUpload } from "react-icons/fi";
import { useRef, useState } from 'react';

const LocalUploadMedia = ({ isMultiple, queryClient }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        
        try {
            const formData = new FormData();
            
            // Add files to FormData
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            const { data: uploadResponse } = await axios.post('/api/cloudinary-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!uploadResponse.success) {
                throw new Error(uploadResponse.message);
            }

            queryClient.invalidateQueries(['media-data']);
            showToast('success', uploadResponse.message);

        } catch (error) {
            showToast('error', error.response?.data?.message || error.message);
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                multiple={isMultiple}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            
            <Button
                onClick={handleFileSelect}
                disabled={isUploading}
                className="flex items-center gap-2"
            >
                {isUploading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                    </>
                ) : (
                    <>
                        <FiUpload className="h-4 w-4" />
                        Upload {isMultiple ? 'Images' : 'Image'}
                    </>
                )}
            </Button>
        </div>
    );
};

export default LocalUploadMedia;
