"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { X, Upload, FileText, Download } from "lucide-react"
import { applicationAPI } from "@/lib/api/applications"
import { showNotification } from "@/lib/utils/notifications"

interface SubmitVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    remarks: string
    attachment?: File
  }) => Promise<void>
  isLoading?: boolean
  applicationId?: string
}

export function SubmitVerificationModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  applicationId
}: SubmitVerificationModalProps) {
  const [remarks, setRemarks] = useState<string>('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!remarks.trim()) {
      alert('Please enter verification remarks')
      return
    }
    
    const data: any = {
      remarks: remarks.trim()
    }
    
    if (attachment) {
      data.attachment = attachment
    }
    
    await onSubmit(data)
    
    // Reset form
    setRemarks('')
    setAttachment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if it's a PDF
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file')
        e.target.value = ''
        return
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        e.target.value = ''
        return
      }
      
      setAttachment(file)
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Submit Verification</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Verification Document Download Section */}
          {applicationId && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm">Verification Document</h4>
                    <p className="text-xs text-blue-700">Download the verification document from Ministry</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      const blob = await applicationAPI.downloadVerificationDocument(applicationId)
                      const url = URL.createObjectURL(blob)
                      
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `verification-document-${applicationId.substring(0, 8)}.pdf`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      
                      setTimeout(() => URL.revokeObjectURL(url), 1000)
                    } catch (error) {
                      console.error('Download failed:', error)
                      showNotification.error('Failed to download verification document')
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="remarks">Verification Remarks *</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your verification remarks..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="attachment">PDF Attachment (Optional)</Label>
              <div className="mt-2">
                <Input
                  ref={fileInputRef}
                  id="attachment"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {attachment ? 'Change PDF' : 'Upload PDF'}
                </Button>
              </div>
              
              {attachment && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">{attachment.name}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeAttachment}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Submitting...' : 'Submit Verification'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
