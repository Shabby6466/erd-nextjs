"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Send, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable"
import { Application, Region } from "@/lib/types"
import { applicationAPI } from "@/lib/api/applications"
import { showNotification } from "@/lib/utils/notifications"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function MinistryDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { logout } = useAuthStore()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    blacklisted: 0,
  })

  const fetchApplications = async () => {
    try {
      // Fetch applications that are submitted by mission operators and ready for ministry review
      const response = await applicationAPI.getAll({
        status: ['SUBMITTED', 'MINISTRY_REVIEW', 'AGENCY_REVIEW']
      })
      setApplications(response.data || [])
      
      // Calculate stats
      const totalApps = response.data?.length || 0
      const pending = response.data?.filter(app => 
        ['SUBMITTED', 'MINISTRY_REVIEW'].includes(app.status)
      ).length || 0
      const approved = response.data?.filter(app => 
        ['APPROVED', 'COMPLETED'].includes(app.status)
      ).length || 0
      const rejected = response.data?.filter(app => 
        app.status === 'REJECTED'
      ).length || 0
      const blacklisted = response.data?.filter(app => 
        app.status === 'BLACKLISTED'
      ).length || 0

      setStats({
        total: totalApps,
        pending,
        approved,
        rejected,
        blacklisted
      })
    } catch (error) {
      showNotification.error("Failed to fetch applications")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveApplication = async (applicationId: string, remarks?: string) => {
    try {
      await applicationAPI.ministryApprove(applicationId, remarks)
      showNotification.success("Application approved successfully")
      fetchApplications()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to approve application")
    }
  }

  const handleRejectApplication = async (applicationId: string, remarks: string) => {
    try {
      await applicationAPI.ministryReject(applicationId, remarks)
      showNotification.success("Application rejected")
      fetchApplications()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to reject application")
    }
  }

  const handleBlacklistApplication = async (applicationId: string, remarks: string) => {
    try {
      await applicationAPI.blacklist(applicationId, remarks)
      showNotification.success("Application blacklisted")
      fetchApplications()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to blacklist application")
    }
  }

  const handleSendToAgency = async (applicationId: string, region: Region) => {
    try {
      await applicationAPI.sendToAgency(applicationId, region)
      showNotification.success(`Application sent to ${region} agency for verification`)
      fetchApplications()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to send application to agency")
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ministry Dashboard</h1>
            <p className="text-gray-600">
              Final review and approval of emergency travel documents
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blacklisted</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.blacklisted}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications for Ministry Review</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsTable
              applications={applications}
              isLoading={isLoading}
              onRefresh={fetchApplications}
              userRole="MINISTRY"
              onApprove={handleApproveApplication}
              onReject={handleRejectApplication}
              onBlacklist={handleBlacklistApplication}
              onSendToAgency={handleSendToAgency}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}