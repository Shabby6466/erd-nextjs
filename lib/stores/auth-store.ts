import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  email: string
  name: string
  role: "ADMIN" | "MINISTRY" | "AGENCY" | "MISSION_OPERATOR"
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const error = await response.json()
            return { success: false, error: error.message || "Login failed" }
          }

          const data = await response.json()
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          })
          return { success: true }
        } catch (error) {
          return { success: false, error: "Network error" }
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
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
    }
  )
)
