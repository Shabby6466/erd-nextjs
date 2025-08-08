"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface SendForVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    verification_type: 'INTELLIGENCE_BUREAU' | 'SPECIAL_BRANCH' | 'BOTH'
    region?: string
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
  const [verificationType, setVerificationType] = useState<'INTELLIGENCE_BUREAU' | 'SPECIAL_BRANCH' | 'BOTH'>('INTELLIGENCE_BUREAU')
  const [region, setRegion] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const data: any = {
      verification_type: verificationType,
      remarks: remarks.trim() || undefined
    }
    
    if (verificationType === 'SPECIAL_BRANCH' || verificationType === 'BOTH') {
      if (!region) {
        alert('Please select a region for Special Branch verification')
        return
      }
      data.region = region
    }
    
    await onSubmit(data)
    
    // Reset form
    setVerificationType('INTELLIGENCE_BUREAU')
    setRegion('')
    setRemarks('')
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
              <Label className="text-base font-medium">Select Verification Type</Label>
              <RadioGroup
                value={verificationType}
                onValueChange={(value) => setVerificationType(value as any)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="INTELLIGENCE_BUREAU" id="intelligence" />
                  <Label htmlFor="intelligence">Intelligence Bureau</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="SPECIAL_BRANCH" id="special" />
                  <Label htmlFor="special">Special Branch</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BOTH" id="both" />
                  <Label htmlFor="both">Both</Label>
                </div>
              </RadioGroup>
            </div>

            {(verificationType === 'SPECIAL_BRANCH' || verificationType === 'BOTH') && (
              <div>
                <Label htmlFor="region">Select Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUNJAB">Punjab</SelectItem>
                    <SelectItem value="SINDH">Sindh</SelectItem>
                    <SelectItem value="KPK">KPK</SelectItem>
                    <SelectItem value="BALOCHISTAN">Balochistan</SelectItem>
                    <SelectItem value="GILGIT_BALTISTAN">Gilgit Baltistan</SelectItem>
                    <SelectItem value="AJK">AJK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
