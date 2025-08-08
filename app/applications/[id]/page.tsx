"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Application, Region, UserRole } from "@/lib/types"
import { applicationAPI } from "@/lib/api/applications"
import { attachmentAPI } from "@/lib/api/attachments"
import { formatDate, formatDateTime, formatStatus, getStatusVariant } from "@/lib/utils/formatting"
import { showNotification } from "@/lib/utils/notifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Printer, Upload, CheckCircle, XCircle, AlertTriangle, Send, FileText, Eye, Download } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { SendForVerificationModal } from "@/components/ministry/SendForVerificationModal"
import { SubmitVerificationModal } from "@/components/agency/SubmitVerificationModal"
import { MinistryReviewModal } from "@/components/ministry/MinistryReviewModal"
import { PDFLink } from "@/components/ui/PDFViewer"




export default function ApplicationViewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()

  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false)
  const [showSendForVerificationModal, setShowSendForVerificationModal] = useState(false)
  const [showSubmitVerificationModal, setShowSubmitVerificationModal] = useState(false)
  const [showMinistryReviewModal, setShowMinistryReviewModal] = useState(false)

  const role: UserRole | undefined = user?.role as UserRole | undefined
  console.log('User role:', role)
  console.log('Application status:', application?.status)
  const canPerformAction = useMemo(() => {
    if (!application) return false
    const status = application.status
    switch (role) {
      case "MISSION_OPERATOR":
        return status === "DRAFT"
      case "AGENCY":
        return ["SUBMITTED", "AGENCY_REVIEW", "PENDING_VERIFICATION"].includes(status)
      case "MINISTRY":
        return ["DRAFT", "SUBMITTED", "MINISTRY_REVIEW", "AGENCY_REVIEW", "VERIFICATION_SUBMITTED", "VERIFICATION_RECEIVED"].includes(status)
      case "ADMIN":
        return true
      default:
        return false
    }
  }, [application, role])

  console.log('Can perform action:', canPerformAction)

  const canPrint = useMemo(() => {
    if (!application) return false
    return role === "MISSION_OPERATOR" && ["APPROVED", "COMPLETED"].includes(application.status)
  }, [application, role])



  const refresh = async () => {
    if (!params?.id) return
    setIsLoading(true)
    try {
      const data = await applicationAPI.getById(params.id as string)
      setApplication(data)
    } catch {
      showNotification.error("Failed to fetch application details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id])

  const handleUploadAttachment = async (file: File) => {
    if (!application) return
    setIsActionLoading(true)
    try {
      await attachmentAPI.upload(application.id, file)
      showNotification.success("Attachment uploaded")
      await refresh()
    } catch {
      showNotification.error("Failed to upload attachment")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleAgencyApprove = async () => {
    if (!application) return
    setIsActionLoading(true)
    try {
      await applicationAPI.agencyApprove(application.id)
      showNotification.success("Application approved and sent to Ministry")
      await refresh()
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      showNotification.error(message || "Failed to approve application")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleAgencyReject = async () => {
    if (!application) return
    const remarks = window.prompt("Enter rejection remarks:")
    if (!remarks) return
    setIsActionLoading(true)
    try {
      await applicationAPI.agencyReject(application.id, remarks)
      showNotification.success("Application rejected")
      await refresh()
    } catch {
      showNotification.error("Failed to reject application")
    } finally {
      setIsActionLoading(false)
    }
  }

  // New Ministry Review handlers
  const handleMinistryReviewApprove = async (data: { approved: boolean; black_list_check: boolean }) => {
    if (!application) return
    setIsActionLoading(true)
    try {
      await applicationAPI.ministryReview(application.id, {
        approved: true,
        black_list_check: data.black_list_check
      })
      showNotification.success("Application approved successfully")
      await refresh()
    } catch (error) {
      const message = (error as any)?.response?.data?.message || "Failed to approve application"
      showNotification.error(message)
      throw error // Re-throw to handle in modal
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleMinistryReviewReject = async (data: { approved: boolean; black_list_check: boolean; rejection_reason: string }) => {
    if (!application) return
    setIsActionLoading(true)
    try {
      await applicationAPI.ministryReview(application.id, {
        approved: false,
        black_list_check: data.black_list_check,
        rejection_reason: data.rejection_reason
      })
      showNotification.success("Application rejected")
      await refresh()
    } catch (error) {
      const message = (error as any)?.response?.data?.message || "Failed to reject application"
      showNotification.error(message)
      throw error // Re-throw to handle in modal
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleMinistryApprove = async () => {
    if (!application) return
    setIsActionLoading(true)
    try {
      // Use new status update API for VERIFICATION_RECEIVED status
      if (application.status === "VERIFICATION_RECEIVED") {
        await applicationAPI.updateStatus(application.id, {
          status: "APPROVED"
        })
      } else {
        // Use legacy API for other statuses
        await applicationAPI.ministryApprove(application.id)
      }
      showNotification.success("Application approved")
      await refresh()
    } catch {
      showNotification.error("Failed to approve application")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleMinistryReject = async () => {
    if (!application) return
    const rejectionReason = window.prompt("Enter rejection reason:")
    if (!rejectionReason) return
    setIsActionLoading(true)
    try {
      // Use new status update API for VERIFICATION_RECEIVED status
      if (application.status === "VERIFICATION_RECEIVED") {
        await applicationAPI.updateStatus(application.id, {
          status: "REJECTED",
          rejection_reason: rejectionReason
        })
      } else {
        // Use legacy API for other statuses
        await applicationAPI.ministryReject(application.id, rejectionReason)
      }
      showNotification.success("Application rejected")
      await refresh()
    } catch {
      showNotification.error("Failed to reject application")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleBlacklist = async () => {
    if (!application) return
    const remarks = window.prompt("Enter blacklist reason:")
    if (!remarks) return
    setIsActionLoading(true)
    try {
      await applicationAPI.blacklist(application.id, remarks)
      showNotification.success("Application blacklisted")
      await refresh()
    } catch {
      showNotification.error("Failed to blacklist application")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleSendToAgency = async () => {
    if (!application) return
    const region = window.prompt("Select region (PUNJAB, SINDH, KPK, BALOCHISTAN, GILGIT_BALTISTAN, AJK):") as Region
    if (!region) return
    setIsActionLoading(true)
    try {
      await applicationAPI.sendToAgency(application.id, region)
      showNotification.success("Application sent to agency")
      await refresh()
    } catch {
      showNotification.error("Failed to send to agency")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handlePrintApplication = async () => {
    if (!application) return
    
    try {
      setIsActionLoading(true)
      const blob = await applicationAPI.printApplication(application.id)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `application-${application.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      showNotification.success("Application downloaded successfully")
    } catch (error) {
      showNotification.error("Failed to download application")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleSendForVerification = async (data: {
    agencies: string[]
    verification_document?: File
    remarks?: string
  }) => {
    if (!application) return
    
    try {
      setIsActionLoading(true)
      await applicationAPI.sendForVerification(application.id, data)
      showNotification.success("Application sent for verification")
      setShowSendForVerificationModal(false)
      await refresh()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || "Failed to send for verification")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleSubmitVerification = async (data: {
    remarks: string
    attachment?: File
  }) => {
    if (!application) return
    
    try {
      setIsActionLoading(true)
      await applicationAPI.submitVerification(application.id, data)
      showNotification.success("Verification submitted successfully")
      setShowSubmitVerificationModal(false)
      await refresh()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || "Failed to submit verification")
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDirectReject = async () => {
    if (!application) return
    const remarks = window.prompt("Enter rejection remarks:")
    if (!remarks) return
    
    try {
      setIsActionLoading(true)
      await applicationAPI.updateStatus(application.id, {
        status: 'REJECTED',
        rejection_reason: remarks
      })
      showNotification.success("Application rejected")
      await refresh()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || "Failed to reject application")
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading application...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Application not found</p>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
    <div className="max-w-6xl mx-auto p-6 space-y-6 ">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(application.status)}>
            {formatStatus(application.status)}
          </Badge>
          {canPrint && (
            <Button onClick={() => router.push(`/applications/${application.id}/print`)}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application #{application.id}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Photograph Section */}
          {application.image && (
            <div className="mb-6">
              <Section title="Photograph">
                <div className="flex justify-center">
                  <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                    <img 
                      src={`data:image/jpeg;base64,${application.image}`}
                      alt="Citizen Photograph" 
                      className="w-32 h-40 object-cover rounded"
                    />
                  </div>
                </div>
              </Section>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Section title="Personal Information">
                <GridItem label="First Name" value={application.firstName} />
                <GridItem label="Last Name" value={application.lastName} />
                <GridItem label="Father's Name" value={application.fatherName} />
                <GridItem label="Mother's Name" value={application.motherName} />
                <GridItem label="Citizen ID" value={application.citizenId} mono />
                <GridItem label="Date of Birth" value={formatDate(application.dateOfBirth)} />
                <GridItem label="Birth Country" value={application.birthCountry || '-'} />
                <GridItem label="Birth City" value={application.birthCity || '-'} />
                <GridItem label="Profession" value={application.profession} />
              </Section>
            </div>
            <div className="space-y-4">
              <Section title="Physical & Address">
                <GridItem label="Height" value={String(application.height)} />
                <GridItem label="Eye Color" value={application.colorOfEyes} />
                <GridItem label="Hair Color" value={application.colorOfHair} />
                <GridItem label="City" value={application.pakistanCity} />
                <GridItem label="Address" value={application.pakistanAddress} />
              </Section>
            </div>
          </div>

          <div className="mt-6">
            <Section title="Travel Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GridItem label="Departure Date" value={formatDate(application.departureDate)} />
                <GridItem label="Transport Mode" value={application.transportMode} />
              </div>
            </Section>
          </div>

          <div className="mt-6">
            <Section title="Request & Flags">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GridItem label="Investor" value={application.investor || '-'} />
                <GridItem label="Requested By" value={application.requestedBy || '-'} />
                <GridItem label="Reason for Deport" value={application.reason_for_deport} />
                <GridItem label="Amount" value={application.securityDeposit || '-'} />
                <GridItem label="FIA Blacklist" value={application.isFiaBlacklist ? "Yes" : "No"} />
              </div>
            </Section>
          </div>

          <div className="mt-6">
            <Section title="Status & Audit">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GridItem label="Status" value={formatStatus(application.status)} />
                <GridItem label="Created At" value={formatDate(application.createdAt)} />
                <GridItem label="Last Updated" value={formatDate(application.updatedAt)} />
                {application.createdBy?.fullName && (
                  <GridItem 
                    label="Created By" 
                    value={`${application.createdBy.fullName}${application.createdBy.state ? ` (${application.createdBy.state})` : ` (${application.createdBy.role})`}`} 
                  />
                )}
                {application.reviewedByUser?.fullName && (
                  <GridItem label="Reviewed By" value={`${application.reviewedByUser.fullName} (${application.reviewedByUser.role})`} />
                )}
              </div>
            </Section>
          </div>

          {/* ETD Information - Only show for approved applications */}
          {application.status === "APPROVED" && (application.etdIssueDate || application.etdExpiryDate || application.blacklistCheckPassed !== undefined) && (
            <div className="mt-6">
              <Section title="Emergency Travel Document (ETD) Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.etdIssueDate && (
                    <GridItem label="ETD Issue Date" value={formatDate(application.etdIssueDate)} />
                  )}
                  {application.etdExpiryDate && (
                    <GridItem label="ETD Expiry Date" value={formatDate(application.etdExpiryDate)} />
                  )}
                  {application.blacklistCheckPassed !== undefined && (
                    <GridItem 
                      label="Blacklist Check Status" 
                      value={application.blacklistCheckPassed ? "Passed" : "Failed (Still Approved)"} 
                    />
                  )}
                  {application.reviewedAt && (
                    <GridItem label="Reviewed At" value={formatDateTime(application.reviewedAt)} />
                  )}
                </div>
              </Section>
            </div>
          )}

          {/* Agency Verification Remarks - Only visible to Ministry and Admin */}
          {(role === "MINISTRY" || role === "ADMIN") && application.status === "VERIFICATION_RECEIVED" && application.agencyRemarks && application.agencyRemarks.length > 0 && (
            <div className="mt-6">
              <Section title="Agency Verification Results">
                <div className="space-y-4">
                  {application.agencyRemarks.map((remark: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GridItem label="Agency" value={remark.agency || 'Unknown'} />
                        <GridItem label="Submitted At" value={remark.submittedAt ? formatDateTime(remark.submittedAt) : 'N/A'} />
                      </div>
                      <div className="mt-3">
                        <GridItem label="Remarks" value={remark.remarks || 'No remarks provided'} />
                      </div>
                      {remark.attachmentUrl && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">PDF Attachment</span>
                            </div>
                            <div className="flex gap-2">
                              <PDFLink 
                                url=""
                                fileName={`verification-${remark.agency}-${remark.submittedAt}.pdf`}
                                className="text-blue-600 hover:text-blue-800"
                                applicationId={params.id as string}
                                agency={remark.agency}
                              >
                              </PDFLink>
                              <span className="text-gray-400">|</span>
                              <button
                                onClick={async () => {
                                  try {
                                    const blob = await applicationAPI.downloadVerificationAttachment(
                                      params.id as string, 
                                      remark.agency
                                    )
                                    const downloadUrl = URL.createObjectURL(blob)
                                    
                                    const link = document.createElement('a')
                                    link.href = downloadUrl
                                    link.download = `verification-${remark.agency}-${remark.submittedAt}.pdf`
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    
                                    // Clean up the blob URL
                                    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
                                  } catch (error) {
                                    console.error('Download failed:', error)
                                    showNotification.error('Failed to download file')
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {application.attachments && application.attachments.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {application.attachments.map((att) => (
                  <li key={att.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{att.fileName}</div>
                      <div className="text-sm text-gray-500">{att.fileType}</div>
                    </div>
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No attachments uploaded</div>
            )}

            {(role === "AGENCY" || role === "ADMIN") && (
              <div>
                <Label htmlFor="file">Upload attachment</Label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    id="file"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadAttachment(file)
                    }}
                    disabled={isActionLoading}
                  />
                  <Button type="button" variant="secondary" disabled>
                    <Upload className="mr-2 h-4 w-4" /> Select File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card> */}

      {/* Verification Document - For Agency Users */}
      {role === "AGENCY" && application.status === "PENDING_VERIFICATION" && application.verificationDocumentUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">PDF Attachment</h4>
                  <p className="text-sm text-blue-700">Verification document from Ministry</p>
                </div>
              </div>
              <Button
                onClick={async () => {
                  try {
                    const blob = await applicationAPI.downloadVerificationDocument(application.id)
                    const url = URL.createObjectURL(blob)
                    
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `verification-document-${application.id.substring(0, 8)}.pdf`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    
                    setTimeout(() => URL.revokeObjectURL(url), 1000)
                  } catch (error) {
                    console.error('Download failed:', error)
                    showNotification.error('Failed to download document')
                  }
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canPerformAction && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {/* Agency Actions for Verification */}
              {role === "AGENCY" && application.status === "PENDING_VERIFICATION" && (
                <Button onClick={() => setShowSubmitVerificationModal(true)} disabled={isActionLoading}>
                  <Upload className="mr-2 h-4 w-4" /> Submit Verification
                </Button>
              )}

              {/* Legacy Agency Actions (for old workflow) */}
              {role === "AGENCY" && ["SUBMITTED", "AGENCY_REVIEW"].includes(application.status) && (
                <>
                  <Button onClick={handleAgencyApprove} disabled={isActionLoading}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve & Send to Ministry
                  </Button>
                  <Button onClick={handleAgencyReject} variant="destructive" disabled={isActionLoading}>
                    <XCircle className="mr-2 h-4 w-4" /> Reject with Remarks
                  </Button>
                </>
              )}

              {/* Ministry Actions for DRAFT Applications */}
              {(role === "MINISTRY" || role === "ADMIN") && application.status === "DRAFT" && (
                <>
                  <Button onClick={() => setShowSendForVerificationModal(true)} disabled={isActionLoading}>
                    <Send className="mr-2 h-4 w-4" /> Send for Verification
                  </Button>
                  <Button onClick={handleDirectReject} variant="destructive" disabled={isActionLoading}>
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </>
              )}
              
              {/* Ministry Actions for VERIFICATION_SUBMITTED Applications */}
              {(role === "MINISTRY" || role === "ADMIN") && application.status === "VERIFICATION_SUBMITTED" && (
                <>
                  <Button onClick={handleMinistryApprove} disabled={isActionLoading}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button onClick={handleMinistryReject} variant="destructive" disabled={isActionLoading}>
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </>
              )}

              {/* Ministry Actions for VERIFICATION_RECEIVED Applications */}
              {(role === "MINISTRY" || role === "ADMIN") && application.status === "VERIFICATION_RECEIVED" && (
                <>
                  <Button 
                    onClick={() => setShowMinistryReviewModal(true)} 
                    disabled={isActionLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Review Application
                  </Button>
                </>
              )}

              {/* Ministry Actions for Other Statuses (Legacy workflow) */}
              {(role === "MINISTRY" || role === "ADMIN") && 
               ["SUBMITTED", "UNDER_REVIEW", "AGENCY_REVIEW", "MINISTRY_REVIEW"].includes(application.status) && (
                <>
                  <Button onClick={handleMinistryApprove} disabled={isActionLoading}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button onClick={handleMinistryReject} variant="destructive" disabled={isActionLoading}>
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                  <Button onClick={handleBlacklist} variant="destructive" disabled={isActionLoading}>
                    <AlertTriangle className="mr-2 h-4 w-4" /> Blacklist
                  </Button>
                  <Button onClick={handleSendToAgency} variant="secondary" disabled={isActionLoading}>
                    <Send className="mr-2 h-4 w-4" /> Send to Agency
                  </Button>
                </>
              )}

              {/* Mission Operator Print Action */}
              {role === "MISSION_OPERATOR" && canPrint && (
                <Button onClick={handlePrintApplication} disabled={isActionLoading}>
                  <Printer className="mr-2 h-4 w-4" /> Print Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    
    {/* Modals */}
    <SendForVerificationModal
      isOpen={showSendForVerificationModal}
      onClose={() => setShowSendForVerificationModal(false)}
      onSubmit={handleSendForVerification}
      isLoading={isActionLoading}
    />
    
    <SubmitVerificationModal
      isOpen={showSubmitVerificationModal}
      onClose={() => setShowSubmitVerificationModal(false)}
      onSubmit={handleSubmitVerification}
      isLoading={isActionLoading}
      applicationId={application?.id}
    />

    <MinistryReviewModal
      isOpen={showMinistryReviewModal}
      onClose={() => setShowMinistryReviewModal(false)}
      onApprove={handleMinistryReviewApprove}
      onReject={handleMinistryReviewReject}
      isLoading={isActionLoading}
    />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 border-b border-gray-200 pb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function GridItem({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`mt-1 ${mono ? "font-mono" : ""}`}>{value || "-"}</div>
    </div>
  )
}


