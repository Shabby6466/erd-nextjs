import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authAPI } from "../api/auth"

export interface User {
  id: string
  email: string
  name: string
  role: "ADMIN" | "MINISTRY" | "AGENCY" | "MISSION_OPERATOR"
  state?: string
  agency?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  verifyToken: () => Promise<void>
  setUser: (user: User) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: async (email: string, password: string) => {
        try {
          const data = await authAPI.login({ email, password })
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          })
          return { success: true }
        } catch (err: unknown) {
          const message = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as { message?: string }).message || "Login failed"
          return { success: false, error: message }
        }
      },
      logout: async () => {
        try {
          await authAPI.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
      },
      verifyToken: async () => {
        const { token } = get()
        if (!token) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          const data = await authAPI.verify()
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          console.error('Token verification error:', error)
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },
      setUser: (user: User) => {
        set({ user })
      },
      setToken: (token: string) => {
        set({ token, isAuthenticated: true })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => {
        // Called right after rehydration completes
        return () => {
          const { token, verifyToken } = useAuthStore.getState()
          if (token) {
            // Verify will set user and clear loading
            verifyToken()
          } else {
            // No token, stop loading
            useAuthStore.setState({ isLoading: false, isAuthenticated: false, user: null })
          }
        }
      },
    }
  )
)