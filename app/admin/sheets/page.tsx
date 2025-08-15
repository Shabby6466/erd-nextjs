"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { sheetsAPI, Sheet, SheetStats, SheetFilters } from "@/lib/api/sheets"
import { userAPI } from "@/lib/api/users"
import { locationsAPI } from "@/lib/api/locations"
import { showNotification } from "@/lib/utils/notifications"
import { formatDate } from "@/lib/utils/formatting"
import LocationSelector from "@/components/ui/location-selector"

interface User {
  id: string
  fullName: string
  email: string
  role: string
}

export default function SheetManagementPage() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [stats, setStats] = useState<SheetStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Assignment form state
  const [selectedOperator, setSelectedOperator] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sheetNumbers, setSheetNumbers] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Filters
  const [filters, setFilters] = useState<SheetFilters>({})

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sheetsData, statsData, usersData] = await Promise.all([
        sheetsAPI.getSheets(filters),
        sheetsAPI.getSheetStats(),
        userAPI.getAll()
      ])
      setSheets(sheetsData)
      setStats(statsData)
      setUsers(usersData.filter((user: any) => user.role === 'MISSION_OPERATOR'))
    } catch (error) {
      showNotification.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleAssignSheets = async () => {
    if (!selectedOperator || !selectedLocation || !sheetNumbers.trim()) {
      showNotification.error("Please fill in all required fields")
      return
    }

    const sheetNumbersArray = sheetNumbers
      .split(/[,\n]/)
      .map(num => num.trim())
      .filter(num => num.length > 0)

    if (sheetNumbersArray.length === 0) {
      showNotification.error("Please enter at least one sheet number")
      return
    }

    setAssigning(true)
    try {
      await sheetsAPI.assignSheets({
        operator_id: parseInt(selectedOperator),
        location_id: parseInt(selectedLocation),
        sheet_numbers: sheetNumbersArray
      })
      showNotification.success("Sheets assigned successfully")
      setSheetNumbers("")
      setSelectedOperator("")
      setSelectedLocation("")
      fetchData()
    } catch (error) {
      showNotification.error("Failed to assign sheets")
    } finally {
      setAssigning(false)
    }
  }

  const handleUploadSheets = async () => {
    if (!selectedFile || !selectedOperator || !selectedLocation) {
      showNotification.error("Please select a file and fill in all required fields")
      return
    }

    setUploading(true)
    try {
      await sheetsAPI.uploadSheets(
        selectedFile,
        parseInt(selectedOperator),
        parseInt(selectedLocation)
      )
      showNotification.success("Sheets uploaded successfully")
      setSelectedFile(null)
      setSelectedOperator("")
      setSelectedLocation("")
      fetchData()
    } catch (error) {
      showNotification.error("Failed to upload sheets")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/plain") {
      setSelectedFile(file)
    } else {
      showNotification.error("Please select a valid text file")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading sheet management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sheet Management</h1>
      </div>

             {/* Statistics Cards */}
       {stats && (
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium">Total Sheets</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.total_sheets}</div>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-medium">Available Sheets</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold text-green-600">{stats.available_sheets}</div>
             </CardContent>
           </Card>
           
           {stats.qc_pass_sheets !== undefined && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium">QC Pass</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-green-600">{stats.qc_pass_sheets}</div>
               </CardContent>
             </Card>
           )}
           {stats.qc_fail_sheets !== undefined && (
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium">QC Fail</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-red-600">{stats.qc_fail_sheets}</div>
               </CardContent>
             </Card>
           )}
         </div>
       )}

             {/* Assignment Section */}
       <div className="grid grid-cols-1 gap-6">
         {/* Manual Assignment */}
         <Card>
           <CardHeader>
             <CardTitle>Assign Sheets Manually</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="operator">Operator</Label>
                 <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select operator" />
                   </SelectTrigger>
                   <SelectContent>
                     {users.map((user) => (
                       <SelectItem key={user.id} value={user.id}>
                         {user.fullName} ({user.email})
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="location">Location</Label>
                 <LocationSelector
                   value={selectedLocation}
                   onValueChange={setSelectedLocation}
                   placeholder="Select location"
                   disabled={assigning}
                 />
               </div>
             </div>

             <div className="space-y-2">
               <Label htmlFor="sheetNumbers">Sheet Numbers</Label>
               <textarea
                 id="sheetNumbers"
                 value={sheetNumbers}
                 onChange={(e) => setSheetNumbers(e.target.value)}
                 placeholder="Enter sheet numbers (comma or newline separated)"
                 className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 rows={4}
               />
             </div>

             <Button 
               onClick={handleAssignSheets} 
               disabled={assigning}
               className="w-full"
             >
               {assigning ? "Assigning..." : "Assign Sheets"}
             </Button>
           </CardContent>
         </Card>
       </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterOperator">Operator</Label>
              <Select 
                value={filters.operator_id?.toString() || ""} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, operator_id: value ? parseInt(value) : undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator (or leave empty for all)" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterLocation">Location</Label>
              <LocationSelector
                value={filters.location_id?.toString() || ""}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  location_id: value ? parseInt(value) : undefined 
                }))}
                placeholder="All locations"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterStatus">Status</Label>
              <Select 
                value={filters.status || ""} 
                                 onValueChange={(value) => setFilters(prev => ({ 
                   ...prev, 
                   status: value as 'EMPTY' | 'QC_PASS' | 'QC_FAIL' | undefined 
                 }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status (or leave empty for all)" />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="EMPTY">Empty</SelectItem>
                   <SelectItem value="QC_PASS">QC Pass</SelectItem>
                   <SelectItem value="QC_FAIL">QC Fail</SelectItem>
                 </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sheets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Sheet No</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Operator</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Issued At</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Used At</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Application</th>
                </tr>
              </thead>
              <tbody>
                {sheets.map((sheet) => (
                  <tr key={sheet.sheet_no} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-mono">
                      {sheet.sheet_no}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {sheet.operator_name}
                    </td>
                                         <td className="border border-gray-300 px-4 py-2">
                                               <Badge 
                          variant={
                            sheet.status === 'QC_PASS' ? 'default' :
                            sheet.status === 'QC_FAIL' ? 'destructive' : 
                            'secondary'
                          }
                          className={
                            sheet.status === 'QC_PASS' ? 'bg-green-600 hover:bg-green-700' : ''
                          }
                        >
                         {sheet.status}
                       </Badge>
                     </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {formatDate(sheet.issued_at)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {sheet.used_at ? formatDate(sheet.used_at) : '-'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {sheet.used_by_application || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sheets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sheets found matching the current filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
