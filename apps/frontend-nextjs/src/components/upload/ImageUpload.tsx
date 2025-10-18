'use client'

import React, { useState, useRef } from 'react'

interface ImageUploadProps {
  value?: string[]
  onChange?: (images: string[]) => void
  maxImages?: number
  maxFiles?: number
  maxSizeMB?: number
  disabled?: boolean
  className?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxImages = 5,
  maxFiles,
  maxSizeMB,
  disabled = false,
  className = ''
}) => {
  const [images, setImages] = useState<string[]>(value)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    setIsUploading(true)
    const newImages: string[] = []

    const maxFilesToProcess = maxFiles ? Math.min(files.length, maxFiles - images.length) : Math.min(files.length, maxImages - images.length)
    
    for (let i = 0; i < maxFilesToProcess; i++) {
      const file = files[i]
      
      // Check file size if maxSizeMB is specified
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB.`)
        continue
      }
      
      if (file.type.startsWith('image/')) {
        // Convert to base64 for demo
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          newImages.push(result)
          
          if (newImages.length === maxFilesToProcess) {
            const updatedImages = [...images, ...newImages]
            setImages(updatedImages)
            onChange?.(updatedImages)
            setIsUploading(false)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onChange?.(updatedImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`image-upload ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Upload ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        
        {images.length < (maxFiles || maxImages) && (
          <button
            onClick={openFileDialog}
            disabled={isUploading || disabled}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
          >
            {isUploading ? (
              <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm text-gray-500">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  )
}

export default ImageUpload
