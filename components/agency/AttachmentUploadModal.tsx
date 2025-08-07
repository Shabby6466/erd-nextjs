"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { showNotification } from "@/lib/utils/notifications"
import { attachmentAPI } from "@/lib/api/attachments"

interface AttachmentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string | null
  onUploadSuccess: () => void
}

export function AttachmentUploadModal({ 
  open, 
  onOpenChange, 
  applicationId, 
  onUploadSuccess 
}: AttachmentUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        showNotification.error("Only PDF files are allowed")
        return
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showNotification.error("File size must be less than 10MB")
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !applicationId) return

    setIsUploading(true)
    try {
      await attachmentAPI.upload(applicationId, selectedFile)
      showNotification.success("Attachment uploaded successfully")
      onUploadSuccess()
      setSelectedFile(null)
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to upload attachment")
    } finally {
      setIsUploading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Upload Attachment
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select PDF file</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only PDF files are accepted. Maximum file size is 10MB.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}