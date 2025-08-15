"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { locationsAPI, Location, LocationFilters, CreateLocationRequest } from "@/lib/api/locations"
import { showNotification } from "@/lib/utils/notifications"
import { formatDate } from "@/lib/utils/formatting"
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

export default function LocationManagementPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  // Filters
  const [filters, setFilters] = useState<LocationFilters>({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "name",
    sortOrder: "ASC"
  })

  // Form state
  const [newLocation, setNewLocation] = useState<CreateLocationRequest>({
    location_id: "",
    name: ""
  })

  useEffect(() => {
    fetchLocations()
  }, [filters])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await locationsAPI.getLocations(filters)
      setLocations(response.data)
      setCurrentPage(response.page)
      setTotalPages(response.totalPages)
      setTotalItems(response.total)
      setHasNext(response.hasNext)
      setHasPrev(response.hasPrev)
    } catch (error) {
      showNotification.error("Failed to fetch locations")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLocation = async () => {
    if (!newLocation.location_id.trim() || !newLocation.name.trim()) {
      showNotification.error("Please fill in all required fields")
      return
    }

    setCreating(true)
    try {
      await locationsAPI.createLocation(newLocation)
      showNotification.success("Location created successfully")
      setNewLocation({ location_id: "", name: "" })
      fetchLocations()
    } catch (error) {
      showNotification.error("Failed to create location")
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateLocation = async (id: string, name: string) => {
    if (!name.trim()) {
      showNotification.error("Location name cannot be empty")
      return
    }

    try {
      await locationsAPI.updateLocation(id, { name })
      showNotification.success("Location updated successfully")
      setEditing(null)
      fetchLocations()
    } catch (error) {
      showNotification.error("Failed to update location")
    }
  }

  const handleDeleteLocation = async (id: string) => {
    try {
      await locationsAPI.deleteLocation(id)
      showNotification.success("Location deleted successfully")
      setDeleting(null)
      fetchLocations()
    } catch (error) {
      showNotification.error("Failed to delete location")
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
  }

  const handleSort = (sortBy: string, sortOrder: 'ASC' | 'DESC') => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Location Management</h1>
        <Badge variant="secondary">Total: {totalItems} locations</Badge>
      </div>

      {/* Create New Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationId">Location ID</Label>
              <Input
                id="locationId"
                value={newLocation.location_id}
                onChange={(e) => setNewLocation(prev => ({ ...prev, location_id: e.target.value }))}
                placeholder="e.g., 9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name</Label>
              <Input
                id="locationName"
                value={newLocation.name}
                onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., New York, USA"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCreateLocation} 
                disabled={creating}
                className="w-full"
              >
                {creating ? "Creating..." : "Create Location"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search locations..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select 
                value={filters.sortBy || "name"} 
                onValueChange={(value) => handleSort(value, filters.sortOrder || 'ASC')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="location_id">Location ID</SelectItem>
                  <SelectItem value="created_at">Created Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Select 
                value={filters.sortOrder || "ASC"} 
                onValueChange={(value) => handleSort(filters.sortBy || 'name', value as 'ASC' | 'DESC')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">Ascending</SelectItem>
                  <SelectItem value="DESC">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">Items per Page</Label>
              <Select 
                value={filters.limit?.toString() || "10"} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value), page: 1 }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Location ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Updated At</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.location_id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-mono">
                      {location.location_id}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editing === location.location_id ? (
                        <Input
                          value={location.name}
                          onChange={(e) => {
                            const updatedLocations = locations.map(loc => 
                              loc.location_id === location.location_id 
                                ? { ...loc, name: e.target.value }
                                : loc
                            )
                            setLocations(updatedLocations)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateLocation(location.location_id, location.name)
                            } else if (e.key === 'Escape') {
                              setEditing(null)
                              fetchLocations()
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        location.name
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {formatDate(location.created_at)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {formatDate(location.updated_at)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        {editing === location.location_id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateLocation(location.location_id, location.name)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditing(null)
                                fetchLocations()
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditing(location.location_id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleting(location.location_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {locations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No locations found matching the current filters
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * (filters.limit || 10)) + 1} to {Math.min(currentPage * (filters.limit || 10), totalItems)} of {totalItems} locations
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Confirm Delete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Are you sure you want to delete this location? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleting(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteLocation(deleting)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
