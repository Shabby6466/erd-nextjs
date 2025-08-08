import { useState } from 'react'
import { showNotification } from '@/lib/utils/notifications'

export interface FileUploadOptions {
  accept?: string[]
  maxSize?: number // in bytes
  convertToBase64?: boolean
  convertToURL?: boolean
}

export interface FileUploadResult {
  file: File | null
  base64: string | null
  url: string | null
  isUploading: boolean
  error: string | null
  upload: (file: File) => Promise<void>
  clear: () => void
}

export function useFileUpload(options: FileUploadOptions = {}): FileUploadResult {
  const {
    accept = ['application/pdf'],
    maxSize = 10 * 1024 * 1024, // 10MB default
    convertToBase64 = false,
    convertToURL = false
  } = options

  const [file, setFile] = useState<File | null>(null)
  const [base64, setBase64] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (accept.length > 0 && !accept.includes(file.type)) {
      const acceptedTypes = accept.map(type => {
        switch(type) {
          case 'application/pdf': return 'PDF'
          case 'image/jpeg': return 'JPEG'
          case 'image/png': return 'PNG'
          default: return type
        }
      }).join(', ')
      return `Only ${acceptedTypes} files are allowed`
    }

    // Check file size
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024))
      return `File size must be less than ${sizeMB}MB`
    }

    return null
  }

  const convertToBase64String = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix for pure base64
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const createObjectURL = (file: File): string => {
    return URL.createObjectURL(file)
  }

  const upload = async (uploadFile: File): Promise<void> => {
    setIsUploading(true)
    setError(null)

    try {
      // Validate file
      const validationError = validateFile(uploadFile)
      if (validationError) {
        setError(validationError)
        showNotification.error(validationError)
        return
      }

      // Set file
      setFile(uploadFile)

      // Convert to base64 if requested
      if (convertToBase64) {
        const base64String = await convertToBase64String(uploadFile)
        setBase64(base64String)
      }

      // Create object URL if requested
      if (convertToURL) {
        const objectUrl = createObjectURL(uploadFile)
        setUrl(objectUrl)
      }

      showNotification.success(`${uploadFile.name} uploaded successfully`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file'
      setError(errorMessage)
      showNotification.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const clear = () => {
    setFile(null)
    setBase64(null)
    if (url) {
      URL.revokeObjectURL(url)
    }
    setUrl(null)
    setError(null)
    setIsUploading(false)
  }

  return {
    file,
    base64,
    url,
    isUploading,
    error,
    upload,
    clear
  }
}

// Specific hooks for common use cases
export const usePDFUpload = () => useFileUpload({
  accept: ['application/pdf'],
  maxSize: 10 * 1024 * 1024, // 10MB
  convertToURL: true
})

export const useImageUpload = () => useFileUpload({
  accept: ['image/jpeg', 'image/png', 'image/jpg'],
  maxSize: 5 * 1024 * 1024, // 5MB
  convertToBase64: true,
  convertToURL: true
})
