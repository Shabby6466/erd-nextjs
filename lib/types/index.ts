export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  agency?: string
  region?: string
  createdAt: string
  updatedAt: string
}

export type UserRole = 'ADMIN' | 'MINISTRY' | 'AGENCY' | 'MISSION_OPERATOR'

export interface Processing {
  tracking_id: string
  type: string
  country_code: string
  nationality: string
  mrz_line1: string | null
  mrz_line2: string | null
  document_no: string | null
  status: string
  sheet_no: string | null
  print_time_stamp: string | null
  print_user_id: string | null
  qc_time_stamp: string | null
  active: boolean
}

export interface QcFailure {
  id: string
  sheet_no: string
  user_id: string
  application_id: string
  qc_timestamp: string
  failure_reason: string
  created_at: string
  updated_at: string
}

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
  verificationRemarks?: any[]
  rejectionReason?: string
  verificationSentAt?: string
  verificationCompletedAt?: string
  verificationDocumentUrl?: string
  // ETD fields
  etdIssueDate?: string
  etdExpiryDate?: string
  blacklistCheckPassed?: boolean
  reviewedAt?: string
  // API data fields
  nadra_api_data?: any
  passport_api_data?: any
  // Processing fields
  processing?: Processing
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
  | 'READY_FOR_PERSONALIZATION'
  | 'READY_FOR_PRINT'
  | 'READY_FOR_QC'
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
