export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  agency?: string
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
  createdAt: string
  updatedAt: string
  submittedBy?: string
  reviewedBy?: string
  remarks?: string
}

export type ApplicationStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'COMPLETED'

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
