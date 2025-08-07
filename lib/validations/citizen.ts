import { z } from "zod"

export const citizenSchema = z.object({
  citizen_id: z
    .string()
    .min(1, "CNIC is required")
    .refine((value) => {
      const numericCnic = value.replace(/-/g, "")
      return numericCnic.length === 13 && /^\d+$/.test(numericCnic)
    }, "Please enter a valid 13-digit CNIC"),
  first_name: z.string().min(1, "First name is required").max(50, "First name too long"),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  father_name: z.string().min(1, "Father's name is required").max(100, "Father's name too long"),
  mother_name: z.string().min(1, "Mother's name is required").max(100, "Mother's name too long"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  profession: z.string().min(1, "Profession is required"),
  pakistan_city: z.string().min(1, "City is required"),
  pakistan_address: z.string().min(1, "Address is required").max(200, "Address too long"),
  height: z.string().min(1, "Height is required"),
  color_of_eyes: z.string().min(1, "Eye color is required"),
  color_of_hair: z.string().min(1, "Hair color is required"),
  departure_date: z.string().min(1, "Departure date is required"),
  transport_mode: z.string().min(1, "Transport mode is required"),
})

export type CitizenFormData = z.infer<typeof citizenSchema>
