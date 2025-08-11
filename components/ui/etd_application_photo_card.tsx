"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { UploadCloud, Trash2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils" // optional; remove if you don't use cn()

type Props = {
  title?: string
  initialCitizenNumber?: string
  initialImageBase64?: string | null // base64 WITHOUT prefix; we'll add when rendering
  imgWidth?: number // fixed preview width (px)
  imgHeight?: number // fixed preview height (px)
  maxFileSizeMB?: number
  onGetData?: (citizenNumber: string) => void
  onDelete?: () => void
  onImageChange?: (base64: string | null) => void // returns base64 (no prefix) or null on delete
}

export default function ETDApplicationPhotoCard({
  title = "Emergency Travel Document",
  initialCitizenNumber = "",
  initialImageBase64 = null,
  imgWidth = 140,
  imgHeight = 140,
  maxFileSizeMB = 5,
  onGetData,
  onDelete,
  onImageChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [citizen, setCitizen] = useState(initialCitizenNumber)
  const [photoB64, setPhotoB64] = useState<string | null>(initialImageBase64)
  const [loading, setLoading] = useState(false)

  const openPicker = () => fileRef.current?.click()

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const res = (reader.result as string) || ""
        resolve(res.split(",")[1] ?? "") // strip data: prefix
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.")
      return
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      alert(`Image must be smaller than ${maxFileSizeMB}MB.`)
      return
    }

    try {
      setLoading(true)
      const b64 = await toBase64(file)
      setPhotoB64(b64)
      onImageChange?.(b64)
    } catch {
      alert("Failed to load image.")
    } finally {
      setLoading(false)
    }
  }

  const clearImage = () => {
    setPhotoB64(null)
    onImageChange?.(null)
    onDelete?.()
  }

  const handleGetData = () => {
    console.log("ETDApplicationPhotoCard handleGetData called with citizen:", citizen)
    // Validate citizen ID format (13 digits)
    if (!/^\d{13}$/.test(citizen)) {
      alert("Please enter a valid 13-digit citizen ID")
      return
    }
    console.log("Calling onGetData with citizen:", citizen)
    onGetData?.(citizen)
  }

  const imgSrc =
    photoB64 && photoB64.trim().length > 0
      ? `data:image/jpeg;base64,${photoB64}`
      : "/avatar.png" 

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-center text-2xl font-bold">{title}</CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Photo */}
        <div className="flex w-full justify-center">
          <div
            className="rounded-md border bg-white"
            style={{ width: imgWidth, height: imgHeight }}
          >
            <Image
              src={imgSrc}
              alt="Applicant Photo"
              width={imgWidth}
              height={imgHeight}
              className="h-full w-full object-cover select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex w-full justify-center gap-2">
          <Button type="button" onClick={openPicker} disabled={loading}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {loading ? "Uploading..." : "Upload New"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={clearImage}
            disabled={loading || !photoB64}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <input
            ref={fileRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files)}
          />
        </div>

        {/* Citizen Number */}
        <div className="mt-6">
          <Label htmlFor="citizen-number" className="text-sm">
            Citizen Number
          </Label>
          <Input
            id="citizen-number"
            placeholder="Enter 13-digit citizen ID"
            value={citizen}
            onChange={(e) => setCitizen(e.target.value)}
            maxLength={13}
            pattern="\d{13}"
            inputMode="numeric"
            className={cn(
              "mt-1 h-11 rounded-lg",
              "bg-white" // matches screenshot
            )}
          />
        </div>

        {/* Footer bar */}
        <div className="mt-8 -mb-2 -mx-6 border-t px-6 pt-4 flex justify-end">
          <Button 
            type="button" 
            onClick={handleGetData}
            disabled={!/^\d{13}$/.test(citizen)}
          >
            Get Data
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}