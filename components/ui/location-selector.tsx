"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { locationsAPI, Location } from "@/lib/api/locations"
import { showNotification } from "@/lib/utils/notifications"

interface LocationSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function LocationSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select location", 
  disabled = false,
  className 
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const allLocations = await locationsAPI.getAllLocations()
      // Sort locations by name for better UX
      const sortedLocations = allLocations.sort((a, b) => a.name.localeCompare(b.name))
      setLocations(sortedLocations)
    } catch (error) {
      showNotification.error("Failed to fetch locations")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading locations..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="loading">Loading...</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Select 
      value={value || ""} 
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem key={location.location_id} value={location.location_id}>
            {location.name} ({location.location_id})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
