import apiClient from "./client"
import { Application } from "../types"

// Transform snake_case API response to camelCase Application
const transformApplicationData = (apiData: any): Application => {
  return {
    id: apiData.id,
    status: apiData.status,
    citizenId: apiData.citizen_id,
    firstName: apiData.first_name,
    lastName: apiData.last_name,
    fatherName: apiData.father_name,
    motherName: apiData.mother_name,
    gender: apiData.gender,
    dateOfBirth: apiData.date_of_birth,
    birthCountry: apiData.birth_country,
    birthCity: apiData.birth_city,
    profession: apiData.profession,
    pakistanCity: apiData.pakistan_city,
    pakistanAddress: apiData.pakistan_address,
    height: apiData.height,
    colorOfEyes: apiData.color_of_eyes,
    colorOfHair: apiData.color_of_hair,
    departureDate: apiData.departure_date,
    securityDeposit: apiData.amount ? `${apiData.amount} ${apiData.currency}` : '',
    investor: apiData.investor,
    requestedBy: apiData.requested_by,
    reason_for_deport: apiData.reason_for_deport,
    transportMode: apiData.transport_mode,
    isFiaBlacklist: apiData.is_fia_blacklist,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
    submittedBy: apiData.created_by_id,
    reviewedBy: apiData.reviewed_by_id,
    remarks: apiData.remarks,
    region: apiData.region,
    assignedAgency: apiData.assignedAgency,
    attachments: apiData.attachments || [],
    approvalHistory: apiData.approvalHistory || [],
    createdBy: apiData.createdBy ? {
      id: apiData.createdBy.id,
      email: apiData.createdBy.email,
      fullName: apiData.createdBy.fullName,
      role: apiData.createdBy.role,
      state: apiData.createdBy.state,
    } : undefined,
    reviewedByUser: apiData.reviewedBy ? {
      id: apiData.reviewedBy.id,
      email: apiData.reviewedBy.email,
      fullName: apiData.reviewedBy.fullName,
      role: apiData.reviewedBy.role,
    } : undefined,
  }
}

export interface CreateApplicationData {
  citizen_id: string
  first_name: string
  last_name: string
  father_name: string
  mother_name: string
  gender: string
  date_of_birth: string
  // nationality: string
  profession: string
  pakistan_city: string
  pakistan_address: string
  birth_country: string
  birth_city: string
  height: string
  color_of_eyes: string
  color_of_hair: string
  departure_date: string
  transport_mode: string
  investor: string
  requested_by: string
  reason_for_deport: string
  amount: number
  currency: string
  is_fia_blacklist: boolean
  status: string
  securityDeposit: string
}


export const applicationAPI = {
  // Get all applications with filters
  getAll: async (filters?: any): Promise<{ data: Application[] }> => {
    const response = await apiClient.get(`/applications`, { params: filters })
    const rawData = response.data || []
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(transformApplicationData)
      : []
    return { data: transformedData }
  },

  // Get application by ID
  getById: async (id: string): Promise<Application> => {
    const response = await apiClient.get(`/applications/${id}`)
    return transformApplicationData(response.data)
  },

  // Create new application
  create: async (data: CreateApplicationData): Promise<Application> => {
    const response = await apiClient.post("/applications", data)
    return transformApplicationData(response.data)
  },

  // Update application
  update: async (id: string, data: Partial<CreateApplicationData>): Promise<Application> => {
    const response = await apiClient.put(`/applications/${id}`, data)
    return transformApplicationData(response.data)
  },

  // Delete application
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/${id}`)
  },

  // Approve application
  approve: async (id: string, remarks?: string): Promise<Application> => {
    const response = await apiClient.patch(`/applications/${id}/approve`, { remarks })
    return transformApplicationData(response.data)
  },

  // Reject application
  reject: async (id: string, remarks: string): Promise<Application> => {
    const response = await apiClient.patch(`/applications/${id}/reject`, { remarks })
    return transformApplicationData(response.data)
  },

  // Get dashboard statistics
  getDashboardStats: async (role: string) => {
    const response = await apiClient.get(`/dashboard/${role}/stats`)
    return response.data
  },

  // Ministry specific actions
  ministryApprove: async (id: string, remarks?: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/ministry-approve`, { remarks })
    return transformApplicationData(response.data)
  },

  ministryReject: async (id: string, remarks: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/ministry-reject`, { remarks })
    return transformApplicationData(response.data)
  },

  blacklist: async (id: string, remarks: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/blacklist`, { remarks })
    return transformApplicationData(response.data)
  },

  sendToAgency: async (id: string, region: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/send-to-agency`, { region })
    return transformApplicationData(response.data)
  },

  // Agency specific actions
  agencyApprove: async (id: string, remarks?: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/agency-approve`, { remarks })
    return transformApplicationData(response.data)
  },

  agencyReject: async (id: string, remarks: string): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/agency-reject`, { remarks })
    return transformApplicationData(response.data)
  },

  // New workflow endpoints
  sendForVerification: async (id: string, data: { 
    verification_type: 'INTELLIGENCE_BUREAU' | 'SPECIAL_BRANCH' | 'BOTH',
    region?: string 
  }): Promise<Application> => {
    const response = await apiClient.post(`/applications/${id}/send-for-verification`, data)
    return transformApplicationData(response.data)
  },

  submitVerification: async (id: string, data: {
    remarks: string,
    attachment?: File
  }): Promise<Application> => {
    const formData = new FormData()
    formData.append('remarks', data.remarks)
    if (data.attachment) {
      formData.append('attachment', data.attachment)
    }
    
    const response = await apiClient.post(`/applications/${id}/submit-verification`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return transformApplicationData(response.data)
  },

  updateStatus: async (id: string, data: {
    status: string,
    remarks?: string
  }): Promise<Application> => {
    const response = await apiClient.patch(`/applications/${id}/status`, data)
    return transformApplicationData(response.data)
  },

  printApplication: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/applications/${id}/print`, {
      responseType: 'blob',
    })
    return response.data
  },
}
