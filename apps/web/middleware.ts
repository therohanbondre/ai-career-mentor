/*
 * Edge Middleware — Route Protection & RBAC
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT: This file runs on the EDGE RUNTIME — not Node.js.
 *
 * We import `auth` from lib/auth/middleware-auth (NOT lib/auth/config).
 * lib/auth/config imports PrismaClient + bcrypt which are Node.js-only and
 * crash the Edge Runtime with "does not support Node.js 'net' module".
 *
 * lib/auth/middleware-auth is a minimal NextAuth instance that only reads
 * the JWT cookie — zero Node.js module usage, fully edge-compatible.
 */
import { auth } from "@/lib/auth/middleware-auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const user       = req.auth?.user
  const { pathname } = req.nextUrl

  // ── Public routes — no auth required ──────────────────────────────────────
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

  const isPublicRoute    = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))
  const isPublicApiRoute = publicApiRoutes.some((r) => pathname.startsWith(r))

  if (isPublicRoute || isPublicApiRoute) {
    // Redirect already-authenticated users away from login/register
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
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

  // ── Account status gate ────────────────────────────────────────────────────
  // JWT carries `status` stamped at sign-in (see lib/auth/config.ts jwt callback)
  const status = user?.status as string | undefined

  if (status === "PENDING") {
    return NextResponse.redirect(new URL("/auth/verify-notice", req.url))
  }

  if (status === "SUSPENDED" || status === "DELETED") {
    return NextResponse.redirect(new URL("/auth/account-suspended", req.url))
  }

  // ── RBAC ───────────────────────────────────────────────────────────────────
  const role = user?.role as string | undefined

  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (
    pathname.startsWith("/dashboard/recruiter") &&
    role !== "RECRUITER" &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (
    pathname.startsWith("/dashboard/student") &&
    role !== "STUDENT" &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // ── API RBAC ───────────────────────────────────────────────────────────────
  if (pathname.startsWith("/api/admin") && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (
    pathname.startsWith("/api/recruiter") &&
    role !== "RECRUITER" &&
    role !== "ADMIN"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Exclude Next.js internals, static files, auth API, and public assets
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf)).*)",
  ],
}
