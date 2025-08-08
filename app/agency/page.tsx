"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Clock, CheckCircle, XCircle, Send } from "lucide-react"
import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable"
import { AttachmentUploadModal } from "@/components/agency/AttachmentUploadModal"
import { Application } from "@/lib/types"
import { applicationAPI } from "@/lib/api/applications"
import { showNotification } from "@/lib/utils/notifications"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function AgencyDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  const fetchApplications = async () => {
    try {
      // Fetch applications sent for verification by Ministry
      const response = await applicationAPI.getAll({
        status: ['PENDING_VERIFICATION', 'VERIFICATION_SUBMITTED']
      })
      
      // Filter by agency assignment and pending verification agencies
      const filteredApplications = response.data?.filter(app => {
        // Check if this agency should handle this application
        let userAgency = user?.agency
        if (!userAgency) {
          if (user?.state === 'Punjab') {
            userAgency = 'SPECIAL_BRANCH_PUNJAB'
          } else if (user?.state === 'Sindh') {
            userAgency = 'SPECIAL_BRANCH_SINDH'
          } else if (user?.state === 'KPK') {
            userAgency = 'SPECIAL_BRANCH_KPK'
          } else if (user?.state === 'Balochistan') {
            userAgency = 'SPECIAL_BRANCH_BALOCHISTAN'
          } else if (user?.state === 'Federal') {
            userAgency = 'SPECIAL_BRANCH_FEDERAL'
          } else {
            userAgency = 'INTELLIGENCE_BUREAU'
          }
        }
        
        console.log('Agency filtering:', {
          userAgency,
          userState: user?.state,
          appId: app.id,
          appStatus: app.status,
          pendingAgencies: app.pendingVerificationAgencies
        })
        
        // Check if the application is pending verification by this agency
        if (app.pendingVerificationAgencies && app.pendingVerificationAgencies.length > 0) {
          return app.pendingVerificationAgencies.includes(userAgency)
        }
        
        // Fallback to legacy filtering (for old applications)
        if (user?.agency) {
          return app.assignedAgency === user?.agency
        }
        if (user?.state) {
          return app.region === user?.state
        }
        return true
      }) || []
      
      setApplications(filteredApplications)
      
      // Calculate stats
      const totalApps = filteredApplications.length
      const pending = filteredApplications.filter(app => 
        app.status === 'PENDING_VERIFICATION'
      ).length
      const completed = filteredApplications.filter(app => 
        app.status === 'VERIFICATION_SUBMITTED'
      ).length

      setStats({
        total: totalApps,
        pending,
        approved: completed, // Completed verifications
        rejected: 0 // Agencies don't reject, they just submit verification
      })
    } catch (error) {
      showNotification.error("Failed to fetch applications")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitVerification = async (applicationId: string, remarks: string, attachment?: File) => {
    try {
      await applicationAPI.submitVerification(applicationId, { remarks, attachment })
      showNotification.success("Verification submitted successfully")
      fetchApplications()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to submit verification")
    }
  }

  const handleUploadAttachment = (applicationId: string) => {
    setSelectedApplicationId(applicationId)
    setIsUploadModalOpen(true)
  }

  useEffect(() => {
    fetchApplications()
  }, [user])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agency Dashboard</h1>
            <p className="text-gray-600">
              Review and process applications - {user?.agency}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={async () => {
                await logout()
                window.location.href = '/login'
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Upload className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications for Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsTable
              applications={applications}
              isLoading={isLoading}
              onRefresh={fetchApplications}
              userRole="AGENCY"
              onSubmitVerification={handleSubmitVerification}
              onUploadAttachment={handleUploadAttachment}
            />
          </CardContent>
        </Card>

        {/* Attachment Upload Modal */}
        <AttachmentUploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          applicationId={selectedApplicationId}
          onUploadSuccess={() => {
            fetchApplications()
            setIsUploadModalOpen(false)
          }}
        />
      </div>
    </div>
  )
}