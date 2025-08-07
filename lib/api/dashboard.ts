import apiClient from './client'

export const dashboardAPI = {
  async getAdminStats(): Promise<any> {
    const response = await apiClient.get('/dashboard/admin/stats')
    return response.data
  },

  async getAgencyApplications(filters?: any): Promise<any> {
    const response = await apiClient.get('/dashboard/agency/applications', { params: filters })
    return response.data
  }
}
