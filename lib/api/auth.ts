import apiClient from './client'

export const authAPI = {
  async login(credentials: { email: string; password: string }): Promise<any> {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  }
}
