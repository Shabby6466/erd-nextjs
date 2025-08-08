import axios from "axios"
import { useAuthStore } from "@/lib/stores/auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3837/v1/api"
const PASSPORT_URL = "http://10.111.101.24:9009/api/passport"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})
export const passportApiClient = axios.create({
  baseURL: PASSPORT_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const { token } = useAuthStore.getState()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only auto-logout if it's not a login endpoint
      const isLoginEndpoint = error.config?.url?.includes('/auth/login')
      
      if (!isLoginEndpoint && typeof window !== "undefined") {
        console.log('401 error on non-login endpoint, logging out')
        const { logout } = useAuthStore.getState()
        logout()
        window.location.href = "/login"
      } else if (isLoginEndpoint) {
        console.log('401 error on login endpoint, not auto-logging out')
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
