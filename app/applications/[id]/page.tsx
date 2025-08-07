"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Region, UserRole } from "@/lib/types"
import { applicationAPI } from "@/lib/api/applications"
import { attachmentAPI } from "@/lib/api/attachments"
import { formatDate, formatStatus, getStatusVariant } from "@/lib/utils/formatting"
import { showNotification } from "@/lib/utils/notifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Printer, Upload, CheckCircle, XCircle, AlertTriangle, Send } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"

type AppAttachment = {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
}

type AppDetails = {
  id: string
  createdAt: string
  updatedAt: string
  first_name: string
  last_name: string
  father_name: string
  mother_name: string
  citizen_id: string
  pakistan_city: string
  date_of_birth: string
  birth_country: string
  birth_city: string
  profession: string
  pakistan_address: string
  height: string | number
  color_of_hair: string
  color_of_eyes: string
  departure_date: string
  transport_mode: string
  investor: boolean
  requested_by: string
  reason_for_deport: string
  amount: string | number
  currency: string
  is_fia_blacklist: boolean
  status: string
  created_by_id?: string
  reviewed_by_id?: string | null
  reviewed_at?: string | null
  createdBy?: {
    id: string
    email: string
    fullName: string
    role: string
    state?: string
  } | null
  reviewedBy?: {
    id: string
    email: string
    fullName: string
    role: string
  } | null
  attachments?: AppAttachment[]
}

