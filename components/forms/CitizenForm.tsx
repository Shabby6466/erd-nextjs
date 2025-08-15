"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showNotification } from "@/lib/utils/notifications"
// import { formatCNIC, validateCNIC } from "@/lib/utils/formatting"
import { citizenSchema, type CitizenFormData } from "@/lib/validations/citizen"
import { applicationAPI } from "@/lib/api/applications"
import { nadraAPI } from "@/lib/api/nadra"
import { passportAPI, type PassportApiResponse } from "@/lib/api/passport"
import { useAuthStore } from "@/lib/stores/auth-store"
import { DGIPHeaderWithWatermarks } from "@/components/ui/dgip_header_watermarks"
import ETDApplicationPhotoCard from "@/components/ui/etd_application_photo_card"
import { DetailForm } from "@/components/forms/DetailForm"
import SheetSelector from "@/components/operator/SheetSelector"

export function CitizenForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string>("")
  const [showFullForm, setShowFullForm] = useState(false)
  const [initialCitizenId, setInitialCitizenId] = useState("")
  const [initialImageBase64, setInitialImageBase64] = useState<string>("")
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const router = useRouter()
  const { user } = useAuthStore()

  // Function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  // Function to handle manual image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification.error("Please select a valid image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification.error("Image size must be less than 5MB")
        return
      }

      // File uploaded successfully
      const base64 = await convertFileToBase64(file)
      setImageBase64(base64)
      form.setValue("image", base64)

      // Set passport photo for display
      setPassportPhoto(`data:${file.type};base64,${base64}`)

      showNotification.success("Image uploaded successfully")
    } catch {
      showNotification.error("Failed to process image")
    }
  }

  const form = useForm<CitizenFormData>({
    resolver: zodResolver(citizenSchema),
    defaultValues: {
      citizen_id: initialCitizenId,
      first_name: "",
      last_name: "",
      image: initialImageBase64,
      father_name: "",
      mother_name: "",
      gender: "",
      date_of_birth: "",
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
      is_fia_blacklist: false,
      status: "DRAFT",
      passport_api_data: undefined,
      nadra_api_data: undefined,
    },
  })

  // Function to map passport API response to form data
  const mapPassportDataToForm = (passportData: PassportApiResponse): Partial<CitizenFormData> => {
    // Helper function to format date from DD-MMM-YYYY to YYYY-MM-DD
    const formatDate = (dateStr: string): string => {
      try {
        const months: { [key: string]: string } = {
          'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
          'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
          'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
        }

        const [day, month, year] = dateStr.split('-')
        const monthNum = months[month] || '01'
        return `${year}-${monthNum}-${day.padStart(2, '0')}`
      } catch {
        return dateStr
      }
    }

    // Combine first names and last name
    const fullFirstName = passportData.first_names || ''
    const lastName = passportData.last_name || ''

    // Combine father's names
    const fatherFullName = `${passportData.father_first_names || ''} ${passportData.father_last_name || ''}`.trim()

    return {
      citizen_id: passportData.citizen_no,
      first_name: fullFirstName,
      last_name: lastName,
      image: passportData.photograph || '', // Base64 image from passport API
      father_name: fatherFullName,
      // Note: mother_name is not available in passport API - user will need to fill manually
      // Don't include mother_name in mapping to avoid clearing existing value
      // Map gender (m/f to Male/Female)
      gender: passportData.gender === 'm' ? 'Male' : passportData.gender === 'f' ? 'Female' : passportData.gender,
      date_of_birth: formatDate(passportData.birthdate),
      profession: passportData.profession,
      birth_country: passportData.birthcountry === 'PK' ? 'Pakistan' : passportData.birthcountry,
      birth_city: passportData.birthcity,
      // Set pakistan_city to birth_city if birth_country is Pakistan
      pakistan_city: passportData.birthcountry === 'PK' ? passportData.birthcity : '',
    }
  }

  // Handler for immediate navigation from photo card
  const handlePhotoCardNavigate = (citizenId: string, imageBase64: string | null) => {
    console.log("handlePhotoCardNavigate called with:", { citizenId, hasImage: !!imageBase64 })
    
    if (!/^\d{13}$/.test(citizenId)) {
      showNotification.error("Please enter a valid 13-digit citizen ID")
      return
    }

    // Set initial values from photo card
    setInitialCitizenId(citizenId)
    setInitialImageBase64(imageBase64 || "")
    
    // Set form values
    form.setValue("citizen_id", citizenId)
    form.setValue("image", imageBase64 || "")
    
    // Set photo for display if available
    if (imageBase64) {
      setPassportPhoto(`data:image/jpeg;base64,${imageBase64}`)
      setImageBase64(imageBase64)
    }

    // Immediately show the full form
    setShowFullForm(true)
    
    // Start fetching data in the background
    handlePhotoCardGetData(citizenId, imageBase64)
  }

  // Handler for photo card "Get Data" button (background API calls)
  const handlePhotoCardGetData = async (citizenId: string, imageBase64: string | null) => {
    console.log("handlePhotoCardGetData called with:", { citizenId, hasImage: !!imageBase64 })
    
    if (!/^\d{13}$/.test(citizenId)) {
      showNotification.error("Please enter a valid 13-digit citizen ID")
      return
    }

    // Note: Form values are already set by handlePhotoCardNavigate

    setIsFetchingData(true)
    try {
      // Try passport API first
      const passportData = await passportAPI.getCitizenData(citizenId)
      const mappedData = mapPassportDataToForm(passportData)

      // Update form with mapped data (skip empty values)
      Object.entries(mappedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          form.setValue(key as keyof CitizenFormData, value)
        }
      })

      // Set passport photo if available (override uploaded photo)
      if (passportData.photograph) {
        setPassportPhoto(`data:image/jpeg;base64,${passportData.photograph}`)
        setImageBase64(passportData.photograph)
        form.setValue("image", passportData.photograph)
      }

      // Store passport API data for submission
      form.setValue("passport_api_data", passportData)

      showNotification.success("Data fetched successfully from Passport API")
    } catch (passportError) {
      console.warn('Passport API failed, trying NADRA API:', passportError)
      try {
        // Fallback to NADRA API
        const data = await nadraAPI.getCitizenData(citizenId)
        form.reset(data)
        // Keep the uploaded photo if no passport photo available
        if (imageBase64) {
          form.setValue("image", imageBase64)
          setPassportPhoto(`data:image/jpeg;base64,${imageBase64}`)
          setImageBase64(imageBase64)
        } else {
          setPassportPhoto(null)
          setImageBase64("")
        }

        // Store NADRA API data for submission
        form.setValue("nadra_api_data", data)

        showNotification.success("Data fetched successfully from NADRA API (no photo available - please upload manually)")
      } catch (nadraError: unknown) {
        const errorMessage = nadraError instanceof Error 
          ? nadraError.message 
          : "Failed to fetch data from both Passport and NADRA APIs"
        showNotification.error(errorMessage)
        // Still show the form even if API fails - user can fill manually
        showNotification.info("You can now fill in the remaining information manually")
      }
    } finally {
      setIsFetchingData(false)
      // Don't show full form here - it's already shown by navigation
    }
  }

  // Handler for form "Get Data" button (for re-fetching data)
  const handleGetData = async () => {
    const citizenId = form.getValues("citizen_id")
    if (!/^\d{13}$/.test(citizenId)) {
      showNotification.error("Please enter a valid 13-digit citizen ID")
      return
    }

    setIsFetchingData(true)
    try {
      // Try passport API first
      const passportData = await passportAPI.getCitizenData(citizenId)
      const mappedData = mapPassportDataToForm(passportData)

      // Update form with mapped data (skip empty values)
      Object.entries(mappedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          form.setValue(key as keyof CitizenFormData, value)
        }
      })

      // Set passport photo if available
      if (passportData.photograph) {
        setPassportPhoto(`data:image/jpeg;base64,${passportData.photograph}`)
        setImageBase64(passportData.photograph)
      }

      // Store passport API data for submission
      form.setValue("passport_api_data", passportData)

      showNotification.success("Data fetched successfully from Passport API")
    } catch (passportError) {
      console.warn('Passport API failed, trying NADRA API:', passportError)
      try {
        // Fallback to NADRA API
        const data = await nadraAPI.getCitizenData(citizenId)
        form.reset(data)
        setPassportPhoto(null) // Clear any previous photo
        setImageBase64("") // Clear base64 image

        // Store NADRA API data for submission
        form.setValue("nadra_api_data", data)

        showNotification.success("Data fetched successfully from NADRA API (no photo available - please upload manually)")
      } catch (nadraError: unknown) {
        const errorMessage = nadraError instanceof Error 
          ? nadraError.message 
          : "Failed to fetch data from both Passport and NADRA APIs"
        showNotification.error(errorMessage)
      }
    } finally {
      setIsFetchingData(false)
    }
  }

  const onSubmit = async (data: CitizenFormData) => {
    console.log('Form submission started with data:', data)
    setIsLoading(true)
    
    try {
      // Validate that image is provided
      if (!data.image || data.image.trim() === '') {
        showNotification.error("Please upload a photograph before submitting")
        setIsLoading(false)
        return
      }

      console.log('Image validation passed')

      // Prepare API data objects
      const now = new Date().toISOString()
      
      // Create passport API data if we have passport information (optional)
      const passportApiData = data.passport_api_data ? {
        createdAt: now,
        updatedAt: now,
        citizen_id: data.citizen_id,
        image_url: data.image ? `data:image/jpeg;base64,${data.image}` : "",
        first_name: data.first_name,
        last_name: data.last_name,
        father_name: data.father_name,
        pakistan_city: data.pakistan_city,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        birth_country: data.birth_country,
        birth_city: data.birth_city,
        profession: data.profession,
        pakistan_address: data.pakistan_address,
        response_status: "SUCCESS",
        api_response_date: now,
        raw_response: data.passport_api_data
      } : undefined

      // Create NADRA API data if we have NADRA information (optional)
      const nadraApiData = data.nadra_api_data ? {
        createdAt: now,
        updatedAt: now,
        citizen_id: data.citizen_id,
        image_url: data.image ? `data:image/jpeg;base64,${data.image}` : "",
        first_name: data.first_name,
        last_name: data.last_name,
        father_name: data.father_name,
        mother_name: data.mother_name,
        pakistan_city: data.pakistan_city,
        date_of_birth: data.date_of_birth,
        birth_country: data.birth_country,
        birth_city: data.birth_city,
        profession: data.profession,
        pakistan_address: data.pakistan_address,
        response_status: "SUCCESS",
        api_response_date: now,
        raw_response: data.nadra_api_data
      } : undefined

      console.log('Passport API data:', passportApiData ? 'present' : 'not present')
      console.log('NADRA API data:', nadraApiData ? 'present' : 'not present')

      // Format the application data according to the new API structure
      const applicationData = {
        first_name: data.first_name,
        last_name: data.last_name,
        image: data.image,
        father_name: data.father_name,
        mother_name: data.mother_name,
        citizen_id: data.citizen_id,
        gender: data.gender,
        pakistan_city: data.pakistan_city,
        date_of_birth: data.date_of_birth,
        birth_country: data.birth_country,
        birth_city: data.birth_city,
        profession: data.profession,
        pakistan_address: data.pakistan_address,
        height: data.height || "",
        color_of_hair: data.color_of_hair || "",
        color_of_eyes: data.color_of_eyes || "",
        departure_date: data.departure_date,
        transport_mode: data.transport_mode || "",
        investor: data.investor || "",
        requested_by: data.requested_by,
        reason_for_deport: data.reason_for_deport || "",
        amount: data.amount || 0,
        currency: data.currency || "",
        is_fia_blacklist: data.is_fia_blacklist || false,
        status: "DRAFT",
        passport_photo_url: data.image ? `data:image/jpeg;base64,${data.image}` : undefined,
        other_documents_url: undefined, // Will be set when documents are uploaded
        passport_api_data: passportApiData,
        nadra_api_data: nadraApiData,
        sheet_number: selectedSheet || undefined
      }

      console.log('Sending application data to API:', applicationData)
      console.log('API endpoint: /applications')

      const application = await applicationAPI.create(applicationData)
      console.log('API response received:', application)
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
      console.error('Error creating application:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      showNotification.error("Failed to create application")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#E5EDFF' }}>
      <DGIPHeaderWithWatermarks />
      <div className="relative z-20 max-w-4xl mx-auto">
        {!showFullForm ? (
          // Show photo card first
          <ETDApplicationPhotoCard
            title="Emergency Travel Document Application"
            onNavigate={(citizenId, imageBase64) => {
              console.log("Get Data pressed with citizen ID:", citizenId)
              console.log("Current imageBase64:", imageBase64)
              handlePhotoCardNavigate(citizenId, imageBase64)
            }}
            onImageChange={(base64) => {
              console.log("Image changed:", base64 ? "has image" : "no image")
              // Handle image change from photo card
              if (base64) {
                setImageBase64(base64)
                form.setValue("image", base64)
              } else {
                setImageBase64("")
                form.setValue("image", "")
              }
            }}
          />
        ) : (
          // Show full form after "Get Data" is pressed
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Emergency Travel Document Application
                  </CardTitle>
                  <CardDescription>
                    Enter citizen information to create a new application
                  </CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowFullForm(false)}
                  className="text-sm"
                >
                  ← Back to Photo
                </Button>
              </div>
            </CardHeader>
            <CardContent>

              <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error('Form validation errors:', errors)
                showNotification.error("Please fix the form errors before submitting")
              })} className="space-y-6">
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
                 {/* DETAIL FORM */}
                 <div className="mx-auto p-2 space-y-2">
                 <div className="flex items-center gap-3">
                 <DetailForm 
                   data={form.watch()} 
                   title="Nadra Details"
                   passportPhoto={passportPhoto}
                   onNext={() => {}} 
                   onBack={() => {}} 
                 />
                 <DetailForm 
                   data={form.watch()} 
                   title="Passport Details"
                   passportPhoto={passportPhoto}
                   onNext={() => {}} 
                   onBack={() => {}} 
                 />
                 </div>
                 </div>

                {/* Image Upload Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">Photograph *</Label>

                  {/* Image Display */}
                  {passportPhoto && (
                    <div className="flex justify-center mb-4">
                      <div className="border-2 border-gray-300 rounded-lg p-2 bg-white">
                        <Image
                          src={passportPhoto}
                          alt="Citizen Photo"
                          width={128}
                          height={160}
                          className="object-cover rounded"
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                      </div>
                    </div>

                    {!passportPhoto && !imageBase64 && (
                      <p className="text-sm text-gray-600">
                        No image available from passport API. Please upload a photo manually.
                      </p>
                    )}

                    {imageBase64 && (
                      <p className="text-sm text-green-600">
                        ✓ Image ready for submission (Base64 format)
                      </p>
                    )}
                  </div>
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
                  <Input id="height" placeholder="e.g., 5.9" {...form.register("height")} />
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
                  <Input id="investor" placeholder="Gov of Pakistan" {...form.register("investor")} />
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

              {/* Sheet Selection - Only show for operators */}
              {user?.role === "MISSION_OPERATOR" && (
                <div className="border-t pt-6">
                  <SheetSelector
                    onSheetSelect={setSelectedSheet}
                    selectedSheet={selectedSheet}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    console.log('Current form values:', form.getValues())
                    console.log('Form errors:', form.formState.errors)
                  }}
                >
                  Debug Form
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}
