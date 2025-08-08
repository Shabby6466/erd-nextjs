"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Eye, X, FileText } from "lucide-react"
import { applicationAPI } from "@/lib/api/applications"

interface PDFViewerProps {
  url: string
  fileName?: string
  isOpen: boolean
  onClose: () => void
  applicationId?: string
  agency?: string
}

export function PDFViewer({ url, fileName, isOpen, onClose, applicationId, agency }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    if (isOpen && applicationId && agency) {
      setIsLoading(true)
      setError(false)
      
      // Create authenticated URL for viewing
      const viewUrl = applicationAPI.getVerificationAttachmentUrl(applicationId, agency)
      setPdfUrl(viewUrl)
      setIsLoading(false)
    } else if (isOpen && url) {
      // Fallback to direct URL
      setIsLoading(true)
      setError(false)
      setPdfUrl(url)
      setIsLoading(false)
    }
  }, [url, isOpen, applicationId, agency])

  if (!isOpen) return null

  const handleDownload = async () => {
    try {
      if (applicationId && agency) {
        // Use the API download endpoint
        const blob = await applicationAPI.downloadVerificationAttachment(applicationId, agency)
        const downloadUrl = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = fileName || 'document.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      } else {
        // Fallback to direct URL download
        const link = document.createElement('a')
        link.href = url
        link.download = fileName || 'document.pdf'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
    setError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {fileName || 'PDF Document'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Unable to display PDF</p>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Instead
                </Button>
              </div>
            </div>
          )}
          
          <iframe
            src={pdfUrl}
            className={`w-full h-full border-0 ${isLoading || error ? 'hidden' : 'block'}`}
            onLoad={handleLoad}
            onError={handleError}
            title="PDF Viewer"
          />
        </CardContent>
      </Card>
    </div>
  )
}

interface PDFLinkProps {
  url: string
  fileName?: string
  className?: string
  children?: React.ReactNode
  applicationId?: string
  agency?: string
}

export function PDFLink({ url, fileName, className, children, applicationId, agency }: PDFLinkProps) {
  const [showViewer, setShowViewer] = useState(false)

  return (
    <>
      <Button
        variant="link"
        onClick={() => setShowViewer(true)}
        className={`p-0 h-auto text-blue-600 hover:text-blue-800 underline ${className}`}
      >
       
      </Button>
      
      <PDFViewer
        url={url}
        fileName={fileName}
        isOpen={showViewer}
        onClose={() => setShowViewer(false)}
        applicationId={applicationId}
        agency={agency}
      />
    </>
  )
}
