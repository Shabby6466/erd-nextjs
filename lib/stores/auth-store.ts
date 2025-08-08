import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authAPI } from "../api/auth"
import { cookieUtils } from "../utils/cookies"

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
  isVerifying: boolean
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
      isVerifying: false,
      login: async (email: string, password: string) => {
        try {
          const data = await authAPI.login({ email, password })
          
          // Store token in both localStorage (via Zustand persist) and cookie (for server-side)
          cookieUtils.set('auth-token', data.token, { persistent: true })
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
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
          // Clear both localStorage and cookie
          cookieUtils.remove('auth-token')
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
      verifyToken: async () => {
        const { token, isVerifying } = get()
        
        console.log('verifyToken called - token exists:', !!token, 'isVerifying:', isVerifying)
        
        // Prevent multiple simultaneous verification calls
        if (isVerifying) {
          console.log('Verification already in progress, skipping')
          return
        }
        
        if (!token) {
          console.log('No token found, stopping verification')
          set({ isLoading: false, isVerifying: false })
          return
        }

        console.log('Starting token verification')
        set({ isLoading: true, isVerifying: true })
        try {
          const data = await authAPI.verify()
          console.log('Token verification successful')
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            isVerifying: false
          })
        } catch (error) {
          console.error('Token verification failed:', error)
          // Clear both localStorage and cookie when verification fails
          cookieUtils.remove('auth-token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isVerifying: false
          })
        }
      },
      setUser: (user: User) => {
        set({ user })
      },
      setToken: (token: string) => {
        // Store token in both localStorage (via Zustand persist) and cookie (for server-side)
        cookieUtils.set('auth-token', token, { persistent: true })
        set({ token, isAuthenticated: true })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => {
        // Called right after rehydration completes
        return () => {
          const state = useAuthStore.getState()
          let { token, user, isAuthenticated } = state
          
          console.log('Auth rehydration - localStorage token:', !!token)
          console.log('Auth rehydration - user:', !!user)
          console.log('Auth rehydration - isAuthenticated:', isAuthenticated)
          
          // If no token in localStorage, check cookie as fallback
          if (!token) {
            const cookieToken = cookieUtils.get('auth-token')
            console.log('Auth rehydration - cookie token found:', !!cookieToken)
            if (cookieToken) {
              // Restore token from cookie to localStorage
              useAuthStore.setState({ token: cookieToken })
              // Also refresh the cookie
              cookieUtils.set('auth-token', cookieToken, { persistent: true })
              token = cookieToken
            }
          } else {
            // If token exists in localStorage, make sure it's also in cookie
            cookieUtils.set('auth-token', token, { persistent: true })
          }
          
          // If we have a token (from either source), mark as ready for verification
          if (token) {
            console.log('Auth rehydration - token found, ready for verification')
            useAuthStore.setState({ isLoading: false })
          } else {
            console.log('Auth rehydration - no token found anywhere, clearing state')
            // No token found anywhere, stop loading and clear state
            cookieUtils.remove('auth-token')
            useAuthStore.setState({ 
              isLoading: false, 
              isAuthenticated: false, 
              user: null,
              token: null
            })
          }
        }
      },
    }
  )
)