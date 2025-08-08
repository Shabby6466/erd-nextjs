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
    image: apiData.image,
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
    // New verification fields
    pendingVerificationAgencies: apiData.pending_verification_agencies || [],
    verificationCompletedAgencies: apiData.verification_completed_agencies || [],
    agencyRemarks: apiData.agency_remarks || [],
    rejectionReason: apiData.rejection_reason,
    verificationSentAt: apiData.verification_sent_at,
    verificationCompletedAt: apiData.verification_completed_at,
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
    region?: string,
    remarks?: string
  }): Promise<Application> => {
    // Transform frontend data to backend API format
    const agencies: string[] = []
    
    if (data.verification_type === 'INTELLIGENCE_BUREAU') {
      agencies.push('INTELLIGENCE_BUREAU')
    } else if (data.verification_type === 'SPECIAL_BRANCH') {
      if (data.region === 'PUNJAB') {
        agencies.push('SPECIAL_BRANCH_PUNJAB')
      } else if (data.region === 'SINDH') {
        agencies.push('SPECIAL_BRANCH_SINDH')
      } else {
        // Default to Punjab if no specific region mapping
        agencies.push('SPECIAL_BRANCH_PUNJAB')
      }
    } else if (data.verification_type === 'BOTH') {
      agencies.push('INTELLIGENCE_BUREAU')
      if (data.region === 'PUNJAB') {
        agencies.push('SPECIAL_BRANCH_PUNJAB')
      } else if (data.region === 'SINDH') {
        agencies.push('SPECIAL_BRANCH_SINDH')
      } else {
        // Default to Punjab if no specific region mapping
        agencies.push('SPECIAL_BRANCH_PUNJAB')
      }
    }

    const payload: any = { agencies }
    if (data.region) {
      payload.region = data.region
    }
    if (data.remarks) {
      payload.remarks = data.remarks
    }

    console.log('Sending verification payload:', payload)
    const response = await apiClient.post(`/applications/${id}/send-for-verification`, payload)
    return transformApplicationData(response.data)
  },

  submitVerification: async (id: string, data: {
    remarks: string,
    attachment?: File
  }): Promise<Application> => {
    // Get current user from auth store to determine agency
    let authStore, user, userAgency
    
    try {
      authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}')
      user = authStore?.state?.user
      console.log('Auth store:', authStore)
      console.log('User from store:', user)
      
      // Determine agency from current user
      userAgency = user?.agency
      if (!userAgency) {
        // For testing: if user is MINISTRY or AGENCY, determine agency from state
        if (user?.role === 'MINISTRY' || user?.role === 'AGENCY') {
          if (user?.state === 'Punjab') {
            userAgency = 'SPECIAL_BRANCH_PUNJAB'
          } else if (user?.state === 'Sindh') {
            userAgency = 'SPECIAL_BRANCH_SINDH'
          } else if (user?.state === 'KPK') {
            userAgency = 'SPECIAL_BRANCH_KPK'
          } else if (user?.state === 'Balochistan') {
            userAgency = 'SPECIAL_BRANCH_BALOCHISTAN'
          } else if (user?.state === 'Federal') {
            userAgency = 'SPECIAL_BRANCH_FEDERAL'
          } else {
            userAgency = 'INTELLIGENCE_BUREAU'
          }
        } else {
          userAgency = 'INTELLIGENCE_BUREAU'
        }
      }
      
      console.log('Determined agency:', userAgency)
      
      // Fallback if still no agency
      if (!userAgency) {
        userAgency = 'INTELLIGENCE_BUREAU'
        console.warn('No agency determined, using fallback:', userAgency)
      }
    } catch (error) {
      console.error('Error reading auth store:', error)
      userAgency = 'INTELLIGENCE_BUREAU'
    }
    
    // Validate required fields
    const remarks = data.remarks?.trim() || ''
    if (!remarks) {
      throw new Error('Remarks are required')
    }
    
    // Handle file upload vs JSON payload
    let response
    
    if (data.attachment) {
      // Use FormData for file upload
      const formData = new FormData()
      formData.append('agency', userAgency || 'INTELLIGENCE_BUREAU')
      formData.append('remarks', remarks)
      formData.append('attachment', data.attachment)
      formData.append('attachment_url', '') // Empty when uploading file
      
      console.log('Submitting verification with file upload')
      console.log('Agency:', userAgency)
      console.log('Remarks:', remarks)
      console.log('File:', data.attachment.name)
      
      response = await apiClient.post(`/applications/${id}/submit-verification`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      // Use JSON payload when no file
      const payload = {
        agency: userAgency || 'INTELLIGENCE_BUREAU',
        remarks: remarks,
        attachment_url: 'no-attachment'
      }
      
      console.log('Submitting verification without file:', payload)
      response = await apiClient.post(`/applications/${id}/submit-verification`, payload)
    }
    return transformApplicationData(response.data)
  },

  updateStatus: async (id: string, data: {
    status: string,
    rejection_reason?: string
  }): Promise<Application> => {
    console.log('Updating application status:', { id, data })
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
