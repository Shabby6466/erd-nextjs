import { z } from "zod"

export const citizenSchema = z.object({
  title:z.string(),
  citizen_id: z
    .string({ invalid_type_error: "citizen_id must be a 13-digit number string", required_error: "citizen_id must be a 13-digit number string" })
    .length(13, "citizen_id must be exactly 13 digits")
    .refine((value) => /^\d{13}$/.test(value), "citizen_id must be a 13-digit number string"),
  first_name: z.string().min(1, "First name is required").max(50, "First name too long"),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  image: z.string().min(1, "Image is required"),
  father_name: z.string().min(1, "Father's name is required").max(100, "Father's name too long"),
  mother_name: z.string().min(1, "Mother's name is required").max(100, "Mother's name too long"),
  gender: z.string().min(1, "Gender is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  // nationality: z.string().min(1, "Nationality is required"),
  profession: z.string().min(1, "Profession is required"),
  pakistan_city: z.string().min(1, "City is required"),
  pakistan_address: z.string().min(1, "Address is required").max(200, "Address too long"),
  birth_country: z.string({ required_error: "birth_country should not be empty", invalid_type_error: "birth_country must be a string" }).min(1, "birth_country should not be empty"),
  birth_city: z.string({ required_error: "birth_city should not be empty", invalid_type_error: "birth_city must be a string" }).min(1, "birth_city should not be empty"),
  height: z.string().optional(),
  color_of_eyes: z.string().optional(),
  color_of_hair: z.string().optional(),
  departure_date: z.string().min(1,"departure date is required"),
  transport_mode: z.string().optional(),
  requested_by: z.string({ required_error: "requested_by should not be empty", invalid_type_error: "requested_by must be a string" }).min(1, "requested_by should not be empty"),
  reason_for_deport: z.string({invalid_type_error: "reason_for_deport must be a string" }).optional(),
  amount: z
    .coerce.number({ invalid_type_error: "amount must be a number conforming to the specified constraints" })
    .optional(),
  currency: z.string({ invalid_type_error: "currency must be a string" }).optional(),
  is_fia_blacklist: z.coerce.boolean().default(false),
  status: z.string().optional().default("DRAFT"),
  investor:z.string().optional(),
  securityDeposit:z.string().optional()
})

export type CitizenFormData = z.infer<typeof citizenSchema>
