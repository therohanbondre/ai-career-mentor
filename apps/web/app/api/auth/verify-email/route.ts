import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/*
 * Email Verification API Route
 * ─────────────────────────────────────────────────────────────────────────────
 * Called when the user clicks the link in their verification email:
 *   GET /api/auth/verify-email?token=<hex>
 *
 * On success  → sets user.status = ACTIVE, deletes the token, redirects to /login
 * On failure  → redirects to /auth/error with a descriptive code
 */

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/error?error=MissingToken", req.url)
    )
  }

  try {
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/auth/error?error=InvalidToken", req.url)
      )
    }

    // Check expiry
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } })
      return NextResponse.redirect(
        new URL("/auth/error?error=ExpiredToken", req.url)
      )
    }

    // Activate the user account
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: {
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    })

    // Delete the used token
    await prisma.verificationToken.delete({ where: { token } })

    // Redirect to login with a success flag
    return NextResponse.redirect(
      new URL("/login?verified=true", req.url)
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(
      new URL("/auth/error?error=VerificationFailed", req.url)
    )
  }
}