export default function ApplicationViewPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()

  const [application, setApplication] = useState<AppDetails | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false)

  const role: UserRole | undefined = user?.role as UserRole | undefined
  console.log(role)
  const canPerformAction = useMemo(() => {
    return true;
    if (!application) return false
    const status = application.status
    switch (role) {
      case "MISSION_OPERATOR":
        return status === "DRAFT"
      case "AGENCY":
        return ["SUBMITTED", "AGENCY_REVIEW"].includes(status)
      case "MINISTRY":
        return ["SUBMITTED", "MINISTRY_REVIEW", "AGENCY_REVIEW"].includes(status)
      case "ADMIN":
        return true
      default:
        return false
    }
  }, [application, role])

  const canPrint = useMemo(() => {
    if (!application) return false
    return role === "MISSION_OPERATOR" && ["APPROVED", "COMPLETED"].includes(application.status)
  }, [application, role])

  const mapApiToDetails = (api: Record<string, unknown>): AppDetails => {
    const getString = (obj: Record<string, unknown>, ...keys: string[]): string => {
      for (const key of keys) {
        const val = obj[key]
        if (typeof val === "string") return val
        if (val !== undefined && val !== null) return String(val)
      }
      return ""
    }

    const getNumberOrString = (obj: Record<string, unknown>, ...keys: string[]): number | string => {
      for (const key of keys) {
        const val = obj[key]
        if (typeof val === "number" || typeof val === "string") return val
      }
      return ""
    }

    const getBool = (obj: Record<string, unknown>, ...keys: string[]): boolean => {
      for (const key of keys) {
        const val = obj[key]
        if (typeof val === "boolean") return val
        if (typeof val === "string") return val.toLowerCase() === "true"
        if (typeof val === "number") return val !== 0
      }
      return false
    }

    const getObj = (obj: Record<string, unknown>, key: string): Record<string, unknown> | null => {
      const val = obj[key]
      return val && typeof val === "object" ? (val as Record<string, unknown>) : null
    }

    const getAttachments = (obj: Record<string, unknown>): AppAttachment[] => {
      const raw = obj["attachments"]
      const arr: unknown[] = Array.isArray(raw) ? raw : []
      return arr
        .map((item) => (typeof item === "object" && item !== null ? (item as Record<string, unknown>) : null))
        .filter((it): it is Record<string, unknown> => !!it)
        .map((it) => ({
          id: getString(it, "id"),
          fileName: getString(it, "fileName", "name"),
          fileUrl: getString(it, "fileUrl", "url"),
          fileType: getString(it, "fileType", "type"),
        }))
    }

    return {
      id: getString(api, "id"),
      createdAt: getString(api, "createdAt"),
      updatedAt: getString(api, "updatedAt"),
      first_name: getString(api, "first_name", "firstName"),
      last_name: getString(api, "last_name", "lastName"),
      father_name: getString(api, "father_name", "fatherName"),
      mother_name: getString(api, "mother_name", "motherName"),
      citizen_id: getString(api, "citizen_id", "citizenId"),
      pakistan_city: getString(api, "pakistan_city", "pakistanCity"),
      date_of_birth: getString(api, "date_of_birth", "dateOfBirth"),
      birth_country: getString(api, "birth_country", "birthCountry"),
      birth_city: getString(api, "birth_city", "birthCity"),
      profession: getString(api, "profession"),
      pakistan_address: getString(api, "pakistan_address", "pakistanAddress"),
      height: getNumberOrString(api, "height"),
      color_of_hair: getString(api, "color_of_hair", "colorOfHair"),
      color_of_eyes: getString(api, "color_of_eyes", "colorOfEyes"),
      departure_date: getString(api, "departure_date", "departureDate"),
      transport_mode: getString(api, "transport_mode", "transportMode"),
      investor: getBool(api, "investor"),
      requested_by: getString(api, "requested_by", "requestedBy"),
      reason_for_deport: getString(api, "reason_for_deport", "reasonForDeport"),
      amount: getNumberOrString(api, "amount"),
      currency: getString(api, "currency"),
      is_fia_blacklist: getBool(api, "is_fia_blacklist", "isFiaBlacklist"),
      status: getString(api, "status"),
      created_by_id: getString(api, "created_by_id", "createdById"),
      reviewed_by_id: getString(api, "reviewed_by_id", "reviewedById") || null,
      reviewed_at: getString(api, "reviewed_at", "reviewedAt") || null,
      createdBy: (() => {
        const cb = getObj(api, "createdBy")
        return cb
          ? {
              id: getString(cb, "id"),
              email: getString(cb, "email"),
              fullName: getString(cb, "fullName"),
              role: getString(cb, "role"),
              state: getString(cb, "state"),
            }
          : null
      })(),
      reviewedBy: (() => {
        const rb = getObj(api, "reviewedBy")
        return rb
          ? {
              id: getString(rb, "id"),
              email: getString(rb, "email"),
              fullName: getString(rb, "fullName"),
              role: getString(rb, "role"),
            }
          : null
      })(),
      attachments: getAttachments(api),
    }
  }

  const refresh = async () => {
    if (!params?.id) return
    setIsLoading(true)
    try {
      const data = await applicationAPI.getById(params.id as string)
      setApplication(mapApiToDetails(data as unknown as Record<string, unknown>))
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

  const handleMinistryApprove = async () => {
    if (!application) return
    setIsActionLoading(true)
    try {
      await applicationAPI.ministryApprove(application.id)
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
    const remarks = window.prompt("Enter rejection remarks:")
    if (!remarks) return
    setIsActionLoading(true)
    try {
      await applicationAPI.ministryReject(application.id, remarks)
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Section title="Personal Information">
                <GridItem label="First Name" value={application.first_name} />
                <GridItem label="Last Name" value={application.last_name} />
                <GridItem label="Father's Name" value={application.father_name} />
                <GridItem label="Mother's Name" value={application.mother_name} />
                <GridItem label="Citizen ID" value={application.citizen_id} mono />
                <GridItem label="Date of Birth" value={formatDate(application.date_of_birth)} />
                <GridItem label="Birth Country" value={application.birth_country} />
                <GridItem label="Birth City" value={application.birth_city} />
                <GridItem label="Profession" value={application.profession} />
              </Section>
            </div>
            <div className="space-y-4">
              <Section title="Physical & Address">
                <GridItem label="Height" value={String(application.height)} />
                <GridItem label="Eye Color" value={application.color_of_eyes} />
                <GridItem label="Hair Color" value={application.color_of_hair} />
                <GridItem label="City" value={application.pakistan_city} />
                <GridItem label="Address" value={application.pakistan_address} />
              </Section>
            </div>
          </div>

          <div className="mt-6">
            <Section title="Travel Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GridItem label="Departure Date" value={formatDate(application.departure_date)} />
                <GridItem label="Transport Mode" value={application.transport_mode} />
              </div>
            </Section>
          </div>

          <div className="mt-6">
            <Section title="Request & Flags">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GridItem label="Investor" value={application.investor ? "Yes" : "No"} />
                <GridItem label="Requested By" value={application.requested_by} />
                <GridItem label="Reason for Deport" value={application.reason_for_deport} />
                <GridItem label="Amount" value={`${application.amount} ${application.currency}`} />
                <GridItem label="FIA Blacklist" value={application.is_fia_blacklist ? "Yes" : "No"} />
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
                  <GridItem label="Created By" value={`${application.createdBy.fullName} (${application.createdBy.role})`} />
                )}
                {application.reviewedBy?.fullName && (
                  <GridItem label="Reviewed By" value={`${application.reviewedBy.fullName} (${application.reviewedBy.role})`} />
                )}
              </div>
            </Section>
          </div>
        </CardContent>
      </Card>

      <Card>
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
      </Card>

      {canPerformAction && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {role === "AGENCY" && (
                <>
                  <Button onClick={handleAgencyApprove} disabled={isActionLoading}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Approve & Send to Ministry
                  </Button>
                  <Button onClick={handleAgencyReject} variant="destructive" disabled={isActionLoading}>
                    <XCircle className="mr-2 h-4 w-4" /> Reject with Remarks
                  </Button>
                </>
              )}

              {(role === "MINISTRY" || role === "ADMIN") && (
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
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


