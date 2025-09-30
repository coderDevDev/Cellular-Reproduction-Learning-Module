"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ImageIcon, Star } from "lucide-react"

interface ImageUploadProps {
  images: string[]
  thumbnail: string
  onImagesChange: (images: string[], thumbnail: string) => void
  maxImages?: number
}

export function ImageUpload({ images, thumbnail, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const getDefaultThumbnail = (type = "property") => {
    switch (type) {
      case "residential":
        return "/placeholder.svg?height=200&width=300&text=Residential+Property"
      case "commercial":
        return "/placeholder.svg?height=200&width=300&text=Commercial+Property"
      case "dormitory":
        return "/placeholder.svg?height=200&width=300&text=Dormitory+Property"
      default:
        return "/placeholder.svg?height=200&width=300&text=Property+Image"
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newImages: string[] = []
    const fileArray = Array.from(files)

    fileArray.slice(0, maxImages - images.length).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          newImages.push(result)

          if (newImages.length === fileArray.length || newImages.length === maxImages - images.length) {
            const updatedImages = [...images, ...newImages]
            const newThumbnail = thumbnail || updatedImages[0] || getDefaultThumbnail()
            onImagesChange(updatedImages, newThumbnail)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    let newThumbnail = thumbnail

    // If removed image was the thumbnail, set new thumbnail
    if (images[index] === thumbnail) {
      newThumbnail = updatedImages[0] || getDefaultThumbnail()
    }

    onImagesChange(updatedImages, newThumbnail)
  }

  const setAsThumbnail = (imageUrl: string) => {
    onImagesChange(images, imageUrl)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragOver ? "border-property-action bg-property-action/5" : "border-gray-300 hover:border-property-action"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 text-property-text-secondary mx-auto mb-4" />
          <h3 className="text-property-text-primary font-medium mb-2">Upload Property Images</h3>
          <p className="text-property-text-secondary text-sm mb-4">
            Drag and drop images here, or click to select files
          </p>
          <p className="text-property-text-secondary text-xs">
            Maximum {maxImages} images • JPG, PNG, WebP up to 10MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-property-text-primary font-medium">Property Images ({images.length})</h4>
          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />

                    {/* Image Actions */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {image === thumbnail && (
                        <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Thumbnail
                        </Badge>
                      )}
                    </div>

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {image !== thumbnail && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            setAsThumbnail(image)
                          }}
                          className="text-xs"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Set as Thumbnail
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(index)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current Thumbnail Display */}
      <Card className="bg-property-card-alt">
        <CardContent className="p-4">
          <h4 className="text-property-text-primary font-medium mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Current Thumbnail
          </h4>
          <div className="flex items-center gap-4">
            <img
              src={thumbnail || getDefaultThumbnail()}
              alt="Property thumbnail"
              className="w-20 h-16 object-cover rounded border"
            />
            <div className="flex-1">
              <p className="text-property-text-primary text-sm font-medium">
                {thumbnail ? "Custom thumbnail selected" : "Using default thumbnail"}
              </p>
              <p className="text-property-text-secondary text-xs">This image will be displayed in property listings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="text-blue-900 font-medium text-sm mb-1">Image Tips</h5>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• Upload high-quality images for better presentation</li>
                <li>• The first image will be used as thumbnail by default</li>
                <li>• Include exterior, interior, and amenity photos</li>
                <li>• Recommended size: 1200x800 pixels or higher</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
