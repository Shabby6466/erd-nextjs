import { apiClient } from "./client"

export const attachmentAPI = {
  // Upload attachment for application
  upload: async (applicationId: string, file: File): Promise<any> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("applicationId", applicationId)

    const response = await apiClient.post(`/applications/${applicationId}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Get attachment file with authentication
  getFile: async (attachmentPath: string): Promise<string> => {
    try {
      // Try the file endpoint through API
      const response = await apiClient.get(`/files/${attachmentPath}`, {
        responseType: 'blob',
      })
      
      // Convert blob to URL for viewing
      const blob = new Blob([response.data], { type: 'application/pdf' })
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error fetching file through API:', error)
      
      // Fallback to direct URL access
      const baseUrl = apiClient.defaults.baseURL?.replace('/v1/api', '') || 'http://localhost:3837'
      return `${baseUrl}/${attachmentPath}`
    }
  },

  // Download attachment file
  downloadFile: async (attachmentPath: string, fileName: string): Promise<void> => {
    try {
      const response = await apiClient.get(`/files/${attachmentPath}`, {
        responseType: 'blob',
      })
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      
      // Fallback to direct URL
      const baseUrl = apiClient.defaults.baseURL?.replace('/v1/api', '') || 'http://localhost:3837'
      const fallbackUrl = `${baseUrl}/${attachmentPath}`
      
      const link = document.createElement('a')
      link.href = fallbackUrl
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}