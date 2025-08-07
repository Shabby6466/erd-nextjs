import apiClient from "./client"
import { Application, ApplicationFilters } from "../stores/application-store"

export interface CreateApplicationData {
  citizen_id: string
  first_name: string
  last_name: string
  father_name: string
  mother_name: string
  date_of_birth: string
  nationality: string
  profession: string
  pakistan_city: string
  pakistan_address: string
  height: string
  color_of_eyes: string
  color_of_hair: string
  departure_date: string
  transport_mode: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const applicationAPI = {
  // Get all applications with filters
  getAll: async (filters?: ApplicationFilters): Promise<PaginatedResponse<Application>> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const response = await apiClient.get(`/applications?${params.toString()}`)
    return response.data
  },

  // Get application by ID
  getById: async (id: string): Promise<Application> => {
    const response = await apiClient.get(`/applications/${id}`)
    return response.data
  },

  // Create new application
  create: async (data: CreateApplicationData): Promise<Application> => {
    const response = await apiClient.post("/applications", data)
    return response.data
  },

  // Update application
  update: async (id: string, data: Partial<CreateApplicationData>): Promise<Application> => {
    const response = await apiClient.put(`/applications/${id}`, data)
    return response.data
  },

  // Delete application
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/${id}`)
  },

  // Approve application
  approve: async (id: string, remarks?: string): Promise<Application> => {
    const response = await apiClient.patch(`/applications/${id}/approve`, { remarks })
    return response.data
  },

  // Reject application
  reject: async (id: string, remarks: string): Promise<Application> => {
    const response = await apiClient.patch(`/applications/${id}/reject`, { remarks })
    return response.data
  },

  // Get dashboard statistics
  getDashboardStats: async (role: string) => {
    const response = await apiClient.get(`/dashboard/${role}/stats`)
    return response.data
  },
}
