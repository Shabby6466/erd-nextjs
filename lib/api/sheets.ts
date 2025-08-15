import { apiClient } from './client'

export interface SheetAssignmentRequest {
  operator_id: number
  location_id: number
  sheet_numbers: string[]
}

export interface SheetAssignmentResponse {
  message: string
  assigned_count: number
}

export interface Sheet {
  sheet_no: string
  issued_to: number
  issued_by: number
  location_id: number
  status: 'EMPTY' | 'QC_PASS' | 'QC_FAIL'
  issued_at: string
  used_at: string | null
  used_by_application: string | null
  operator_name: string
  admin_name: string
}

export interface SheetStats {
  total_sheets: number
  available_sheets: number
  qc_pass_sheets?: number
  qc_fail_sheets?: number
}

export interface SheetFilters {
  operator_id?: number
  location_id?: number
  status?: 'EMPTY' | 'QC_PASS' | 'QC_FAIL'
}

export const sheetsAPI = {
  // Assign sheet numbers to operator
  assignSheets: async (data: SheetAssignmentRequest): Promise<SheetAssignmentResponse> => {
    const response = await apiClient.post('/sheets/assign', data)
    return response.data
  },

  // Upload sheet numbers from file
  uploadSheets: async (file: File, operatorId: number, locationId: number): Promise<SheetAssignmentResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('operator_id', operatorId.toString())
    formData.append('location_id', locationId.toString())

    const response = await apiClient.post('/sheets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get sheets with filtering
  getSheets: async (filters?: SheetFilters): Promise<Sheet[]> => {
    const params = new URLSearchParams()
    if (filters?.operator_id) params.append('operator_id', filters.operator_id.toString())
    if (filters?.location_id) params.append('location_id', filters.location_id.toString())
    if (filters?.status) params.append('status', filters.status)

    const response = await apiClient.get(`/sheets?${params.toString()}`)
    return response.data
  },

  // Get available sheets for operator
  getAvailableSheets: async (): Promise<string[]> => {
    const response = await apiClient.get('/sheets/available')
    return response.data
  },

  // Get sheet statistics
  getSheetStats: async (): Promise<SheetStats> => {
    const response = await apiClient.get('/sheets/stats')
    return response.data
  },
}
