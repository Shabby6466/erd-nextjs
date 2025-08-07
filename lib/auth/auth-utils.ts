import { NextRequest } from 'next/server'
import { verifyJWT, JWTPayload } from './jwt'

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = getTokenFromCookies(request) || getTokenFromHeader(request)
  
  if (!token) {
    return null
  }

  return await verifyJWT(token)
}

export function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null
}

export function getTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ['/login', '/', '/api/auth']
  return publicRoutes.some(route => pathname.startsWith(route))
}

export function hasAccess(userRole: string, pathname: string): boolean {
  const roleRoutes: Record<string, string[]> = {
    '/admin': ['ADMIN'],
    '/agency': ['AGENCY'],
    '/ministry': ['MINISTRY'], 
    '/mission': ['MISSION_OPERATOR'],
    '/applications': ['ADMIN', 'AGENCY', 'MINISTRY', 'MISSION_OPERATOR']
  }

  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole)
    }
  }

  return true
}