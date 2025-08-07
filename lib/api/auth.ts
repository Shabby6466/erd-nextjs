import apiClient from "./client"
import { User } from "../types"

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const authAPI = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", credentials)
    return response.data
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout")
  },

  // Verify token and get user info
  verify: async (): Promise<{ user: User }> => {
    const response = await apiClient.get("/auth/verify")
    return response.data
  },
}
