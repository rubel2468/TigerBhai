'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showToast } from '@/lib/showToast'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import axios from 'axios'

const ImageUpload = ({ 
  selectedImage, 
  setSelectedImage, 
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = ""
}) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file')
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      showToast('error', `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)

      const { data: response } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!response.success) {
        throw new Error(response.message)
      }

      if (response.data && response.data.length > 0) {
        const uploadedFile = response.data[0]
        setSelectedImage({
          fileName: uploadedFile.fileName,
          originalName: uploadedFile.originalName,
          url: uploadedFile.filePath,
          size: uploadedFile.size,
          type: uploadedFile.type
        })
        showToast('success', 'Image uploaded successfully')
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = () => {
    setSelectedImage(null)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {selectedImage ? (
        <div className="relative">
          <div className="h-32 w-32 border rounded-lg overflow-hidden mx-auto">
            <Image
              src={selectedImage.url}
              alt={selectedImage.originalName}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {selectedImage.originalName}
          </p>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to {Math.round(maxSize / (1024 * 1024))}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageUpload
