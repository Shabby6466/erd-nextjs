"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MinistryReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: (data: { 
    approved: boolean; 
    black_list_check: boolean;
    etd_issue_date?: string;
    etd_expiry_date?: string;
  }) => Promise<void>
  onReject: (data: { 
    approved: boolean; 
    black_list_check: boolean; 
    rejection_reason: string;
    etd_issue_date?: string;
    etd_expiry_date?: string;
  }) => Promise<void>
  isLoading: boolean
}

export function MinistryReviewModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading
}: MinistryReviewModalProps) {
  const [blackListCheck, setBlackListCheck] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [etdIssueDate, setEtdIssueDate] = useState("")
  const [etdExpiryDate, setEtdExpiryDate] = useState("")
  const [reviewType, setReviewType] = useState<"approve" | "reject" | null>(null)
  const [actionMode, setActionMode] = useState<"selection" | "approve" | "reject">("selection")

  if (!isOpen) return null

  const handleApprove = async () => {
    setReviewType("approve")
    try {
      await onApprove({
        approved: true,
        black_list_check: blackListCheck,
        etd_issue_date: etdIssueDate || undefined,
        etd_expiry_date: etdExpiryDate || undefined
      })
      resetForm()
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setReviewType(null)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please enter a rejection reason")
      return
    }
    
    setReviewType("reject")
    try {
      await onReject({
        approved: false,
        black_list_check: false,
        rejection_reason: rejectionReason.trim(),
        etd_issue_date: undefined,
        etd_expiry_date: undefined
      })
      resetForm()
      onClose()
    } catch (error) {
      // Error handled by parent
    } finally {
      setReviewType(null)
    }
  }

  const resetForm = () => {
    setBlackListCheck(false)
    setRejectionReason("")
    setEtdIssueDate("")
    setEtdExpiryDate("")
    setReviewType(null)
    setActionMode("selection")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleApproveSelection = () => {
    setActionMode("approve")
  }

  const handleRejectSelection = () => {
    setActionMode("reject")
  }

  const handleBack = () => {
    setActionMode("selection")
    setReviewType(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <Card>
          <CardHeader>
            <CardTitle>Ministry Review</CardTitle>
            <CardDescription>
              {actionMode === "selection" && "Choose your action for this application"}
              {actionMode === "approve" && "Approve Application"}
              {actionMode === "reject" && "Reject Application"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Initial Action Selection */}
            {actionMode === "selection" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please select whether you want to approve or reject this application.
                </p>
                <div className="flex justify-center space-x-4 pt-4">
                  <Button
                    onClick={handleApproveSelection}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={handleRejectSelection}
                    variant="destructive"
                    disabled={isLoading}
                    className="min-w-[100px]"
                  >
                    Reject
                  </Button>
                </div>
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Approval Form */}
            {actionMode === "approve" && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Application will be approved
                      </p>
                      <p className="text-sm text-green-700">
                        ETD will be issued with the specified dates
                      </p>
                    </div>
                  </div>
                </div>

                {/* ETD Issue Date */}
                <div className="space-y-2">
                  <Label htmlFor="etd-issue-date">
                    ETD Issue Date
                  </Label>
                  <Input
                    id="etd-issue-date"
                    type="date"
                    value={etdIssueDate}
                    onChange={(e) => setEtdIssueDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* ETD Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="etd-expiry-date">
                    ETD Expiry Date
                  </Label>
                  <Input
                    id="etd-expiry-date"
                    type="date"
                    value={etdExpiryDate}
                    onChange={(e) => setEtdExpiryDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Blacklist Check for Approval */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="blacklist-check-approve"
                    checked={blackListCheck}
                    onChange={(e) => setBlackListCheck(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="blacklist-check-approve" className="text-sm font-medium">
                    Mark as blacklisted (will still be approved but flagged)
                  </Label>
                </div>

                {/* Action Buttons for Approval */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                  >
                    {reviewType === "approve" ? "Approving..." : "Confirm Approval"}
                  </Button>
                </div>
              </div>
            )}

            {/* Rejection Form */}
            {actionMode === "reject" && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        Application will be rejected
                      </p>
                      <p className="text-sm text-red-700">
                        ETD will not be issued
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">
                    Rejection Reason *
                  </Label>
                  <Input
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                    className="w-full"
                    required
                  />
                  {!rejectionReason.trim() && (
                    <p className="text-xs text-red-600">Rejection reason is required</p>
                  )}
                </div>

                {/* Action Buttons for Rejection */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                    disabled={isLoading || !rejectionReason.trim()}
                    className="min-w-[100px]"
                  >
                    {reviewType === "reject" ? "Rejecting..." : "Confirm Rejection"}
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
