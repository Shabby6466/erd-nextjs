import apiClient from "./client"

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
}