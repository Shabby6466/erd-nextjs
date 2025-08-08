"use client"

import { useState, useEffect } from "react"
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
}).refine((data) => {
  // Agency role must have agency field
  if (data.role === "AGENCY" && !data.agency) {
    return false;
  }
  // Mission Operator must have state field (if available from API or manual entry)
  if (data.role === "MISSION_OPERATOR" && !data.state) {
    return false;
  }
  // Ministry users don't need state field anymore
  // Special Branch agencies should have state (except Intelligence Bureau)
  if (data.role === "AGENCY" && data.agency?.startsWith("SPECIAL_BRANCH") && !data.state) {
    return false;
  }
  return true;
}, {
  message: "Please fill in all required fields for the selected role",
  path: ["role"]
})

type CreateUserFormData = z.infer<typeof createUserSchema>

interface CreateUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [foreignMissionOffices, setForeignMissionOffices] = useState<string[]>([])
  const [isLoadingOffices, setIsLoadingOffices] = useState(false)
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
  const watchedAgency = form.watch("agency")

  // Fetch foreign mission offices when modal opens
  useEffect(() => {
    if (open) {
      const fetchOffices = async () => {
        setIsLoadingOffices(true)
        try {
          const offices = await userAPI.getForeignMissionOffices()
          // Ensure we have an array of strings
          if (Array.isArray(offices)) {
            const validOffices = offices
              .map(office => {
                if (typeof office === 'string') {
                  return office
                }
                // Handle object format like {value: "Jeddah", label: "Jeddah"}
                if (office && typeof office === 'object') {
                  return (office as any)?.value || (office as any)?.label || ''
                }
                return ''
              })
              .filter(office => office.length > 0)
            setForeignMissionOffices(validOffices)
          } else {
            console.warn('Foreign mission offices API returned non-array:', offices)
            setForeignMissionOffices([])
          }
        } catch (error) {
          console.error('Failed to fetch foreign mission offices:', error)
          // Don't show error notification, just fail silently
          setForeignMissionOffices([])
        } finally {
          setIsLoadingOffices(false)
        }
      }
      fetchOffices()
    }
  }, [open])

  const onSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true)
    
    // Prepare payload based on role requirements
    const payload: any = {
      email: data.email,
      fullName: data.fullName,
      password: data.password,
      role: data.role,
      status: data.status,
    }
    
    // Add role-specific fields
    if (data.role === "AGENCY") {
      payload.agency = data.agency
      if (data.state) {
        payload.state = data.state
      }
    } else if (data.role === "MISSION_OPERATOR") {
      payload.state = data.state
    }
    // Ministry users don't need state field
    // ADMIN roles don't need additional fields
    
    console.log('Creating user with payload:', payload)
    
    try {
      await userAPI.create(payload)
      showNotification.success("User created successfully")
      onOpenChange(false)
      form.reset()
      // Trigger refresh of user list
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to create user:', error)
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

            {/* Ministry users don't need additional fields */}

            {/* Mission Operator Foreign Mission Office */}
            {watchedRole === "MISSION_OPERATOR" && (
              <div className="space-y-2">
                <Label htmlFor="state">Foreign Mission Office *</Label>
                {isLoadingOffices ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500">
                    Loading foreign mission offices...
                  </div>
                ) : foreignMissionOffices.length > 0 ? (
                  <select
                    id="state"
                    {...form.register("state")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Foreign Mission Office</option>
                    {foreignMissionOffices.map((office, index) => (
                      <option key={`mission-${index}-${office}`} value={office}>
                        {office}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <Input
                      id="state"
                      type="text"
                      placeholder="Enter foreign mission office name"
                      {...form.register("state")}
                      className={form.formState.errors.state ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-gray-500">
                      Foreign mission offices list unavailable. Please enter manually.
                    </p>
                  </div>
                )}
                {form.formState.errors.state && watchedRole === "MISSION_OPERATOR" && (
                  <p className="text-sm text-red-500">Foreign Mission Office is required</p>
                )}
              </div>
            )}

            {watchedRole === "AGENCY" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="agency">Agency *</Label>
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
                {/* State field - show for Special Branch agencies */}
                {watchedAgency && watchedAgency.startsWith("SPECIAL_BRANCH") && (
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Region *</Label>
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