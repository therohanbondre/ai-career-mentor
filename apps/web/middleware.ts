import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"

/*
 * Edge Middleware — Route Protection & RBAC
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs on every request except static assets and the Next.js internals.
 *
 * M0 fix: PENDING users (email not yet verified) are now redirected to
 * /auth/verify-notice instead of /auth/account-suspended, so they get a
 * clear message with a "resend email" option rather than a dead end.
 */

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const user = req.auth?.user
  const { pathname } = req.nextUrl

  // ── Public routes ─────────────────────────────────────────────────────────
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/error",
    "/auth/verify-request",
    "/auth/verify-notice",
    "/auth/account-suspended",
  ]

  const publicApiRoutes = [
    "/api/auth/signup",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/auth/verify-email",
    "/api/auth/resend-verification",
  ]

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )
  const isPublicApiRoute = publicApiRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Allow public routes through
  if (isPublicRoute || isPublicApiRoute) {
    // Authenticated users don't need to see login/register pages
    if (
      isLoggedIn &&
      (pathname === "/login" || pathname === "/register")
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // ── Require authentication ─────────────────────────────────────────────────
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Account status checks ─────────────────────────────────────────────────
  const status = (user as any)?.status

  if (status === "PENDING") {
    // Email not yet verified — show verification notice page
    return NextResponse.redirect(new URL("/auth/verify-notice", req.url))
  }

  if (status === "SUSPENDED" || status === "DELETED") {
    return NextResponse.redirect(new URL("/auth/account-suspended", req.url))
  }

  // From here on the user is ACTIVE ─────────────────────────────────────────

  // ── Role-based access control ──────────────────────────────────────────────
  const role = (user as any)?.role

  // Admin-only pages
  if (pathname.startsWith("/dashboard/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Recruiter pages (also accessible by ADMIN)
  if (pathname.startsWith("/dashboard/recruiter")) {
    if (role !== "RECRUITER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Student pages (also accessible by ADMIN)
  if (pathname.startsWith("/dashboard/student")) {
    if (role !== "STUDENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // ── API RBAC ───────────────────────────────────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  if (pathname.startsWith("/api/recruiter")) {
    if (role !== "RECRUITER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *   - Next.js internals (_next/static, _next/image)
     *   - Public assets (favicon.ico, robots.txt, images, fonts)
     *   - NextAuth internal routes (/api/auth/*)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf)).*)",
  ],
}
