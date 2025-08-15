import apiClient from "./client"
import { Application } from "../types"

// Transform snake_case API response to camelCase Application
const transformApplicationData = (apiData: any): Application => {
  return {
    id: apiData.application_id,
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
    verificationRemarks: apiData.verification_remarks || '',
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
    agencyRemarks: (apiData.agency_remarks || []).map((remark: any) => {
      const transformedRemark = {
        agency: remark.agency,
        remarks: remark.remarks,
        submittedAt: remark.submitted_at,
        attachmentUrl: remark.attachment_url ? remark.agency : undefined
      }
      console.log('Transforming agency remark:', {
        original: remark,
        transformed: transformedRemark
      })
      return transformedRemark
    }),
    rejectionReason: apiData.rejection_reason,
    verificationSentAt: apiData.verification_sent_at,
    verificationCompletedAt: apiData.verification_completed_at,
    verificationDocumentUrl: apiData.verification_document_url,
    // ETD fields
    etdIssueDate: apiData.etd_issue_date,
    etdExpiryDate: apiData.etd_expiry_date,
    blacklistCheckPassed: apiData.blacklist_check_passed,
    reviewedAt: apiData.reviewed_at,
    // Processing fields
    processing: apiData.processing || null,
  }
}

export interface CreateApplicationData {
  first_name: string
  last_name: string
  image: string
  father_name: string
  mother_name: string
  citizen_id: string
  gender: string
  pakistan_city: string
  date_of_birth: string
  birth_country: string
  birth_city: string
  profession: string
  pakistan_address: string
  height: string
  color_of_hair: string
  color_of_eyes: string
  departure_date: string
  transport_mode: string
  investor: string
  requested_by: string
  reason_for_deport: string
  amount: number
  currency: string
  is_fia_blacklist: boolean
  status: string
  passport_photo_url?: string
  other_documents_url?: string
  passport_api_data?: {
    createdAt: string
    updatedAt: string
    citizen_id: string
    image_url: string
    first_name: string
    last_name: string
    father_name: string
    pakistan_city: string
    gender: string
    date_of_birth: string
    birth_country: string
    birth_city: string
    profession: string
    pakistan_address: string
    response_status: string
    api_response_date: string
    raw_response: any
  }
  nadra_api_data?: {
    createdAt: string
    updatedAt: string
    citizen_id: string
    image_url: string
    first_name: string
    last_name: string
    father_name: string
    mother_name: string
    pakistan_city: string
    date_of_birth: string
    birth_country: string
    birth_city: string
    profession: string
    pakistan_address: string
    response_status: string
    api_response_date: string
    raw_response: any
  }
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
    console.log('API create called with data:', data)
    console.log('API URL:', `${apiClient.defaults.baseURL}/applications`)
    console.log('Request headers:', apiClient.defaults.headers)
    
    try {
      const response = await apiClient.post("/applications", data)
      console.log('API response:', response.data)
      return transformApplicationData(response.data)
    } catch (error) {
      console.error('API create error:', error)
      throw error
    }
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

