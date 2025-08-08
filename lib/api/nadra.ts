import apiClient from "./client"

export interface NadraData {
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
  // height: string
  // color_of_eyes: string
  // color_of_hair: string
//   investor: string
//   securityDeposit: string
}

export const nadraAPI = {
  // Get citizen data from NADRA
  getCitizenData: async (citizenId: string): Promise<NadraData> => {
    const response = await apiClient.get(`/nadra?citizenId=${citizenId}`)
    return response.data
  },
}