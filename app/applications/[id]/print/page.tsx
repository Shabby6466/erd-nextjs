"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Application } from "@/lib/types"
import { showNotification } from "@/lib/utils/notifications"
import { formatDate } from "@/lib/utils/formatting"
import { applicationAPI } from "@/lib/api/applications"
import DGIPWatermarks from "@/components/ui/dgip_watermark"

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
      // window.print() // Commented out to let user control printing
    }
  }, [application])

  const handlePrint = () => {
    window.print()
  }

  // Generate OCR lines for machine readability
  const generateOCR1 = (application: Application) => {
    const surname = application.lastName?.toUpperCase() || ""
    const givenNames = application.firstName?.toUpperCase() || ""
    return `P<PAK${surname}<<${givenNames}<<<<<<<<<<<<<<<<<<<<<<<<<<`
  }

  const generateOCR2 = (application: Application) => {
    const documentNo = application.id?.replace(/-/g, "") || "000000000"
    const citizenNo = application.citizenId?.replace(/-/g, "") || "0000000000000"
    const birthDate = application.dateOfBirth ? new Date(application.dateOfBirth).toISOString().slice(2, 10).replace(/-/g, "") : "000000"
    const expiryDate = application.etdExpiryDate ? new Date(application.etdExpiryDate).toISOString().slice(2, 10).replace(/-/g, "") : "000000"
    const gender = application.gender?.toUpperCase() === "MALE" ? "M" : "F"
    
    return `${documentNo}<8PAK${birthDate}${gender}${expiryDate}${citizenNo}<<<<<<<<<<<<<<`
  }

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
    <div className="max-w-[263mm] mx-auto bg-white min-h-[123mm] print:p-0 print:m-0 print:max-w-none print:min-h-screen">
      {/* Print Controls - Hidden during print */}
      <div className="print:hidden mb-4 text-center">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Print Document
        </button>
        <p className="text-sm text-gray-600 mt-2">
          This document will be formatted for A4 paper printing
        </p>
      </div>

      {/* Watermarks for official document appearance */}
      <DGIPWatermarks 
        leftOpacity={0.05} 
        rightOpacity={0.03} 
        layerZ={1}
      />
      
      {/* Document Container - Following NPF.ini dimensions */}
      <div className="relative w-[263mm] h-[123mm] bg-white border border-gray-300 print:border-0 print-document">
        
        {/* Header - Islamic Republic of Pakistan */}
        <div className="absolute top-[7.8mm] left-[7.8mm] text-[6pt] font-bold text-gray-800">
          ISLAMIC REPUBLIC OF
        </div>
        <div className="absolute top-[9.1mm] left-[6.4mm] text-[14pt] font-bold text-gray-800">
          PAKISTAN
        </div>
        <div className="absolute top-[15mm] left-[12mm] text-[14pt] font-bold text-gray-800">
          EMERGENCY TRAVEL DOCUMENT
        </div>

        {/* Document Type and Country Code */}
        <div className="absolute top-[190mm] left-[87mm] text-[5pt] text-gray-600">
          Type
        </div>
        <div className="absolute top-[192.5mm] left-[89mm] text-[8pt] font-semibold">
          P
        </div>

        <div className="absolute top-[190mm] left-[98mm] text-[5pt] text-gray-600">
          Country Code
        </div>
        <div className="absolute top-[192.5mm] left-[100mm] text-[8pt] font-semibold">
          PAK
        </div>

        {/* Document Number */}
        <div className="absolute top-[190mm] left-[119mm] text-[5pt] text-gray-600">
          Document No
        </div>
        <div className="absolute top-[192.5mm] left-[121mm] text-[8pt] font-semibold">
          {application.id}
        </div>

        {/* Personal Information */}
        <div className="absolute top-[196.5mm] left-[87mm] text-[5pt] text-gray-600">
          Surname
        </div>
        <div className="absolute top-[198.5mm] left-[89mm] text-[8pt] font-semibold">
          {application.lastName?.toUpperCase()}
        </div>

        <div className="absolute top-[202.5mm] left-[87mm] text-[5pt] text-gray-600">
          Given Names
        </div>
        <div className="absolute top-[204.5mm] left-[89mm] text-[8pt] font-semibold">
          {application.firstName?.toUpperCase()}
        </div>

        <div className="absolute top-[208.5mm] left-[87mm] text-[5pt] text-gray-600">
          Nationality
        </div>
        <div className="absolute top-[210.5mm] left-[89mm] text-[8pt] font-semibold">
          PAKISTANI
        </div>

        <div className="absolute top-[214.5mm] left-[87mm] text-[5pt] text-gray-600">
          Date of birth
        </div>
        <div className="absolute top-[216.5mm] left-[89mm] text-[8pt] font-semibold">
          {formatDate(application.dateOfBirth)}
        </div>

        <div className="absolute top-[220.5mm] left-[87mm] text-[5pt] text-gray-600">
          Sex
        </div>
        <div className="absolute top-[222.5mm] left-[89mm] text-[8pt] font-semibold">
          {application.gender?.toUpperCase() === "MALE" ? "M" : "F"}
        </div>

        <div className="absolute top-[226.5mm] left-[87mm] text-[5pt] text-gray-600">
          Date of Issue
        </div>
        <div className="absolute top-[228.5mm] left-[89mm] text-[8pt] font-semibold">
          {application.etdIssueDate ? formatDate(application.etdIssueDate) : formatDate(application.updatedAt)}
        </div>

        <div className="absolute top-[232.5mm] left-[87mm] text-[5pt] text-gray-600">
          Date of Expiry
        </div>
        <div className="absolute top-[234.5mm] left-[89mm] text-[8pt] font-semibold">
          {application.etdExpiryDate ? formatDate(application.etdExpiryDate) : "6 MONTHS FROM ISSUE"}
        </div>

        {/* Right Column Information */}
        <div className="absolute top-[220.5mm] left-[119mm] text-[5pt] text-gray-600">
          Citizen Number
        </div>
        <div className="absolute top-[222.5mm] left-[121mm] text-[8pt] font-semibold">
          {application.citizenId}
        </div>

        <div className="absolute top-[226.5mm] left-[119mm] text-[5pt] text-gray-600">
          Issuing Authority
        </div>
        <div className="absolute top-[228.5mm] left-[121mm] text-[8pt] font-semibold">
          PAKISTAN
        </div>

        <div className="absolute top-[232.5mm] left-[119mm] text-[5pt] text-gray-600">
          Tracking Number
        </div>
        <div className="absolute top-[234.5mm] left-[121mm] text-[8pt] font-semibold">
          {application.id}
        </div>

        {/* OCR Lines - Machine Readable Text */}
        <div className="absolute top-[246mm] left-[48mm] text-[10.49pt] font-mono tracking-wider ocr-text">
          {generateOCR1(application)}
        </div>
        <div className="absolute top-[252mm] left-[48mm] text-[10.49pt] font-mono tracking-wider ocr-text">
          {generateOCR2(application)}
        </div>

        {/* Photograph */}
        {application.image && (
          <div className="absolute top-[202mm] left-[48mm] w-[30mm] h-[38.4mm] border border-gray-400">
            <img 
              src={`data:image/jpeg;base64,${application.image}`}
              alt="Citizen Photograph" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Additional Information Box */}
        <div className="absolute top-[260mm] left-[87mm] w-[150mm] h-[20mm] border border-gray-400 p-2">
          <div className="text-[6pt] text-gray-600 mb-1">Additional Information:</div>
          <div className="text-[7pt] text-gray-800">
            <div>Profession: {application.profession}</div>
            <div>Address: {application.pakistanAddress}, {application.pakistanCity}</div>
            <div>Transport Mode: {application.transportMode}</div>
            <div>Departure Date: {formatDate(application.departureDate)}</div>
          </div>
        </div>

        {/* Security Features */}
        <div className="absolute top-[285mm] left-[87mm] w-[150mm] h-[15mm] border border-gray-400 p-2">
          <div className="text-[6pt] text-gray-600 mb-1">Security Features:</div>
          <div className="text-[7pt] text-gray-800">
            <div>• Holographic Overlay</div>
            <div>• UV Reactive Ink</div>
            <div>• Micro-text Security Pattern</div>
          </div>
        </div>

        {/* Status Indicator */}
        {application.status === "APPROVED" && (
          <div className="absolute top-[305mm] left-[87mm] w-[150mm] h-[8mm] bg-green-100 border border-green-400 p-1">
            <div className="text-[8pt] font-bold text-green-800 text-center">
              ✓ APPROVED FOR TRAVEL
            </div>
          </div>
        )}

        {application.status === "REJECTED" && (
          <div className="absolute top-[305mm] left-[87mm] w-[150mm] h-[8mm] bg-red-100 border border-red-400 p-1">
            <div className="text-[8pt] font-bold text-red-800 text-center">
              ✗ APPLICATION REJECTED
            </div>
          </div>
        )}

        {/* Blacklist Check Status */}
        {application.blacklistCheckPassed !== undefined && (
          <div className="absolute top-[315mm] left-[87mm] w-[150mm] h-[8mm] border border-gray-400 p-1">
            <div className="text-[7pt] text-gray-800">
              Blacklist Check: {application.blacklistCheckPassed ? "✓ PASSED" : "✗ FAILED"}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-[5mm] left-[10mm] right-[10mm] text-center">
          <div className="text-[6pt] text-gray-600">
            This document is valid for emergency travel purposes only. Issued by the Government of Pakistan.
          </div>
          <div className="text-[5pt] text-gray-500 mt-1">
            Generated on {formatDate(new Date().toISOString())} | Document ID: {application.id}
          </div>
        </div>

        {/* Official Seal Placeholder */}
        <div className="absolute bottom-[15mm] right-[15mm] w-[20mm] h-[20mm] border-2 border-gray-400 border-dashed rounded-full flex items-center justify-center">
          <div className="text-[5pt] text-gray-500 text-center">
            OFFICIAL<br />SEAL
          </div>
        </div>

        {/* Security Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.1) 2px,
              rgba(0,0,0,0.1) 4px
            )`
          }}></div>
        </div>

      </div>
    </div>
  )
}