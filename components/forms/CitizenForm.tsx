"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showNotification } from "@/lib/utils/notifications"
// import { formatCNIC, validateCNIC } from "@/lib/utils/formatting"
import { citizenSchema, type CitizenFormData } from "@/lib/validations/citizen"
import { applicationAPI } from "@/lib/api/applications"
import { nadraAPI } from "@/lib/api/nadra"
import { useAuthStore } from "@/lib/stores/auth-store"

export function CitizenForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const router = useRouter()
  const { user } = useAuthStore()

  const form = useForm<CitizenFormData>({
    resolver: zodResolver(citizenSchema),
    defaultValues: {
      citizen_id: "",
      first_name: "",
      last_name: "",
      father_name: "",
      mother_name: "",
      gender:"",
      date_of_birth: "",
      // nationality: "",
      profession: "",
      pakistan_city: "",
      pakistan_address: "",
      birth_country: "",
      birth_city: "",
      height: "",
      color_of_eyes: "",
      color_of_hair: "",
      departure_date: "",
      transport_mode: "",
      investor: "",
      requested_by: "",
      reason_for_deport: "",
      securityDeposit: "",
      amount: 0,
      currency: "",
      // is_fia_blacklist: false,
    },
  })

  const handleGetData = async () => {
    const citizenId = form.getValues("citizen_id")
    if (!/^\d{12}$/.test(citizenId)) {
      showNotification.error("Please enter a valid 12-digit citizen ID")
      return
    }

    setIsFetchingData(true)
    try {
      const data = await nadraAPI.getCitizenData(citizenId)
      form.reset(data)
      showNotification.success("Data fetched successfully")
    } catch (error: any) {
      showNotification.error(error.response?.data?.message || error.message || "Failed to fetch data from NADRA")
    } finally {
      setIsFetchingData(false)
    }
  }

  const onSubmit = async (data: CitizenFormData) => {
    setIsLoading(true)
    try {
      // Ensure status is always set to DRAFT for new applications
      const applicationData = {
        ...data,
        status: "DRAFT"
      }
      const application = await applicationAPI.create(applicationData)
      showNotification.success("Application created successfully")
      
      // Navigate based on user role
      console.log('Application created successfully, user role:', user?.role)
      if (user?.role === "MISSION_OPERATOR") {
        // Mission Operators go back to their main dashboard
        console.log('Redirecting Mission Operator to dashboard')
        router.push("/mission")
      } else {
        // Other roles can view the application details
        console.log('Redirecting to application details page')
        router.push(`/applications/${application.id}`)
      }
    } catch (error) {
      showNotification.error("Failed to create application")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Emergency Travel Document Application
            </CardTitle>
            <CardDescription>
              Enter citizen information to create a new application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Citizen ID Section */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="citizen_id">Citizen ID</Label>
                  <Input
                    id="citizen_id"
                    placeholder="Enter 13-digit citizen ID"
                    maxLength={13}
                    pattern="\d{13}"
                    inputMode="numeric"
                    {...form.register("citizen_id")}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleGetData}
                  disabled={isFetchingData || !/^\d{13}$/.test(form.watch("citizen_id"))}
                  className="mt-6"
                >
                  {isFetchingData ? "Fetching..." : "Get Data"}
                </Button>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" {...form.register("first_name")} />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" {...form.register("last_name")} />
                </div>
                <div>
                  <Label htmlFor="father_name">Father&apos;s Name</Label>
                  <Input id="father_name" {...form.register("father_name")} />
                </div>
                <div>
                  <Label htmlFor="mother_name">Mother&apos;s Name</Label>
                  <Input id="mother_name" {...form.register("mother_name")} />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" {...form.register("gender")} />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input id="date_of_birth" type="date" {...form.register("date_of_birth")} />
                </div>
                {/* <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" {...form.register("nationality")} />
                </div> */}
              </div>

              {/* Address & Birth Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birth_country">Birth Country</Label>
                  <Input id="birth_country" {...form.register("birth_country")} />
                </div>
                <div>
                  <Label htmlFor="birth_city">Birth City</Label>
                  <Input id="birth_city" {...form.register("birth_city")} />
                </div>
                <div>
                  <Label htmlFor="pakistan_city">City</Label>
                  <Input id="pakistan_city" {...form.register("pakistan_city")} />
                </div>
                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Input id="profession" {...form.register("profession")} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="pakistan_address">Address</Label>
                  <Input id="pakistan_address" {...form.register("pakistan_address")} />
                </div>
              </div>

              {/* Physical Characteristics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input id="height"  placeholder="e.g., 5.9" {...form.register("height")} />
                </div>
                <div>
                  <Label htmlFor="color_of_eyes">Eye Color</Label>
                  <Input id="color_of_eyes" {...form.register("color_of_eyes")} />
                </div>
                <div>
                  <Label htmlFor="color_of_hair">Hair Color</Label>
                  <Input id="color_of_hair" {...form.register("color_of_hair")} />
                </div>
              </div>

              {/* Travel & Request Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure_date">Departure Date</Label>
                  <Input id="departure_date" type="date" {...form.register("departure_date")} />
                </div>
                <div>
                  <Label htmlFor="transport_mode">Transport Mode</Label>
                  <Input id="transport_mode" placeholder="e.g., Air, Road, Sea" {...form.register("transport_mode")} />
                </div>
                <div>
                  <Label htmlFor="investor">Investor</Label>
                  <Input id="transport_mode" placeholder="Gov of Pakistan" {...form.register("investor")} />
                </div>
                <div>
                  <Label htmlFor="requested_by">Requested By</Label>
                  <Input id="requested_by" {...form.register("requested_by")} />
                </div>
                <div>
                  <Label htmlFor="reason_for_deport">Reason for Deport</Label>
                  <Input id="reason_for_deport" {...form.register("reason_for_deport")} />
                </div>
                <div>
                  <Label htmlFor="securityDeposit">Security Deposit Description (if any)</Label>
                  <Input id="securityDeposit" placeholder="-" {...form.register("securityDeposit")} />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" step="0.01" {...form.register("amount", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" {...form.register("currency")} />
                </div>
                {/* <div>
                  <Label htmlFor="is_fia_blacklist">FIA Blacklist</Label>
                  <Input id="is_fia_blacklist" type="checkbox" {...form.register("is_fia_blacklist")} />
                </div> */}

              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
