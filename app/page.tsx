"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case "ADMIN":
          router.push("/admin")
          break
        case "AGENCY":
          router.push("/agency")
          break
        case "MINISTRY":
          router.push("/ministry")
          break
        case "MISSION_OPERATOR":
          router.push("/hq")
          break
        default:
          router.push("/admin")
      }
    } else {
      // Redirect to login if not authenticated
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Emergency Travel Document System
        </h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
