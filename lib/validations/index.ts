import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const citizenSchema = z.object({
  citizenId: z.string()
    .min(13, 'CNIC must be 13 digits')
    .max(15, 'CNIC must be 13 digits')
    .refine((val) => /^\d{5}-\d{7}-\d$/.test(val) || /^\d{13}$/.test(val), {
      message: 'Please enter a valid CNIC format (XXXXX-XXXXXXX-X)'
    }),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  fatherName: z.string().min(2, 'Father name must be at least 2 characters'),
  motherName: z.string().min(2, 'Mother name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  nationality: z.string().min(2, 'Nationality must be at least 2 characters'),
  profession: z.string().min(2, 'Profession must be at least 2 characters'),
  pakistanCity: z.string().min(2, 'City must be at least 2 characters'),
  pakistanAddress: z.string().min(10, 'Address must be at least 10 characters'),
  height: z.string().min(1, 'Height is required'),
  colorOfEyes: z.string().min(1, 'Eye color is required'),
  colorOfHair: z.string().min(1, 'Hair color is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  transportMode: z.string().min(1, 'Transport mode is required'),
  remarks: z.string().optional()
})

export const applicationSchema = z.object({
  id: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED']),
  ...citizenSchema.shape,
  submittedBy: z.string().optional(),
  reviewedBy: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const sendForVerificationSchema = z.object({
  agencies: z.array(z.string()).min(1, 'At least one agency must be selected'),
  verification_document: z.instanceof(File, { message: 'Verification document is required' }),
  remarks: z.string().optional()
})

export const submitVerificationSchema = z.object({
  remarks: z.string().min(1, 'Remarks are required'),
  attachment: z.instanceof(File).optional()
})

export const applicationFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED']).optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  agency: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
})

export const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'MINISTRY', 'AGENCY', 'MISSION_OPERATOR']),
  agency: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional()
})

export type LoginFormData = z.infer<typeof loginSchema>
export type CitizenFormData = z.infer<typeof citizenSchema>
export type ApplicationFormData = z.infer<typeof applicationSchema>
export type ApplicationFiltersData = z.infer<typeof applicationFiltersSchema>
export type UserFormData = z.infer<typeof userSchema>
