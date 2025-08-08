"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface DraftReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: (data: { black_list_check?: boolean }) => Promise<void>
  onReject: (data: { rejection_reason: string, black_list_check?: boolean }) => Promise<void>
  isLoading?: boolean
}

export function DraftReviewModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading = false
}: DraftReviewModalProps) {
  const [actionMode, setActionMode] = useState<'select' | 'approve' | 'reject'>('select')
  const [blacklistCheck, setBlacklistCheck] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleApprove = async () => {
    await onApprove({
      black_list_check: blacklistCheck
    })
    resetForm()
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason')
      return
    }
    await onReject({
      rejection_reason: rejectionReason.trim(),
      black_list_check: blacklistCheck
    })
    resetForm()
  }

  const resetForm = () => {
    setActionMode('select')
    setBlacklistCheck(false)
    setRejectionReason('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">Ministry Review</div>
              <div className="text-sm text-gray-500 mt-1">
                {actionMode === 'select' && 'Select Action'}
                {actionMode === 'approve' && 'Approve Application'}
                {actionMode === 'reject' && 'Reject Application'}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Action Selection Screen */}
          {actionMode === 'select' && (
            <div className="space-y-4">
              <div className="text-center text-gray-600 mb-6">
                Select an action for this DRAFT application
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => setActionMode('approve')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Application
                </Button>
                
                <Button
                  onClick={() => setActionMode('reject')}
                  variant="destructive"
                  disabled={isLoading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Application
                </Button>
              </div>
            </div>
          )}

          {/* Approval Screen */}
          {actionMode === 'approve' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-green-800">
                    <div className="font-medium">Application will be approved</div>
                    <div className="text-sm">Status will change to APPROVED</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="approve-blacklist"
                  type="checkbox"
                  checked={blacklistCheck}
                  onChange={(e) => setBlacklistCheck(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="approve-blacklist" className="text-sm">
                  Mark as blacklisted (will still be approved but flagged)
                </Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActionMode('select')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Processing...' : 'Confirm Approval'}
                </Button>
              </div>
            </div>
          )}

          {/* Rejection Screen */}
          {actionMode === 'reject' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-red-800">
                    <div className="font-medium">Application will be rejected</div>
                    <div className="text-sm">Status will change to REJECTED</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="reject-blacklist"
                  type="checkbox"
                  checked={blacklistCheck}
                  onChange={(e) => setBlacklistCheck(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="reject-blacklist" className="text-sm">
                  Mark as blacklisted
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  rows={3}
                  className={!rejectionReason.trim() && actionMode === 'reject' ? "border-red-500" : ""}
                />
                {!rejectionReason.trim() && actionMode === 'reject' && (
                  <p className="text-sm text-red-500">Rejection reason is required</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActionMode('select')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isLoading}
                  variant="destructive"
                >
                  {isLoading ? 'Processing...' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
