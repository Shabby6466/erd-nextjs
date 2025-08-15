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
  const [sheetNo, setSheetNo] = useState("")
  const [isPrinting, setIsPrinting] = useState(false)

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

  const handlePrint = async () => {
    if (!sheetNo.trim()) {
      showNotification.error("Please enter a sheet number")
      return
    }

    setIsPrinting(true)
    try {
      // Call the print API with sheet number
      await applicationAPI.printApplicationWithSheet(application!.id, sheetNo.trim())
      
      // Show success message
      showNotification.success("Print request submitted successfully")
      
      // Trigger browser print
      window.print()
    } catch (error) {
      showNotification.error("Failed to submit print request")
      console.error('Print error:', error)
    } finally {
      setIsPrinting(false)
    }
  }

  // Generate OCR lines for machine readability
  const generateOCR1 = (application: Application) => {
    const surname = application.lastName?.toUpperCase() || ""
    const givenNames = application.firstName?.replace('','<').toUpperCase() || ""
    return `E<PAK${surname}<<${givenNames}<<<<<<<<<<<<<`
  }

  const generateOCR2 = (application: Application) => {
    const documentNo = application.id?.replace(/-/g, "") || "000000000"
    const citizenNo = application.citizenId?.replace(/-/g, "") || "0000000000000"
    const birthDate = application.dateOfBirth ? new Date(application.dateOfBirth).toISOString().slice(2, 10).replace(/-/g, "") : "000000"
    const expiryDate = application.etdExpiryDate ? new Date(application.etdExpiryDate).toISOString().slice(2, 10).replace(/-/g, "") : "000000"
    const gender = application.gender?.toUpperCase() === "MALE" ? "M" : "F"
    
    return `${documentNo}<8PAK${birthDate}${gender}${expiryDate}${citizenNo}<`
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
    <div className="max-w-[491.34px] mx-auto overflow-hidden bg-white print:p-0 print:m-0 print:max-w-none">
      {/* Print Controls - Hidden during print */}
      <div className="print:hidden mb-4 text-center relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="sheetNo" className="text-sm font-medium text-gray-700">
              Sheet Number:
            </label>
            <input
              id="sheetNo"
              type="text"
              value={sheetNo}
              onChange={(e) => setSheetNo(e.target.value)}
              placeholder="Enter sheet number"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isPrinting}
            />
          </div>
          <button
            onClick={handlePrint}
            disabled={isPrinting || !sheetNo.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPrinting ? "Printing..." : "Print Document"}
          </button>
          <p className="text-sm text-gray-600">
            This document will be formatted for A4 paper printing
          </p>
        </div>
      </div>

      {/* Watermarks for official document appearance */}
    
      
      {/* Document Container - Following exact dimensions from image */}
      <div className="absolute bottom-0 w-[500.34px] h-[1020px] print:border-0 print-document z-0">
        
        {/* TOP SECTION (1st half) - Blank header area */}
        <div className="absolute top-0 left-0 w-full h-[340px]  ">
          {/* Top border */}
          <div className="absolute top-0 left-0 w-full h-[1px] "></div>
          {/* Right border */}
          <div className="absolute top-0 right-0 w-[1px] h-full"></div>
        </div>

        {/* MIDDLE SECTION (2nd half) - Remarks area with rotated text */}
        {/* <div className="absolute top-[340px] left-0 w-full h-[340px] "> */}
          {/* Rotated text on the left side */}
          {/* <div className="absolute left-[30px] top-[50px] transform -rotate-90 origin-top-left">
            <div className="text-[14px] font-semibold text-black-800 mb-2">ETD No.</div>
            <div className="text-[14px] font-semibold text-black-800 mb-2">OFFICIAL OBSERVATIONS</div>
            <div className="text-[14px] font-semibold text-black-800 mb-2">Reasons for issuance of ETD</div>
            <div className="text-[14px] font-semibold text-black-800 ml-4">Remarks</div>
          </div>
        </div> */}

        {/* BOTTOM SECTION (3rd half) - ETD document */}
        <div className="absolute bottom-0 left-0 w-full h-[340px]">
          {/* White document area within gray frame */}
        
            
            {/* Left side - Photograph */}
            {application.image && (
              <div className="absolute left-[45px] bottom-[195px] w-[120px] h-[150px] border border-gray-400">
                <img 
                  src={`data:image/jpeg;base64,${application.image}`}
                  alt="Citizen Photograph" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Right side - Document information */}
            <div className="absolute  left-[185px] bottom-[188px] right-[120px]">
              
              {/* Top row - Type, Country Code, Document No */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Type
                 <br />
                  <span className="text-[8px] font-semibold">{application.processing?.type}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Country Code<br />
                  <span className="text-[8px] font-semibold">{application.processing?.country_code}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[5px] text-gray-500">Document No.<br/>
                  <span className="text-[8px] font-semibold">{application.processing?.document_no}</span>
                  </span>
                </div>
              </div>

              {/* Personal Information - Left column */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[5px] text-gray-500">Surname<br/>
                  <span className="text-[8px] font-semibold">{application.lastName?.toUpperCase()}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Citizen Number<br/>
                  <span className="text-[8px] font-semibold">{application.citizenId}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Given Names<br/>
                  <span className="text-[8px] font-semibold">{application.firstName?.toUpperCase()}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Sex<br/>
                  <span className="text-[8px] font-semibold">{application.gender?.toUpperCase() === "MALE" ? "M" : "F"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Father Name<br/>
                  <span className="text-[8px] font-semibold">{application.fatherName?.toUpperCase()}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Nationality<br/>
                  <span className="text-[8px] font-semibold">{application.processing?.nationality}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Tracking Number<br/>
                  <span className="text-[8px] font-semibold">{application.processing?.tracking_id}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Date of birth<br/>
                  <span className="text-[8px] font-semibold">{formatDate(application.dateOfBirth)}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Issuing Authority<br/>
                  <span className="text-[8px] font-semibold">{application.processing?.nationality}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Date of issue<br/>
                  <span className="text-[8px] font-semibold">{application.etdIssueDate ? formatDate(application.etdIssueDate) : formatDate(application.updatedAt)}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-gray-500">Date of expiry<br/>
                  <span className="text-[8px] font-semibold">{application.etdExpiryDate ? formatDate(application.etdExpiryDate) : "3 MONTHS FROM ISSUE"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom - Machine Readable Zone (MRZ) */}
            <div className="absolute bottom-[135px] left-[60px] gap-[0.25px]  ">
              <div className="text-[11.5px] font-mono-bold tracking-wider ocr-text leading-tight">
                {application?.processing?.mrz_line1}
              </div>
              <div className="text-[11.5px] font-mono-bold tracking-wider ocr-text leading-tight">
                {application?.processing?.mrz_line2}
              </div>
            </div>
        
        </div>

        {/* Security Pattern Overlay */}
        {/* <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.1) 2px,
              rgba(0,0,0,0.1) 4px
            )`
          }}></div>
        </div> */}

      </div>
    </div>
  )
}