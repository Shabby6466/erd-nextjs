"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'

interface AuthGuardProps {
  children: React.ReactNode
  roles?: string[]
  redirect?: string
}

export function AuthGuard({ children, roles, redirect = '/login' }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirect)
      return
    }

    if (roles && user && !roles.includes(user.role)) {
      router.push('/unauthorized')
      return
    }
  }, [isAuthenticated, user, roles, redirect, router])

  if (!isAuthenticated) {
    return null
  }

  if (roles && user && !roles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}