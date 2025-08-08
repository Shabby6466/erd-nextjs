"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showNotification } from "@/lib/utils/notifications"
import { UserRole, Region } from "@/lib/types"
import { userAPI } from "@/lib/api/users"
import { useAuthStore } from "@/lib/stores/auth-store"

const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(1, "Full name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "MINISTRY", "AGENCY", "MISSION_OPERATOR"]),
  agency: z.string().optional(),
  state: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

interface CreateUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      role: "MISSION_OPERATOR",
      agency: "",
      state: "",
      status: "ACTIVE",
    },
  })

  const watchedRole = form.watch("role")

  const onSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true)
    try {
      await userAPI.create(data)
      showNotification.success("User created successfully")
      onOpenChange(false)
      form.reset()
      // Trigger refresh of user list
      window.location.reload()
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to create user")
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Create New User
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                className={form.formState.errors.fullName ? "border-red-500" : ""}
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
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
                {...form.register("password")}
                className={form.formState.errors.password ? "border-red-500" : ""}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                {...form.register("role")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MISSION_OPERATOR">Mission Operator</option>
                <option value="AGENCY">Agency</option>
                <option value="MINISTRY">Ministry</option>
                {user?.role === "ADMIN" && (
                  <option value="ADMIN">Admin</option>
                )}
              </select>
            </div>

            {watchedRole === "MISSION_OPERATOR" && (
              <div className="space-y-2">
                <Label htmlFor="state">State/Region</Label>
                <select
                  id="state"
                  {...form.register("state")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select State/Region</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="KPK">KPK</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Gilgit_Baltistan">Gilgit Baltistan</option>
                  <option value="AJK">AJK</option>
                  <option value="Federal">Federal</option>
                </select>
              </div>
            )}

            {watchedRole === "AGENCY" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="agency">Agency</Label>
                  <select
                    id="agency"
                    {...form.register("agency")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Agency</option>
                    <option value="INTELLIGENCE_BUREAU">Intelligence Bureau</option>
                    <option value="SPECIAL_BRANCH_PUNJAB">Special Branch Punjab</option>
                    <option value="SPECIAL_BRANCH_SINDH">Special Branch Sindh</option>
                    <option value="SPECIAL_BRANCH_KPK">Special Branch KPK</option>
                    <option value="SPECIAL_BRANCH_BALOCHISTAN">Special Branch Balochistan</option>
                    <option value="SPECIAL_BRANCH_FEDERAL">Special Branch Federal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <select
                    id="state"
                    {...form.register("state")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select State/Region</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="KPK">KPK</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Gilgit_Baltistan">Gilgit Baltistan</option>
                    <option value="AJK">AJK</option>
                    <option value="Federal">Federal</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...form.register("status")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}