"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Application } from "@/lib/types"
import { showNotification } from "@/lib/utils/notifications"
import { formatDate } from "@/lib/utils/formatting"
import { applicationAPI } from "@/lib/api/applications"
import DGIPWatermarks from "@/components/ui/dgip_watermark"
import SheetSelector from "@/components/operator/SheetSelector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, FileText, User, Calendar } from "lucide-react"

export default function PrintApplicationPage() {
  const params = useParams()
  const router = useRouter()
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

  const handlePrint = async () => {
    if (!sheetNo.trim()) {
      showNotification.error("Please select a sheet number")
      return
    }

    // Check application status before printing
    if (!application) {
      showNotification.error("Application data not available")
      return
    }

    // Check if application status allows printing
    const allowedStatuses = ['READY_FOR_PRINT', 'APPROVED', 'VERIFIED']
    if (!allowedStatuses.includes(application.status)) {
      showNotification.error(`Application status "${application.status}" does not allow printing. Status must be: ${allowedStatuses.join(', ')}`)
      return
    }

    setIsPrinting(true)
    try {
      // Call the print API with sheet number
      await applicationAPI.printApplicationWithSheet(application.id, sheetNo.trim())

      // Show success message
      showNotification.success("Print request submitted successfully")

      // Trigger browser print
      window.print()
      
      // Wait a moment for print dialog to close, then close the window/tab
      setTimeout(() => {
        // Close the current window/tab after successful printing
        window.close()
        // Fallback: if window.close() doesn't work (due to browser security), redirect to dashboard
        setTimeout(() => {
          router.push('/missions')
        }, 1000)
      }, 3000) // 3 second delay to allow print dialog to close and user to see success message
    } catch (error) {
      showNotification.error("Failed to submit print request")
      console.error('Print error:', error)
    } finally {
      setIsPrinting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600">The requested application could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="print:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Document Print Center</h1>
                <p className="text-sm text-gray-500">Print ETD Application</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Application ID: {application.id}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Print Controls */}
          <div className="print:hidden lg:col-span-1">
            <div className="space-y-6">
              {/* Application Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Application Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium">{application.firstName} {application.lastName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Citizen ID</p>
                      <p className="font-medium">{application.citizenId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <Badge variant="secondary" className="text-xs">
                        {application.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">{formatDate(application.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Print Controls Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Printer className="h-5 w-5" />
                    <span>Print Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sheet Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sheet Number</label>
                    <SheetSelector
                      onSheetSelect={setSheetNo}
                      selectedSheet={sheetNo}
                      disabled={isPrinting}
                      compact={true}
                    />
                  </div>

                  {/* Print Button */}
                  <Button
                    onClick={handlePrint}
                    disabled={isPrinting || !sheetNo.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isPrinting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Printer className="h-4 w-4 mr-2" />
                        Print Document
                      </>
                    )}
                  </Button>

                  {/* Validation Message */}
                  {!sheetNo.trim() && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      Please select a sheet number to proceed with printing
                    </div>
                  )}

                  {/* Print Instructions */}
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    <p className="font-medium mb-1">Print Instructions:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Document will be formatted for A4 paper</li>
                      <li>• Ensure printer is properly configured</li>
                      <li>• Use high-quality paper for best results</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Print History Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Print History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    <p>Last printed: {application.etdIssueDate ? formatDate(application.etdIssueDate) : 'Never'}</p>
                    <p>Document type: {application.processing?.type || 'ETD'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Document Preview */}
          <div className="lg:col-span-2">
            <Card className="print:hidden mb-6">
              <CardHeader>
                <CardTitle>Document Preview</CardTitle>
                <p className="text-sm text-gray-500">Preview of the document that will be printed</p>
              </CardHeader>
            </Card>

            {/* Document Container */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none">
              <div className="max-w-[491.34px] mx-auto overflow-hidden bg-white print:p-0 print:m-0 print:max-w-none">
                {/* Document Container - Following exact dimensions from image */}
                <div className="absolute bottom-0 w-[500.34px] h-[1020px] print:border-0 print-document z-0">

                  {/* TOP SECTION (1st half) - Blank header area */}
                  <div className="absolute top-0 left-0 w-full h-[340px]">
                    {/* Top border */}
                    <div className="absolute top-0 left-0 w-full h-[1px]"></div>
                    {/* Right border */}
                    <div className="absolute top-0 right-0 w-[1px] h-full"></div>
                  </div>
                  {/* MID SECTION (2nd half) - Blank header area */}
                  <div className="absolute top-[340px] left-0 w-full h-[340px]">
                    {/* Top border */}
                    <div className="absolute top-0 left-0 w-full h-[1px]"></div>
                    {/* Right border */}
                    <div className="absolute top-0 right-0 w-[1px] h-full"></div>
                  </div>

                  {/* BOTTOM SECTION (3rd half) - ETD document */}
                  <div className="absolute bottom-0 left-0 w-full h-[340px]">
                    {/* Left side - Photograph */}
                    {application.image && (
                      <div className="absolute left-[18px] bottom-[200px] w-[125px] h-[160px] border border-gray-400">
                        <img
                          src={`data:image/jpeg;base64,${application.image}`}
                          alt="Citizen Photograph"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Right side - Document information */}
                    <div className="absolute left-[165px] bottom-[188px] right-[120px]">

                      {/* Top row - Type, Country Code, Document No */}
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Type
                            <br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Calibri, sans-serif', fontWeight: 500 }}>{application.processing?.type}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Country Code<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Calibri, sans-serif', fontWeight: 500 }}>{application.processing?.country_code}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Document No.<br />
                            <span className="text-[11px] font-semibold " style={{ fontFamily: 'Calibri, sans-serif', fontWeight: 500 }}>{application.processing?.document_no}</span>
                          </span>
                        </div>
                      </div>

                      {/* Personal Information - Left column */}
                      <div className="grid grid-cols-2 gap-x-14 gap-y-1">
                        <div className="flex items-center gap-4 gap-y-[1px]">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Surname<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Calibri, sans-serif', fontWeight: 500 }}>{application.lastName?.toUpperCase()}</span>
                          </span>
                        </div>
                        <div></div>
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Given Names<br />
                            <span className="text-[11px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }}>{application.firstName?.toUpperCase()}</span>
                          </span>
                        </div>
                        <div></div>
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Father Name<br />
                            <span className="text-[11px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }}>{application.fatherName?.toUpperCase()}</span>
                          </span>
                        </div>
                        <div></div>
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Citizen Number<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }}>{application.citizenId}</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Sex<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }}>{application.gender?.toUpperCase() === "MALE" ? "M" : "F"}</span>
                          </span>
                        </div>
                       
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Nationality<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }} >{application.processing?.nationality}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Tracking Number<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }}>{application.processing?.tracking_id}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Date of birth<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }}>{formatDate(application.dateOfBirth)}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Issuing Authority<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }}>{application.processing?.nationality}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Date of issue<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }}>{application.etdIssueDate ? formatDate(application.etdIssueDate) : formatDate(application.updatedAt)}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[8px] text-gray-500 leading-[1.1]">Date of expiry<br />
                            <span className="text-[11px] font-semibold" style={{ fontFamily: 'Tahoma, sans-serif', fontWeight: 500 }}>{application.etdExpiryDate ? formatDate(application.etdExpiryDate) : "3 MONTHS FROM ISSUE"}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom - Machine Readable Zone (MRZ) */}
                    <div className="absolute bottom-[135px] left-[45%] -translate-x-1/2 text-center">
                      <div className="text-[14px] leading-tight tracking-[0.13em]" style={{ fontFamily: 'OCR-B, monospace' }}>
                        {application?.processing?.mrz_line1}
                      </div>
                      <div className="text-[14px] leading-tight leading-tight tracking-[0.13em]" style={{ fontFamily: 'OCR-B, monospace' }}>
                        {application?.processing?.mrz_line2}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}