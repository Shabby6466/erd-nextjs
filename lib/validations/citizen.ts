import { z } from "zod"

export const citizenSchema = z.object({
  citizen_id: z
    .string({ invalid_type_error: "citizen_id must be a 13-digit number string", required_error: "citizen_id must be a 13-digit number string" })
    .length(13, "citizen_id must be exactly 13 digits")
    .refine((value) => /^\d{13}$/.test(value), "citizen_id must be a 13-digit number string"),
  first_name: z.string().min(1, "First name is required").max(50, "First name too long"),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name too long"),
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
  height: z.string(),
  color_of_eyes: z.string().min(1, "Eye color is required"),
  color_of_hair: z.string().min(1, "Hair color is required"),
  departure_date: z.string().min(1, "Departure date is required"),
  transport_mode: z.string().min(1, "Transport mode is required"),
  requested_by: z.string({ required_error: "requested_by should not be empty", invalid_type_error: "requested_by must be a string" }).min(1, "requested_by should not be empty"),
  reason_for_deport: z.string({ required_error: "reason_for_deport should not be empty", invalid_type_error: "reason_for_deport must be a string" }).min(1, "reason_for_deport should not be empty"),
  amount: z
    .coerce.number({ invalid_type_error: "amount must be a number conforming to the specified constraints" })
    .min(0, "amount must be a number conforming to the specified constraints"),
  currency: z.string({ required_error: "currency should not be empty", invalid_type_error: "currency must be a string" }).min(1, "currency should not be empty"),
  is_fia_blacklist: z.coerce.boolean().default(false),
  status: z.string().optional().default("DRAFT"),
  investor:z.string().min(1, "Investor is required"),
  securityDeposit:z.string()
})

export type CitizenFormData = z.infer<typeof citizenSchema>
