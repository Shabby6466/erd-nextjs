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
import { formatCNIC, validateCNIC } from "@/lib/utils/formatting"
import { citizenSchema, type CitizenFormData } from "@/lib/validations/citizen"
import { applicationAPI } from "@/lib/api/applications"

export function CitizenForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const router = useRouter()

  const form = useForm<CitizenFormData>({
    resolver: zodResolver(citizenSchema),
    defaultValues: {
      citizen_id: "",
      first_name: "",
      last_name: "",
      father_name: "",
      mother_name: "",
      date_of_birth: "",
      nationality: "",
      profession: "",
      pakistan_city: "",
      pakistan_address: "",
      height: "",
      color_of_eyes: "",
      color_of_hair: "",
      departure_date: "",
      transport_mode: "",
    },
  })

  const handleGetData = async () => {
    const citizenId = form.getValues("citizen_id")
    if (!validateCNIC(citizenId)) {
      showNotification.error("Please enter a valid CNIC")
      return
    }

    setIsFetchingData(true)
    try {
      // Simulate external API call
      const response = await fetch(`/api/nadra?citizenId=${citizenId}`)
      if (response.ok) {
        const data = await response.json()
        form.reset(data)
        showNotification.success("Data fetched successfully")
      } else {
        showNotification.error("Failed to fetch data from NADRA")
      }
    } catch (error) {
      showNotification.error("Error fetching data")
    } finally {
      setIsFetchingData(false)
    }
  }

  const onSubmit = async (data: CitizenFormData) => {
    setIsLoading(true)
    try {
      const application = await applicationAPI.create(data)
      showNotification.success("Application created successfully")
      router.push(`/applications/${application.id}`)
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
              {/* CNIC Section */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="citizen_id">CNIC Number</Label>
                  <Input
                    id="citizen_id"
                    placeholder="Enter CNIC (e.g., 12345-1234567-1)"
                    {...form.register("citizen_id")}
                    onChange={(e) => {
                      const formatted = formatCNIC(e.target.value)
                      form.setValue("citizen_id", formatted)
                    }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleGetData}
                  disabled={isFetchingData || !validateCNIC(form.watch("citizen_id"))}
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
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input id="date_of_birth" type="date" {...form.register("date_of_birth")} />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" {...form.register("nationality")} />
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Input id="height" placeholder="e.g., 5'8&quot;" {...form.register("height")} />
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

              {/* Travel Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure_date">Departure Date</Label>
                  <Input id="departure_date" type="date" {...form.register("departure_date")} />
                </div>
                <div>
                  <Label htmlFor="transport_mode">Transport Mode</Label>
                  <Input id="transport_mode" placeholder="e.g., Air, Road, Sea" {...form.register("transport_mode")} />
                </div>
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
