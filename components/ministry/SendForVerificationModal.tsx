"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload, AlertCircle } from "lucide-react"
import { sendForVerificationSchema } from "@/lib/validations"

interface SendForVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    agencies: string[]
    verification_document?: File
    remarks?: string
  }) => Promise<void>
  isLoading?: boolean
}

export function SendForVerificationModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: SendForVerificationModalProps) {
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([])
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null)
  const [remarks, setRemarks] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableAgencies = [
    { id: 'INTELLIGENCE_BUREAU', label: 'Intelligence Bureau' },
    { id: 'SPECIAL_BRANCH_PUNJAB', label: 'Special Branch Punjab' },
    { id: 'SPECIAL_BRANCH_SINDH', label: 'Special Branch Sindh' },
    { id: 'SPECIAL_BRANCH_KPK', label: 'Special Branch KPK' },
    { id: 'SPECIAL_BRANCH_BALOCHISTAN', label: 'Special Branch Balochistan' },
    { id: 'SPECIAL_BRANCH_FEDERAL', label: 'Special Branch Federal' },
  ]

  const handleAgencyChange = (agencyId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgencies([...selectedAgencies, agencyId])
    } else {
      setSelectedAgencies(selectedAgencies.filter(id => id !== agencyId))
    }
    // Clear agency error when user makes a selection
    if (errors.agencies) {
      setErrors(prev => ({ ...prev, agencies: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf') {
        setVerificationDocument(file)
        // Clear file error when user selects a valid file
        if (errors.verification_document) {
          setErrors(prev => ({ ...prev, verification_document: '' }))
        }
      } else {
        alert('Please select a PDF file')
        e.target.value = ''
        setVerificationDocument(null)
      }
    }
  }

  const validateForm = () => {
    const formData = {
      agencies: selectedAgencies,
      verification_document: verificationDocument,
      remarks: remarks.trim() || undefined
    }

    try {
      sendForVerificationSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const newErrors: Record<string, string> = {}
      if (error.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message
        })
      }
      setErrors(newErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const data = {
      agencies: selectedAgencies,
      verification_document: verificationDocument!,
      remarks: remarks.trim() || undefined
    }
    
    try {
      await onSubmit(data)
      
      // Reset form on success
      setSelectedAgencies([])
      setVerificationDocument(null)
      setRemarks('')
      setErrors({})
      onClose()
    } catch (error) {
      // Error handling is done by the parent component
      console.error('Error submitting verification:', error)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setSelectedAgencies([])
    setVerificationDocument(null)
    setRemarks('')
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Send for Verification</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Agencies for Verification</Label>
              <div className="mt-2 space-y-2">
                {availableAgencies.map((agency) => (
                  <div key={agency.id} className="flex items-center space-x-2">
                    <input
                      id={agency.id}
                      type="checkbox"
                      checked={selectedAgencies.includes(agency.id)}
                      onChange={(e) => handleAgencyChange(agency.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <Label htmlFor={agency.id}>{agency.label}</Label>
                  </div>
                ))}
              </div>
              {errors.agencies && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.agencies}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="verification-document">Verification Document (PDF) *</Label>
              <div className="mt-2">
                <input
                  id="verification-document"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={isLoading}
                />
                {verificationDocument && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {verificationDocument.name}
                  </p>
                )}
              </div>
              {errors.verification_document && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.verification_document}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any additional remarks..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
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
                {isLoading ? 'Sending...' : 'Send for Verification'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
