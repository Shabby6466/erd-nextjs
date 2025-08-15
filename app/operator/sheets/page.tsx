"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { sheetsAPI, Sheet, SheetStats } from "@/lib/api/sheets"
import { showNotification } from "@/lib/utils/notifications"
import { formatDate } from "@/lib/utils/formatting"

export default function OperatorSheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [stats, setStats] = useState<SheetStats | null>(null)
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sheetsData, statsData, availableData] = await Promise.all([
        sheetsAPI.getSheets(), // Operator can only see their own sheets
        sheetsAPI.getSheetStats(), // Operator can only see their own stats
        sheetsAPI.getAvailableSheets()
      ])
      setSheets(sheetsData)
      setStats(statsData)
      setAvailableSheets(availableData)
    } catch (error) {
      showNotification.error("Failed to fetch sheet data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading your sheet data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Sheets</h1>
        <Button onClick={fetchData} variant="outline">
          Refresh
        </Button>
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

      {/* Available Sheets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Available Sheets
            <Badge variant="secondary">{availableSheets.length} available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableSheets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {availableSheets.map((sheetNumber) => (
                <div
                  key={sheetNumber}
                  className="p-3 border border-green-200 bg-green-50 rounded-lg text-center"
                >
                  <span className="font-mono text-sm font-semibold text-green-800">
                    {sheetNumber}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sheets available</h3>
              <p className="text-gray-500">
                You don't have any available sheets. Contact your administrator for more sheets.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Sheets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All My Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Sheet No</th>
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
                No sheets found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
