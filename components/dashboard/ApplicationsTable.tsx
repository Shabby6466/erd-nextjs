"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  Upload, 
  Printer, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Download
} from "lucide-react"
import { Application, Region, UserRole } from "@/lib/types"
import { formatDate, formatStatus, getStatusVariant } from "@/lib/utils/formatting"
import { showNotification } from "@/lib/utils/notifications"
import { applicationAPI } from "@/lib/api/applications"

interface ApplicationsTableProps {
  applications: Application[]
  isLoading?: boolean
  onRefresh?: () => void
  userRole?: UserRole
  onApprove?: (id: string, remarks?: string) => Promise<void>
  onReject?: (id: string, remarks: string) => Promise<void>
  onBlacklist?: (id: string, remarks: string) => Promise<void>
  onSendToAgency?: (id: string, region: Region) => Promise<void>
  onUploadAttachment?: (id: string) => void
  onPrint?: (id: string) => void
  onSubmitVerification?: (id: string, remarks: string, attachment?: File) => Promise<void>
}

export function ApplicationsTable({ 
  applications, 
  isLoading, 
  onRefresh,
  userRole,
  onApprove,
  onReject,
  onBlacklist,
  onSendToAgency,
  onUploadAttachment,
  onPrint,
  onSubmitVerification
}: ApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const filteredApplications = applications.filter((app) =>
    `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.citizenId.includes(searchTerm) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const canPerformAction = (application: Application) => {
    switch (userRole) {
      case 'MISSION_OPERATOR':
        return application.status === 'DRAFT'
      case 'AGENCY':
        return ['SUBMITTED', 'AGENCY_REVIEW'].includes(application.status)
      case 'MINISTRY':
        return ['SUBMITTED', 'MINISTRY_REVIEW', 'AGENCY_REVIEW'].includes(application.status)
      case 'ADMIN':
        return true
      default:
        return false
    }
  }

  const canPrint = (application: Application) => {
    return userRole === 'MISSION_OPERATOR' && 
           ['READY_FOR_PRINT', 'COMPLETED'].includes(application.status)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading applications...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Applications</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {userRole === 'MISSION_OPERATOR' && (
              <Button onClick={() => router.push("/applications/new")}>
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Application ID</th>
                <th className="text-left p-4 font-medium">Applicant</th>
                <th className="text-left p-4 font-medium">CNIC</th>
                <th className="text-left p-4 font-medium">Status</th>
                {/* <th className="text-left p-3 font-medium">Flags</th> */}
                <th className="text-left p-4 font-medium">Created</th>
                {userRole === 'AGENCY' && (
                  <th className="text-left p-5 font-medium">Verification Document</th>
                )}
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <span className="font-mono text-sm">
                      {application.id.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {application.image && (
                        <div className="flex-shrink-0">
                          <img 
                            src={`data:image/jpeg;base64,${application.image}`}
                            alt="Citizen Photo" 
                            className="w-10 h-12 object-cover rounded border border-gray-300"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {application.firstName && application.lastName 
                            ? `${application.firstName} ${application.lastName}`.trim()
                            : application.firstName || application.lastName || 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-sm">
                      {application.citizenId || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant={getStatusVariant(application.status)}>
                      {formatStatus(application.status)}
                    </Badge>
                  </td>
              
                  <td className="p-3 text-sm text-gray-500">
                    {formatDate(application.createdAt)}
                  </td>
                  {userRole === 'AGENCY' && (
                    <td className="p-3">
                      {application.verificationDocumentUrl ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <button
                            onClick={async () => {
                              try {
                                const blob = await applicationAPI.downloadVerificationDocument(application.id)
                                const url = URL.createObjectURL(blob)
                                window.open(url, '_blank')
                                
                                setTimeout(() => URL.revokeObjectURL(url), 1000)
                              } catch (error) {
                                console.error('View failed:', error)
                                showNotification.error('Failed to view document')
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3" />
                            View PDF
                          </button>
                          <span className="text-gray-400">|</span>
                          <button
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
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No document</span>
                      )}
                    </td>
                  )}
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/applications/${application.id}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                        
                        {/* Mission Operator Actions */}
                        {userRole === 'MISSION_OPERATOR' && canPrint(application) && (
                          <DropdownMenuItem
                            onClick={() => onPrint?.(application.id)}
                          >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Document
                          </DropdownMenuItem>
                        )}

                        {/* Agency Actions - Verification Workflow */}
                        {userRole === 'AGENCY' && application.status === 'PENDING_VERIFICATION' && (
                          <DropdownMenuItem
                            onClick={() => {
                              const remarks = prompt('Enter verification remarks:')
                              if (remarks) onSubmitVerification?.(application.id, remarks)
                            }}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Verification
                          </DropdownMenuItem>
                        )}

                        {/* Legacy Agency Actions (for backward compatibility) */}
                        {userRole === 'AGENCY' && ['SUBMITTED', 'AGENCY_REVIEW'].includes(application.status) && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onUploadAttachment?.(application.id)}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Attachment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onApprove?.(application.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve & Send to Ministry
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const remarks = prompt('Enter rejection remarks:')
                                if (remarks) onReject?.(application.id, remarks)
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject with Remarks
                            </DropdownMenuItem>
                          </>
                        )}

                        {/* Ministry Actions */}
                        {userRole === 'MINISTRY' && canPerformAction(application) && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onApprove?.(application.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve Application
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const remarks = prompt('Enter rejection remarks:')
                                if (remarks) onReject?.(application.id, remarks)
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Application
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const remarks = prompt('Enter blacklist reason:')
                                if (remarks) onBlacklist?.(application.id, remarks)
                              }}
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Blacklist Application
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const region = prompt('Select region (PUNJAB, SINDH, KPK, BALOCHISTAN):') as Region
                                if (region) onSendToAgency?.(application.id, region)
                              }}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send to Agency
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredApplications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No applications found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
