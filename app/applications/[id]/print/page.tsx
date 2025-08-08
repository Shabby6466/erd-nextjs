"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Application } from "@/lib/types"
import { showNotification } from "@/lib/utils/notifications"
import { formatDate } from "@/lib/utils/formatting"
import { applicationAPI } from "@/lib/api/applications"

export default function PrintApplicationPage() {
  const params = useParams()
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const data = await applicationAPI.getById(params.id as string)
        setApplication(data)
      } catch (error) {
        showNotification.error("Failed to fetch application details")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchApplication()
    }
  }, [params.id])

  useEffect(() => {
    if (application) {
      // Auto-print when application is loaded
      window.print()
    }
  }, [application])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Application not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen print:p-4">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          EMERGENCY TRAVEL DOCUMENT
        </h1>
        <p className="text-lg text-gray-600">
          Government of Pakistan - Ministry of Interior
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Application ID: {application.id}
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">
            Personal Information
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-gray-700">First Name:</label>
                <p className="text-gray-900">{application.firstName}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Last Name:</label>
                <p className="text-gray-900">{application.lastName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-gray-700">Father&apos;s Name:</label>
                <p className="text-gray-900">{application.fatherName}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Mother&apos;s Name:</label>
                <p className="text-gray-900">{application.motherName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-gray-700">CNIC:</label>
                <p className="text-gray-900 font-mono">{application.citizenId}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Date of Birth:</label>
                <p className="text-gray-900">{formatDate(application.dateOfBirth)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-gray-700">Nationality:</label>
                <p className="text-gray-900">{application.nationality}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Profession:</label>
                <p className="text-gray-900">{application.profession}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Photograph Section */}
          {application.image && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">
                Photograph
              </h2>
              <div className="flex justify-center mb-4">
                <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                  <img 
                    src={`data:image/jpeg;base64,${application.image}`}
                    alt="Citizen Photograph" 
                    className="w-32 h-40 object-cover rounded"
                  />
                </div>
              </div>
            </div>
          )}
          
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">
            Physical Description
          </h2>
          <div className="space-y-3">
            <div>
              <label className="font-medium text-gray-700">Height:</label>
              <p className="text-gray-900">{application.height}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Eye Color:</label>
              <p className="text-gray-900">{application.colorOfEyes}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Hair Color:</label>
              <p className="text-gray-900">{application.colorOfHair}</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mt-6 mb-4 border-b border-gray-200 pb-2">
            Address Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="font-medium text-gray-700">City:</label>
              <p className="text-gray-900">{application.pakistanCity}</p>
            </div>
            <div>
              <label className="font-medium text-gray-700">Address:</label>
              <p className="text-gray-900">{application.pakistanAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">
          Travel Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-gray-700">Departure Date:</label>
            <p className="text-gray-900">{formatDate(application.departureDate)}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Transport Mode:</label>
            <p className="text-gray-900">{application.transportMode}</p>
          </div>
        </div>
      </div>

      {/* Status and Approval */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">
          Document Status
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-gray-700">Status:</label>
            <p className="text-gray-900 font-semibold">{application.status}</p>
          </div>
          <div>
            <label className="font-medium text-gray-700">Issue Date:</label>
            <p className="text-gray-900">{formatDate(application.updatedAt)}</p>
          </div>
        </div>
        {application.remarks && (
          <div className="mt-4">
            <label className="font-medium text-gray-700">Remarks:</label>
            <p className="text-gray-900">{application.remarks}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t-2 border-gray-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              This document is valid for emergency travel purposes only.
            </p>
            <p className="text-sm text-gray-600">
              Issued by: Government of Pakistan - Ministry of Interior
            </p>
          </div>
          <div className="text-right">
            <div className="border border-gray-400 p-4 min-h-[80px] min-w-[120px]">
              <p className="text-xs text-gray-500 text-center">Official Seal</p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Document generated on {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>
    </div>
  )
}