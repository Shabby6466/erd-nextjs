export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  role: UserRole
  agency?: string
  region?: string
  createdAt: string
  updatedAt: string
}

export type UserRole = 'ADMIN' | 'MINISTRY' | 'AGENCY' | 'MISSION_OPERATOR'

export interface Application {
  id: string
  status: ApplicationStatus
  citizenId: string
  firstName: string
  lastName: string
  image?: string
  fatherName: string
  motherName: string
  gender: string
  dateOfBirth: string
  birthCountry?: string
  birthCity?: string
  profession: string
  pakistanCity: string
  pakistanAddress: string
  height: string
  colorOfEyes: string
  colorOfHair: string
  departureDate: string
  securityDeposit: string
  investor: string
  requestedBy?: string
  reason_for_deport: string
  transportMode: string
  isFiaBlacklist?: boolean
  createdAt: string
  updatedAt: string
  submittedBy?: string
  reviewedBy?: string
  remarks?: string
  region?: Region
  assignedAgency?: string
  attachments?: ApplicationAttachment[]
  approvalHistory?: ApprovalHistory[]
  createdBy?: {
    id: string
    email: string
    fullName: string
    role: string
    state?: string
  }
  reviewedByUser?: {
    id: string
    email: string
    fullName: string
    role: string
  }
  // New verification fields
  pendingVerificationAgencies?: string[]
  verificationCompletedAgencies?: string[]
  agencyRemarks?: any[]
  rejectionReason?: string
  verificationSentAt?: string
  verificationCompletedAt?: string
}

export interface ApplicationAttachment {
  id: string
  applicationId: string
  fileName: string
  fileUrl: string
  fileType: string
  uploadedBy: string
  uploadedAt: string
}

export interface ApprovalHistory {
  id: string
  applicationId: string
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SENT_TO_AGENCY' | 'SENT_TO_MINISTRY' | 'BLACKLISTED'
  remarks?: string
  performedBy: string
  performedAt: string
}

export type ApplicationStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'UNDER_VERIFICATION'
  | 'PENDING_VERIFICATION'
  | 'VERIFICATION_SUBMITTED'
  | 'VERIFICATION_RECEIVED'
  | 'AGENCY_REVIEW'
  | 'MINISTRY_REVIEW'
  | 'APPROVED' 
  | 'REJECTED' 
  | 'COMPLETED'
  | 'BLACKLISTED'

export type Region = 'PUNJAB' | 'SINDH' | 'KPK' | 'BALOCHISTAN' | 'GILGIT_BALTISTAN' | 'AJK'

export interface ApplicationFilters {
  status?: ApplicationStatus
  search?: string
  dateFrom?: string
  dateTo?: string
  agency?: string
}

export interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  todayApplications: number
  weeklyApplications: number
  monthlyApplications: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface NadraData {
  citizenId: string
  firstName: string
  lastName: string
  fatherName: string
  motherName: string
  dateOfBirth: string
  nationality: string
  address: string
  city: string
}

export interface PassportData {
  passportNumber: string
  issueDate: string
  expiryDate: string
  issuingCountry: string
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface FormData {
  citizenId: string
  firstName: string
  lastName: string
  fatherName: string
  motherName: string
  dateOfBirth: string
  nationality: string
  profession: string
  pakistanCity: string
  pakistanAddress: string
  height: string
  colorOfEyes: string
  colorOfHair: string
  departureDate: string
  transportMode: string
  remarks?: string
}
