import { useState, useEffect } from "react"
import { sheetsAPI, Sheet, SheetStats, SheetFilters } from "@/lib/api/sheets"
import { showNotification } from "@/lib/utils/notifications"

export function useSheets(filters?: SheetFilters) {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [stats, setStats] = useState<SheetStats | null>(null)
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSheets = async () => {
    try {
      setLoading(true)
      const [sheetsData, statsData, availableData] = await Promise.all([
        sheetsAPI.getSheets(filters),
        sheetsAPI.getSheetStats(),
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

  const assignSheets = async (operatorId: number, locationId: number, sheetNumbers: string[]) => {
    try {
      const response = await sheetsAPI.assignSheets({
        operator_id: operatorId,
        location_id: locationId,
        sheet_numbers: sheetNumbers
      })
      showNotification.success("Sheets assigned successfully")
      await fetchSheets() // Refresh data
      return response
    } catch (error) {
      showNotification.error("Failed to assign sheets")
      throw error
    }
  }

  const uploadSheets = async (file: File, operatorId: number, locationId: number) => {
    try {
      const response = await sheetsAPI.uploadSheets(file, operatorId, locationId)
      showNotification.success("Sheets uploaded successfully")
      await fetchSheets() // Refresh data
      return response
    } catch (error) {
      showNotification.error("Failed to upload sheets")
      throw error
    }
  }

  useEffect(() => {
    fetchSheets()
  }, [filters])

  return {
    sheets,
    stats,
    availableSheets,
    loading,
    fetchSheets,
    assignSheets,
    uploadSheets
  }
}
