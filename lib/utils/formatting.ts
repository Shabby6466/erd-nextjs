import { format, parseISO } from "date-fns"

export function formatCNIC(cnic: string): string {
  const cleaned = cnic.replace(/\D/g, "")
  if (cleaned.length === 13) {
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 12)}-${cleaned.substring(12)}`
  }
  return cnic
}

export function validateCNIC(cnic: string): boolean {
  const numericCnic = cnic.replace(/-/g, "")
  return numericCnic.length === 13 && /^\d+$/.test(numericCnic)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, "dd/MM/yyyy")
  } catch {
    return dateString
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, "dd/MM/yyyy HH:mm")
  } catch {
    return dateString
  }
}

export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    UNDER_VERIFICATION: "Under Verification",
    VERIFICATION_SUBMITTED: "Verification Submitted",
    AGENCY_REVIEW: "Agency Review",
    MINISTRY_REVIEW: "Ministry Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    COMPLETED: "Completed",
    BLACKLISTED: "Blacklisted",
  }
  return statusMap[status] || status
}

export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "outline",
    SUBMITTED: "secondary",
    UNDER_REVIEW: "default",
    UNDER_VERIFICATION: "secondary",
    VERIFICATION_SUBMITTED: "default",
    AGENCY_REVIEW: "default",
    MINISTRY_REVIEW: "default",
    APPROVED: "default",
    REJECTED: "destructive",
    COMPLETED: "default",
    BLACKLISTED: "destructive",
  }
  return variantMap[status] || "outline"
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function parseURLParams(): Record<string, string> {
  if (typeof window === "undefined") return {}
  
  const params = new URLSearchParams(window.location.search)
  const result: Record<string, string> = {}
  
  for (const [key, value] of params.entries()) {
    result[key] = value
  }
  
  return result
}
