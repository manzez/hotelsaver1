'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ImageFile {
  id: string
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
  error?: string
}

interface ImageManagerProps {
  initialImages?: string[]
  maxImages?: number
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
  onImagesChange?: (urls: string[]) => void
  hotelId?: string
}

export default function ImageManager({
  initialImages = [],
  maxImages = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFileSize = 5,
  onImagesChange,
  hotelId
}: ImageManagerProps) {
  const [images, setImages] = useState<ImageFile[]>(() => 
    initialImages.map((url, index) => ({
      id: `existing-${index}`,
      file: null as any,
      preview: url,
      uploading: false,
      uploaded: true,
      url
    }))
  )
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Simulate image upload (replace with real upload logic)
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate upload success/failure
        if (Math.random() > 0.1) { // 90% success rate
          const imageUrl = `https://images.unsplash.com/photo-${Date.now()}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
          resolve(imageUrl)
        } else {
          reject(new Error('Upload failed'))
        }
      }, 2000 + Math.random() * 3000) // 2-5 second upload time
    })
  }, [])

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File too large. Maximum size: ${maxFileSize}MB`
    }
    
    return null
  }

  const addFiles = useCallback(async (files: FileList) => {
    if (images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    const newFiles = Array.from(files).slice(0, maxImages - images.length)
    const validFiles: ImageFile[] = []

    for (const file of newFiles) {
      const error = validateFile(file)
      if (error) {
        alert(`${file.name}: ${error}`)
        continue
      }

      const id = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const preview = URL.createObjectURL(file)
      
      validFiles.push({
        id,
        file,
        preview,
        uploading: true,
        uploaded: false
      })
    }

    if (validFiles.length === 0) return

    setImages(prev => [...prev, ...validFiles])
    setUploading(true)

    // Upload files
    const uploadPromises = validFiles.map(async (imageFile) => {
      try {
        const url = await uploadImage(imageFile.file)
        
        setImages(prev => prev.map(img => 
          img.id === imageFile.id 
            ? { ...img, uploading: false, uploaded: true, url }
            : img
        ))
        
        return url
      } catch (error) {
        setImages(prev => prev.map(img => 
          img.id === imageFile.id 
            ? { ...img, uploading: false, uploaded: false, error: error instanceof Error ? error.message : 'Upload failed' }
            : img
        ))
        return null
      }
    })

    await Promise.all(uploadPromises)
    setUploading(false)

    // Update parent component
    const allUrls = images
      .filter(img => img.uploaded && img.url)
      .map(img => img.url!)
    onImagesChange?.(allUrls)
  }, [images, maxImages, maxFileSize, acceptedTypes, uploadImage, onImagesChange])

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      const urls = updated
        .filter(img => img.uploaded && img.url)
        .map(img => img.url!)
      onImagesChange?.(urls)
      return updated
    })
  }, [onImagesChange])

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      
      const urls = updated
        .filter(img => img.uploaded && img.url)
        .map(img => img.url!)
      onImagesChange?.(urls)
      
      return updated
    })
  }, [onImagesChange])

  const retryUpload = useCallback(async (id: string) => {
    const imageFile = images.find(img => img.id === id)
    if (!imageFile || !imageFile.file) return

    setImages(prev => prev.map(img => 
      img.id === id 
        ? { ...img, uploading: true, uploaded: false, error: undefined }
        : img
    ))

    try {
      const url = await uploadImage(imageFile.file)
      
      setImages(prev => prev.map(img => 
        img.id === id 
          ? { ...img, uploading: false, uploaded: true, url }
          : img
      ))
      
      const allUrls = images
        .filter(img => img.uploaded && img.url)
        .map(img => img.url!)
      onImagesChange?.(allUrls)
    } catch (error) {
      setImages(prev => prev.map(img => 
        img.id === id 
          ? { ...img, uploading: false, uploaded: false, error: error instanceof Error ? error.message : 'Upload failed' }
          : img
      ))
    }
  }, [images, uploadImage, onImagesChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      addFiles(files)
    }
  }, [addFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      addFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addFiles])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-brand-green bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${images.length >= maxImages ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-6xl">📷</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop images here or click to upload
            </p>
            <p className="text-sm text-gray-600">
              Up to {maxImages} images • Max {maxFileSize}MB each • JPG, PNG, WebP
            </p>
          </div>
          <button
            type="button"
            onClick={openFileDialog}
            disabled={images.length >= maxImages}
            className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choose Files
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Images ({images.length}/{maxImages})
            </h3>
            {uploading && (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Uploading...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-square relative">
                  <Image
                    src={image.preview}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  
                  {/* Loading Overlay */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-sm">Uploading...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Overlay */}
                  {image.error && (
                    <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                      <div className="text-white text-center p-2">
                        <div className="text-2xl mb-1">❌</div>
                        <p className="text-xs">{image.error}</p>
                        <button
                          onClick={() => retryUpload(image.id)}
                          className="mt-2 px-2 py-1 bg-white text-red-500 rounded text-xs hover:bg-gray-100"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Success Badge */}
                  {image.uploaded && !image.error && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    {/* Move Left */}
                    {index > 0 && (
                      <button
                        onClick={() => reorderImages(index, index - 1)}
                        className="w-6 h-6 bg-black/70 text-white rounded-full text-xs hover:bg-black/90 transition-colors"
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    
                    {/* Move Right */}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => reorderImages(index, index + 1)}
                        className="w-6 h-6 bg-black/70 text-white rounded-full text-xs hover:bg-black/90 transition-colors"
                        title="Move right"
                      >
                        →
                      </button>
                    )}
                    
                    {/* Remove */}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-brand-green text-white px-2 py-1 rounded-full text-xs font-medium">
                      Primary
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Image Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={openFileDialog}
              disabled={images.length >= maxImages}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Add More
            </button>
            
            <button
              onClick={() => {
                const failedUploads = images.filter(img => img.error)
                failedUploads.forEach(img => retryUpload(img.id))
              }}
              disabled={!images.some(img => img.error)}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Retry Failed
            </button>
            
            <button
              onClick={() => {
                if (confirm('Remove all images?')) {
                  setImages([])
                  onImagesChange?.([])
                }
              }}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">📸 Image Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• First image will be used as the primary hotel photo</li>
          <li>• Use high-quality images (at least 800x600 pixels)</li>
          <li>• Include exterior, lobby, rooms, amenities, and dining areas</li>
          <li>• Drag and drop to reorder images</li>
          <li>• Images are automatically optimized for web</li>
        </ul>
      </div>
    </div>
  )
}