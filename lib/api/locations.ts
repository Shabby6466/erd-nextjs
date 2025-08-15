import { apiClient } from './client'

export interface Location {
  location_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface CreateLocationRequest {
  location_id: string
  name: string
}

export interface UpdateLocationRequest {
  name: string
}

export interface LocationFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'name' | 'location_id' | 'created_at'
  sortOrder?: 'ASC' | 'DESC'
}

export interface PaginatedLocationsResponse {
  data: Location[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export const locationsAPI = {
  // Get paginated locations with filtering
  getLocations: async (filters?: LocationFilters): Promise<PaginatedLocationsResponse> => {
    // Ensure page and limit are always numbers and within valid ranges
    const page = Math.max(1, filters?.page || 1)
    const limit = Math.min(100, Math.max(1, filters?.limit || 10))
    
    // Try sending parameters as query params object instead of query string
    const params: any = {
      page: page,
      limit: limit
    }
    
    if (filters?.search && filters.search.trim()) {
      params.search = filters.search.trim()
    }
    if (filters?.sortBy) {
      params.sortBy = filters.sortBy
    }
    if (filters?.sortOrder) {
      params.sortOrder = filters.sortOrder
    }

    const response = await apiClient.get('/locations', { params })
    return response.data
  },

  // Get all locations (for dropdowns)
  getAllLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get('/locations/all')
    return response.data
  },

  // Search locations
  searchLocations: async (query: string, limit?: number): Promise<Location[]> => {
    const params: any = { q: query }
    if (limit) params.limit = limit
    
    const response = await apiClient.get('/locations/search', { params })
    return response.data
  },

  // Get specific location
  getLocation: async (id: string): Promise<Location> => {
    const response = await apiClient.get(`/locations/${id}`)
    return response.data
  },

  // Create new location (Admin only)
  createLocation: async (data: CreateLocationRequest): Promise<Location> => {
    const response = await apiClient.post('/locations', data)
    return response.data
  },

  // Bulk create locations (Admin only)
  createLocationsBulk: async (data: CreateLocationRequest[]): Promise<Location[]> => {
    const response = await apiClient.post('/locations/bulk', data)
    return response.data
  },

  // Update location (Admin only)
  updateLocation: async (id: string, data: UpdateLocationRequest): Promise<Location> => {
    const response = await apiClient.put(`/locations/${id}`, data)
    return response.data
  },

  // Delete location (Admin only)
  deleteLocation: async (id: string): Promise<void> => {
    await apiClient.delete(`/locations/${id}`)
  },
}
