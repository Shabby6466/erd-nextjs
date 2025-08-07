"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleGoBack = () => {
    if (user) {
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
          router.push("/mission")
          break
        default:
          router.push("/")
      }
    } else {
      router.push("/")
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            Access Denied
          </CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Your current role ({user?.role}) doesn&apos;t have access to this resource.
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoBack} variant="outline">
              Go Back
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}