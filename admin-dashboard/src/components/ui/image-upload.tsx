"use client"

import type React from "react"
import { useState, useCallback, useId } from "react"
import { Upload, X, Camera, ImageIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "./alert"
import { Card, CardContent } from "./card"

interface ImageUploadProps {
  id?: string
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  onImagesChange?: (images: File[]) => void
  className?: string
  label?: string
}

interface ImagePreview {
  file: File
  url: string
  id: string
}

export function ImageUpload({
  maxFiles = 1,
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  onImagesChange,
  className = "",
  label = "Upload Banner Image",
}: ImageUploadProps) {
  const [images, setImages] = useState<ImagePreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string>("")

  const inputId = useId()

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPEG, PNG, or WebP.`
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB.`
    }
    return null
  }

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remainingSlots = maxFiles - images.length

      if (fileArray.length > remainingSlots) {
        setError(`You can only upload ${remainingSlots} more image(s).`)
        return
      }

      const validFiles: File[] = []
      let hasError = false

      for (const file of fileArray) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          hasError = true
          break
        }
        validFiles.push(file)
      }

      if (!hasError && validFiles.length > 0) {
        setError("")
        const newImages: ImagePreview[] = validFiles.map((file) => ({
          file,
          url: URL.createObjectURL(file),
          id: Math.random().toString(36).substr(2, 9),
        }))

        const updatedImages = [...images, ...newImages]
        setImages(updatedImages)
        onImagesChange?.(updatedImages.map((img) => img.file))
      }
    },
    [images, maxFiles, maxSize, acceptedTypes, onImagesChange],
  )

  const removeImage = useCallback(
    (id: string) => {
      const updatedImages = images.filter((img) => {
        if (img.id === id) {
          URL.revokeObjectURL(img.url)
          return false
        }
        return true
      })
      setImages(updatedImages)
      onImagesChange?.(updatedImages.map((img) => img.file))
    },
    [images, onImagesChange],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
      }
    },
    [processFiles],
  )

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all duration-200 ${
          dragActive
            ? "border-primary bg-primary/5 shadow-lg"
            : "border-border/50 hover:border-primary/50 hover:bg-accent/20"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-3 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="p-2 rounded-full bg-muted/50 dark:bg-muted/30">
              <Camera className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              <p className="text-muted-foreground text-xs">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">Supports JPEG, PNG, WebP up to {maxSize}MB</p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(inputId)?.click()}
              className="bg-transparent hover:bg-accent/50"
              disabled={images.length >= maxFiles}
            >
              <Upload className="h-3 w-3 mr-2" />
              Choose File
            </Button>

            <input
              id={inputId}
              type="file"
              multiple={maxFiles > 1}
              accept={acceptedTypes.join(",")}
              className="hidden"
              onChange={handleFileInput}
              disabled={images.length >= maxFiles}
            />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              <span>
                {images.length} / {maxFiles} image uploaded
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {images.map((image, index) => (
            <Card
              key={image.id}
              className="group relative overflow-hidden bg-card/90 backdrop-blur-sm border-border/50"
            >
              <CardContent className="p-0">
                <div className="relative h-16 w-20 mx-auto">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 rounded"
                  />

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="h-2 w-2" />
                  </Button>

                  {/* File Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <Badge variant="secondary" className="text-xs bg-background/80 text-foreground">
                      {(image.file.size / 1024 / 1024).toFixed(1)}MB
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}