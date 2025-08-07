import { NextRequest, NextResponse } from "next/server"
import { getAuthUser, isPublicRoute, hasAccess } from "@/lib/auth/auth-utils"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const user = await getAuthUser(request)

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (!hasAccess(user.role, pathname)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
