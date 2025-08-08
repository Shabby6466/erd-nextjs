"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Printer, Clock, CheckCircle } from "lucide-react"
import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable"
import { Application } from "@/lib/types"
import { applicationAPI } from "@/lib/api/applications"
import { showNotification } from "@/lib/utils/notifications"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"

export default function MissionOperatorDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    pending: 0,
  })

  const fetchApplications = async () => {
    try {
      // Fetch applications for user's region
      const response = await applicationAPI.getAll({
        region: user?.state,
        submittedBy: user?.id
      })
      setApplications(response.data || [])
      
      // Calculate stats
      const totalApps = response.data?.length || 0
      const submitted = response.data?.filter(app => 
        ['SUBMITTED', 'UNDER_REVIEW', 'AGENCY_REVIEW', 'MINISTRY_REVIEW'].includes(app.status)
      ).length || 0
      const approved = response.data?.filter(app => 
        ['APPROVED', 'COMPLETED'].includes(app.status)
      ).length || 0
      const pending = response.data?.filter(app => 
        ['DRAFT'].includes(app.status)
      ).length || 0

      setStats({
        total: totalApps,
        submitted,
        approved,
        pending
      })
    } catch (error) {
      showNotification.error("Failed to fetch applications")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintApplication = (applicationId: string) => {
    // Open print view for completed/approved applications
    window.open(`/applications/${applicationId}/print`, '_blank')
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
            <h1 className="text-3xl font-bold text-gray-900">Mission Operator Dashboard</h1>
            <p className="text-gray-600">
              Manage applications for {user?.state} region
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/applications/new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Application
            </Button>
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
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
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
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              My Applications
              <div className="text-sm text-gray-500 font-normal">
                Region: {user?.state}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsTable
              applications={applications}
              isLoading={isLoading}
              onRefresh={fetchApplications}
              userRole="MISSION_OPERATOR"
              onPrint={handlePrintApplication}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}