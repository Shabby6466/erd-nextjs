"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { sheetsAPI } from "@/lib/api/sheets"
import { showNotification } from "@/lib/utils/notifications"

interface SheetSelectorProps {
  onSheetSelect: (sheetNumber: string) => void
  selectedSheet?: string
  disabled?: boolean
  compact?: boolean // New prop for compact mode
}

export default function SheetSelector({ onSheetSelect, selectedSheet, disabled, compact = false }: SheetSelectorProps) {
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableSheets()
  }, [])

  const fetchAvailableSheets = async () => {
    try {
      setLoading(true)
      const sheets = await sheetsAPI.getAvailableSheets()
      setAvailableSheets(sheets)
    } catch (error) {
      showNotification.error("Failed to fetch available sheets")
    } finally {
      setLoading(false)
    }
  }

  // Compact mode for print page
  if (compact) {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sheet Number:</label>
          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
      )
    }

    if (availableSheets.length === 0) {
      return (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sheet Number:</label>
          <div className="px-3 py-2 border border-gray-300 rounded-md bg-red-50">
            <span className="text-sm text-red-600">No sheets available</span>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Sheet Number:</label>
        <Select 
          value={selectedSheet || ""} 
          onValueChange={onSheetSelect}
          disabled={disabled}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select sheet number" />
          </SelectTrigger>
          <SelectContent>
            {availableSheets.map((sheetNumber) => (
              <SelectItem key={sheetNumber} value={sheetNumber}>
                {sheetNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // Full card mode (original behavior)
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading available sheets...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Available Sheets
          <Badge variant="secondary">{availableSheets.length} available</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {availableSheets.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Sheet Number</label>
              <Select 
                value={selectedSheet || ""} 
                onValueChange={onSheetSelect}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a sheet number" />
                </SelectTrigger>
                <SelectContent>
                  {availableSheets.map((sheetNumber) => (
                    <SelectItem key={sheetNumber} value={sheetNumber}>
                      {sheetNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>You have {availableSheets.length} sheet(s) available for use.</p>
              <p>Select a sheet number to assign to the current application.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sheets available</h3>
            <p className="text-gray-500 mb-4">
              You don't have any available sheets assigned to you.
            </p>
            <p className="text-sm text-gray-400">
              Please contact your administrator to get more sheets assigned.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
