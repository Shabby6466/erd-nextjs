"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showNotification } from "@/lib/utils/notifications"
import { useAuthStore } from "@/lib/stores/auth-store"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    console.log('Login attempt:', { email: data.email })
    try {
      const result = await login(data.email, data.password)
      console.log('Login result:', { success: result.success, error: result.error })
      
      if (result.success) {
        showNotification.success("Login successful")
        // Redirect based on user role
        const user = useAuthStore.getState().user
        console.log('User after login:', user)
        
        if (user) {
          switch (user.role) {
            case "ADMIN":
              console.log('Redirecting to admin dashboard')
              router.push("/admin")
              break
            case "AGENCY":
              console.log('Redirecting to agency dashboard')
              router.push("/agency")
              break
            case "MINISTRY":
              console.log('Redirecting to ministry dashboard')
              router.push("/ministry")
              break
            case "MISSION_OPERATOR":
              console.log('Redirecting to mission dashboard')
              router.push("/mission")
              break
            default:
              console.log('Unknown role, redirecting to admin')
              router.push("/admin")
          }
        } else {
          console.log('No user found, redirecting to home')
          router.push("/")
        }
      } else {
        console.error('Login failed:', result.error)
        showNotification.error(result.error || "Login failed")
      }
    } catch (error) {
      console.error('Login error:', error)
      showNotification.error("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Emergency Travel Document
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...form.register("email")}
                className={form.formState.errors.email ? "border-red-500" : ""}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...form.register("password")}
                className={form.formState.errors.password ? "border-red-500" : ""}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
