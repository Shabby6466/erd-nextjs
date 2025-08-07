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
      // Fetch applications assigned to this agency or requiring agency review
      const response = await applicationAPI.getAll({
        status: ['AGENCY_REVIEW', 'SUBMITTED'],
        assignedAgency: user?.agency
      })
      setApplications(response.data || [])
      
      // Calculate stats
      const totalApps = response.data?.length || 0
      const pending = response.data?.filter(app => 
        ['AGENCY_REVIEW', 'SUBMITTED'].includes(app.status)
      ).length || 0
      const approved = response.data?.filter(app => 
        app.approvalHistory?.some(h => h.action === 'APPROVED' && h.performedBy === user?.id)
      ).length || 0
      const rejected = response.data?.filter(app => 
        app.approvalHistory?.some(h => h.action === 'REJECTED' && h.performedBy === user?.id)
      ).length || 0

      setStats({
        total: totalApps,
        pending,
        approved,
        rejected
      })
    } catch (error) {
      showNotification.error("Failed to fetch applications")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveApplication = async (applicationId: string, remarks?: string) => {
    try {
      await applicationAPI.agencyApprove(applicationId, remarks)
      showNotification.success("Application approved and sent to Ministry")
      fetchApplications()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to approve application")
    }
  }

  const handleRejectApplication = async (applicationId: string, remarks: string) => {
    try {
      await applicationAPI.agencyReject(applicationId, remarks)
      showNotification.success("Application rejected with remarks")
      fetchApplications()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to reject application")
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
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsTable
              applications={applications}
              isLoading={isLoading}
              onRefresh={fetchApplications}
              userRole="AGENCY"
              onApprove={handleApproveApplication}
              onReject={handleRejectApplication}
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