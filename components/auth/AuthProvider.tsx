"use client"

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { verifyToken, isLoading } = useAuthStore()

  useEffect(() => {
    verifyToken()
  }, [verifyToken])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
}