  // Ministry Review API methods using existing /review endpoint
  ministryReview: async (id: string, data: {
    approved: boolean,
    black_list_check: boolean,
    rejection_reason?: string
    etd_issue_date?: string
    etd_expiry_date?: string
  }): Promise<Application> => {
    console.log('Ministry review with data:', { id, data })
    
    // Create payload with only required fields based on approval status
    const payload: any = {
      approved: data.approved,
      black_list_check: data.black_list_check,
      etd_issue_date: data.etd_issue_date,
      etd_expiry_date: data.etd_expiry_date,
      rejection_reason: data.rejection_reason
    }
    
    // Only include rejection_reason for rejections
    if (!data.approved && data.rejection_reason?.trim()) {
      payload.rejection_reason = data.rejection_reason.trim()
    }
    
    console.log('Sending payload:', payload)
    console.log('API endpoint (PATCH):', `/applications/${id}/review`)
    console.log('Base URL:', apiClient.defaults.baseURL)
    console.log('Full URL will be:', `PATCH ${apiClient.defaults.baseURL}/applications/${id}/review`)
    
    try {
      const response = await apiClient.patch(`/applications/${id}/review`, payload)
      console.log('Ministry review successful:', response.data)
      return transformApplicationData(response.data)
    } catch (error: any) {
      console.error('Ministry review API Error details:', {
        url: `${apiClient.defaults.baseURL}/applications/${id}/review`,
        method: 'PATCH',
        payload,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      throw error
    }
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
    agencies: string[]
    verification_document?: File
    remarks?: string
  }): Promise<Application> => {
    console.log('Sending for verification:', {
      id,
      agencies: data.agencies,
      hasDocument: !!data.verification_document,
      remarks: data.remarks
    })

    // Create FormData for multipart request
    const formData = new FormData()
    
    // Add each agency as a separate field (array format)
    data.agencies.forEach(agency => {
      formData.append('agencies', agency)
    })
    
    // Add verification document (required field)
    if (data.verification_document) {
      formData.append('verification_document', data.verification_document)
    }
    
    // Add remarks if provided (optional field)
    if (data.remarks?.trim()) {
      formData.append('remarks', data.remarks.trim())
    }

    console.log('FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes)`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }

    const response = await apiClient.post(`/applications/${id}/send-for-verification`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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
    
    // Always use FormData (multipart/form-data) format as per new API specification
    const formData = new FormData()
    formData.append('agency', userAgency || 'INTELLIGENCE_BUREAU')
    formData.append('remarks', remarks)
    
    // Add attachment if provided, otherwise it will be omitted from FormData
    if (data.attachment) {
      formData.append('attachment', data.attachment)
      console.log('Submitting verification with file upload')
      console.log('File:', data.attachment.name, 'Size:', data.attachment.size)
    } else {
      console.log('Submitting verification without file attachment')
    }
    
    console.log('Agency:', userAgency)
    console.log('Remarks:', remarks)
    console.log('FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes)`)
      } else {
        console.log(`${key}: ${value}`)
      }
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
    rejection_reason?: string,
    black_list_check?: boolean
  }): Promise<Application> => {
    console.log('Updating application status:', { id, data })
    console.log('API endpoint (PATCH):', `/applications/${id}/status`)
    console.log('Base URL:', apiClient.defaults.baseURL)
    
    try {
      const response = await apiClient.patch(`/applications/${id}/status`, data)
      console.log('Status update successful:', response.data)
      return transformApplicationData(response.data)
    } catch (error: any) {
      console.error('Status update API Error details:', {
        url: `${apiClient.defaults.baseURL}/applications/${id}/status`,
        method: 'PATCH',
        payload: data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      throw error
    }
  },

  printApplication: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/applications/${id}/print`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Print application with sheet number
  printApplicationWithSheet: async (trackingId: string, sheetNo: string): Promise<Application> => {
    console.log('Printing application with sheet number:', { trackingId, sheetNo })
    
    const payload = {
      sheet_no: sheetNo
    }
    
    console.log('Print payload:', payload)
    
    try {
      const response = await apiClient.post(`/applications/${trackingId}/print`, payload)
      console.log('Print successful:', response.data)
      return transformApplicationData(response.data)
    } catch (error: any) {
      console.error('Print API Error details:', {
        url: `${apiClient.defaults.baseURL}/applications/${trackingId}/print`,
        method: 'POST',
        payload,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      throw error
    }
  },

  // QC Pass API
  qcPass: async (applicationId: string): Promise<any> => {
    console.log('QC Pass for application:', applicationId)
    
    try {
      const response = await apiClient.post(`/applications/${applicationId}/qc-pass`, {})
      console.log('QC Pass successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('QC Pass API Error details:', {
        url: `${apiClient.defaults.baseURL}/applications/${applicationId}/qc-pass`,
        method: 'POST',
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      throw error
    }
  },

  // QC Fail API
  qcFail: async (applicationId: string, failureReason?: string): Promise<any> => {
    console.log('QC Fail for application:', { applicationId, failureReason })
    
    const payload = failureReason ? { failure_reason: failureReason } : {}
    
    try {
      const response = await apiClient.post(`/applications/${applicationId}/qc-fail`, payload)
      console.log('QC Fail successful:', response.data)
      return response.data
    } catch (error: any) {
      console.error('QC Fail API Error details:', {
        url: `${apiClient.defaults.baseURL}/applications/${applicationId}/qc-fail`,
        method: 'POST',
        payload,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      throw error
    }
  },

  // Get all verification attachments for an application
  getVerificationAttachments: async (id: string) => {
    const response = await apiClient.get(`/applications/${id}/attachments`)
    return response.data
  },

  // Download verification attachment for a specific agency
  downloadVerificationAttachment: async (id: string, agency: string): Promise<Blob> => {
    const response = await apiClient.get(`/applications/${id}/attachments/${agency}`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Get verification attachment URL for viewing
  getVerificationAttachmentUrl: (id: string, agency: string): string => {
    return `${apiClient.defaults.baseURL}/applications/${id}/attachments/${agency}`
  },

  // Download verification document (the PDF uploaded during send-for-verification)
  downloadVerificationDocument: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/applications/${id}/verification-document`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Get verification document URL for viewing
  getVerificationDocumentUrl: (id: string): string => {
    return `${apiClient.defaults.baseURL}/applications/${id}/verification-document`
  },
}
