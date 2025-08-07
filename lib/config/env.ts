export const env = {
  // API Configuration
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3837/v1/api",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3837/v1/api",
  
  // NextAuth Configuration
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,
  
  // External APIs
  NADRA_API_URL: process.env.NADRA_API_URL,
  PASSPORT_API_URL: process.env.PASSPORT_API_URL,
}

export const isDevelopment = process.env.NODE_ENV === "development"
export const isProduction = process.env.NODE_ENV === "production"
