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
import { MoreHorizontal, Search, Plus } from "lucide-react"
import { Application } from "@/lib/stores/application-store"
import { formatDate, formatStatus, getStatusVariant } from "@/lib/utils/formatting"
import { showNotification } from "@/lib/utils/notifications"
import { applicationAPI } from "@/lib/api/applications"

interface ApplicationsTableProps {
  applications: Application[]
  isLoading?: boolean
  onRefresh?: () => void
}

export function ApplicationsTable({ applications, isLoading, onRefresh }: ApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const filteredApplications = applications.filter((app) =>
    `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.citizen_id.includes(searchTerm) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleApprove = async (id: string) => {
    try {
      await applicationAPI.approve(id)
      showNotification.success("Application approved successfully")
      onRefresh?.()
    } catch (error) {
      showNotification.error("Failed to approve application")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await applicationAPI.reject(id, "Application rejected")
      showNotification.success("Application rejected successfully")
      onRefresh?.()
    } catch (error) {
      showNotification.error("Failed to reject application")
    }
  }

  const canApprove = (status: string) => {
    return ["SUBMITTED", "UNDER_REVIEW"].includes(status)
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
            <Button onClick={() => router.push("/applications/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Application ID</th>
                <th className="text-left p-3 font-medium">Applicant</th>
                <th className="text-left p-3 font-medium">CNIC</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Created</th>
                <th className="text-left p-3 font-medium">Actions</th>
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
                    <div>
                      <div className="font-medium">
                        {application.first_name} {application.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.profession}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-sm">{application.citizen_id}</span>
                  </td>
                  <td className="p-3">
                    <Badge variant={getStatusVariant(application.status)}>
                      {formatStatus(application.status)}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {formatDate(application.createdAt)}
                  </td>
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
                        {canApprove(application.status) && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleApprove(application.id)}
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReject(application.id)}
                            >
                              Reject
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
