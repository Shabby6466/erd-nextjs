"use client"

import { useState } from "react"
import { Application, QcFailure } from "@/lib/types"
import { applicationAPI } from "@/lib/api/applications"
import { showNotification } from "@/lib/utils/notifications"

interface QCModalProps {
  application: Application | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function QCModal({ application, isOpen, onClose, onSuccess }: QCModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [failureReason, setFailureReason] = useState("")
  const [qcAction, setQcAction] = useState<"pass" | "fail" | null>(null)

  const handleQcPass = async () => {
    if (!application) return

    setIsLoading(true)
    setQcAction("pass")
    
    try {
      await applicationAPI.qcPass(application.id)
      showNotification.success("QC Passed - Application completed successfully")
      onSuccess()
      onClose()
    } catch (error) {
      showNotification.error("Failed to pass QC")
      console.error('QC Pass error:', error)
    } finally {
      setIsLoading(false)
      setQcAction(null)
    }
  }

  const handleQcFail = async () => {
    if (!application) return

    setIsLoading(true)
    setQcAction("fail")
    
    try {
      await applicationAPI.qcFail(application.id, failureReason.trim() || undefined)
      showNotification.success("QC Failed - Document needs to be reprinted")
      onSuccess()
      onClose()
    } catch (error) {
      showNotification.error("Failed to fail QC")
      console.error('QC Fail error:', error)
    } finally {
      setIsLoading(false)
      setQcAction(null)
    }
  }

  const canPerformQC = application?.status === 'READY_FOR_QC'

  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Quality Control</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Application ID: <span className="font-medium">{application.id}</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Sheet No: <span className="font-medium">{application.processing?.sheet_no || "Not printed"}</span>
          </p>
          <p className="text-sm text-gray-600">
            Status: <span className="font-medium">{application.processing?.status || "Unknown"}</span>
          </p>
        </div>

        {!canPerformQC && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              QC can only be performed on applications with status "READY_FOR_QC".
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* QC Pass Button */}
          <button
            onClick={handleQcPass}
            disabled={isLoading || !canPerformQC}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {qcAction === "pass" && isLoading ? "Processing..." : "QC Pass"}
          </button>

          {/* QC Fail Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-red-600 mb-3">QC Fail</h3>
            
            <div className="mb-3">
              <label htmlFor="failureReason" className="block text-sm font-medium text-gray-700 mb-1">
                Failure Reason (Optional)
              </label>
              <textarea
                id="failureReason"
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                placeholder="Enter reason for QC failure..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                disabled={isLoading || !canPerformQC}
              />
            </div>

            <button
              onClick={handleQcFail}
              disabled={isLoading || !canPerformQC}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {qcAction === "fail" && isLoading ? "Processing..." : "QC Fail"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
