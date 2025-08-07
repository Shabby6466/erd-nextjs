import apiClient from "./client"
import { User } from "../types"

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: "ADMIN" | "MINISTRY" | "AGENCY" | "MISSION_OPERATOR"
  region?: string
  agency?: string
}

export const userAPI = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get("/users")
    return response.data
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  // Create new user
  create: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post("/users", data)
    return response.data
  },

  // Update user
  update: async (id: string, data: Partial<CreateUserData>): Promise<User> => {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}