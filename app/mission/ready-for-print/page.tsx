"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Printer, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable"
import { Application } from "@/lib/types"
import { applicationAPI } from "@/lib/api/applications"
import { showNotification } from "@/lib/utils/notifications"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"

export default function ReadyForPrintPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState({
    total: 0,
    printed: 0,
    pending: 0,
  })

  const fetchApplications = async () => {
    try {
      // Use the new dedicated ready-for-print endpoint
      const response = await applicationAPI.getReadyForPrintApplications({
        region: user?.state,
        submittedBy: user?.id
      })
      setApplications(response.data || [])
      
      // Calculate stats
      const totalApps = response.data?.length || 0
      const printed = response.data?.filter(app => app.isPrinted).length || 0
      const pending = response.data?.filter(app => !app.isPrinted).length || 0

      setStats({
        total: totalApps,
        printed,
        pending
      })
    } catch (error) {
      console.error('Failed to fetch ready-for-print applications:', error);
      // Fallback to old method if new endpoint fails
      try {
        const response = await applicationAPI.getAll({
          status: ['APPROVED', 'COMPLETED'],
          region: user?.state,
          submittedBy: user?.id
        })
        setApplications(response.data || [])
        
        // Calculate stats
        const totalApps = response.data?.length || 0
        const printed = response.data?.filter(app => app.isPrinted).length || 0
        const pending = response.data?.filter(app => !app.isPrinted).length || 0

        setStats({
          total: totalApps,
          printed,
          pending
        })
      } catch (fallbackError) {
        showNotification.error("Failed to fetch ready-for-print applications")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintApplication = (applicationId: string) => {
    // Open print view for ready-for-print applications
    window.open(`/applications/${applicationId}/print`, '_blank')
  }

  const handleMarkAsPrinted = async (applicationId: string) => {
    try {
      await applicationAPI.markAsPrinted(applicationId)
      showNotification.success("Application marked as printed successfully")
      fetchApplications() // Refresh the list
    } catch (error) {
      console.error('Failed to mark as printed:', error)
      showNotification.error("Failed to mark application as printed")
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [user])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/mission')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ready for Print</h1>
              <p className="text-gray-600">
                Approved applications ready for printing - {user?.state} region
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ready</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Print</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Printed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.printed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Ready for Print Applications
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
              onMarkAsPrinted={handleMarkAsPrinted}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
