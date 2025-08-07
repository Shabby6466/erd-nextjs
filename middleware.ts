import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Public routes
    if (pathname.startsWith("/login") || pathname === "/") {
      return NextResponse.next()
    }

    // Role-based access control
    const roleRoutes = {
      "/admin": ["ADMIN"],
      "/agency": ["AGENCY", "ADMIN"],
      "/ministry": ["MINISTRY", "ADMIN"],
      "/hq": ["ADMIN"],
    }

    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
