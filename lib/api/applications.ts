import apiClient from "./client"
import { Application } from "../types"

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
  birth_country: string
  birth_city: string
  height: number
  color_of_eyes: string
  color_of_hair: string
  departure_date: string
  transport_mode: string
  investor: boolean
  requested_by: string
  reason_for_deport: string
  amount: number
  currency: string
  is_fia_blacklist: boolean
  status: string
}


export const applicationAPI = {
  // Get all applications with filters
  getAll: async (): Promise<{ data: Application[] }> => {
    const response = await apiClient.get(`/applications`)
    return { data: response.data || [] }
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

  // Ministry specific actions
  ministryApprove: async (id: string, remarks?: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/ministry-approve`, { remarks })
    return response.data
  },

  ministryReject: async (id: string, remarks: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/ministry-reject`, { remarks })
    return response.data
  },

  blacklist: async (id: string, remarks: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/blacklist`, { remarks })
    return response.data
  },

  sendToAgency: async (id: string, region: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/send-to-agency`, { region })
    return response.data
  },

  // Agency specific actions
  agencyApprove: async (id: string, remarks?: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/agency-approve`, { remarks })
    return response.data
  },

  agencyReject: async (id: string, remarks: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/agency-reject`, { remarks })
    return response.data
  },
}
