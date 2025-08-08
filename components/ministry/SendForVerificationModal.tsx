"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"
import { X, Upload } from "lucide-react"

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
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setVerificationDocument(file)
    } else {
      alert('Please select a PDF file')
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedAgencies.length === 0) {
      alert('Please select at least one agency for verification')
      return
    }

    if (!verificationDocument) {
      alert('Please upload a verification document')
      return
    }
    
    const data = {
      agencies: selectedAgencies,
      verification_document: verificationDocument,
      remarks: remarks.trim() || undefined
    }
    
    await onSubmit(data)
    
    // Reset form
    setSelectedAgencies([])
    setVerificationDocument(null)
    setRemarks('')
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
              onClick={onClose}
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
                    />
                    <Label htmlFor={agency.id}>{agency.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="verification-document">Verification Document (PDF)</Label>
              <div className="mt-2">
                <input
                  id="verification-document"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {verificationDocument && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {verificationDocument.name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter any additional remarks..."
                rows={3}
              />
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
                {isLoading ? 'Sending...' : 'Send for Verification'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
