"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, CheckCircle, XCircle, Plus, UserPlus, ClipboardList, MapPin } from "lucide-react"
import { ApplicationsTable } from "@/components/dashboard/ApplicationsTable"
import { UserManagementTable } from "@/components/admin/UserManagementTable"
import { CreateUserModal } from "@/components/admin/CreateUserModal"
import { Application } from "@/lib/types"
import { applicationAPI } from "@/lib/api/applications"
import { showNotification } from "@/lib/utils/notifications"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'applications' | 'users' | 'sheets' | 'locations'>('applications')
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const { logout } = useAuthStore()
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  })

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getAll()
      setApplications(response.data)
    } catch (error) {
      showNotification.error("Failed to fetch applications")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await applicationAPI.getDashboardStats("admin")
      setStats(response)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  useEffect(() => {
    fetchApplications()
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage Emergency Travel Document applications and users</p>
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            User Management
          </button>
                     <button
             onClick={() => setActiveTab('sheets')}
             className={`px-6 py-3 font-medium text-sm ${
               activeTab === 'sheets'
                 ? 'border-b-2 border-blue-500 text-blue-600'
                 : 'text-gray-500 hover:text-gray-700'
             }`}
           >
             Sheet Management
           </button>
           <button
             onClick={() => setActiveTab('locations')}
             className={`px-6 py-3 font-medium text-sm ${
               activeTab === 'locations'
                 ? 'border-b-2 border-blue-500 text-blue-600'
                 : 'text-gray-500 hover:text-gray-700'
             }`}
           >
             Location Management
           </button>
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
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'applications' && (
          <ApplicationsTable
            applications={applications}
            isLoading={isLoading}
            onRefresh={fetchApplications}
          />
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Create User
              </Button>
            </div>
            <UserManagementTable />
          </div>
        )}

                 {activeTab === 'sheets' && (
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-semibold">Sheet Management</h2>
               <Button
                 onClick={() => window.location.href = '/admin/sheets'}
                 className="flex items-center gap-2"
               >
                 <ClipboardList className="h-4 w-4" />
                 Manage Sheets
               </Button>
             </div>
             <div className="text-center py-8">
               <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">Sheet Management</h3>
               <p className="text-gray-500 mb-4">
                 Assign sheet numbers to operators and track their usage.
               </p>
               <Button
                 onClick={() => window.location.href = '/admin/sheets'}
                 className="flex items-center gap-2 mx-auto"
               >
                 <ClipboardList className="h-4 w-4" />
                 Go to Sheet Management
               </Button>
             </div>
           </div>
         )}

         {activeTab === 'locations' && (
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-semibold">Location Management</h2>
               <Button
                 onClick={() => window.location.href = '/admin/locations'}
                 className="flex items-center gap-2"
               >
                 <MapPin className="h-4 w-4" />
                 Manage Locations
               </Button>
             </div>
             <div className="text-center py-8">
               <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">Location Management</h3>
               <p className="text-gray-500 mb-4">
                 Manage foreign mission offices and locations for sheet assignments.
               </p>
               <Button
                 onClick={() => window.location.href = '/admin/locations'}
                 className="flex items-center gap-2 mx-auto"
               >
                 <MapPin className="h-4 w-4" />
                 Go to Location Management
               </Button>
             </div>
           </div>
         )}

        {/* Create User Modal */}
        <CreateUserModal
          open={isCreateUserModalOpen}
          onOpenChange={setIsCreateUserModalOpen}
        />
      </div>
    </div>
  )
}
