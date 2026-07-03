import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email/nodemailer"
import { z } from "zod"
import crypto from "crypto"

/*
 * Forgot Password API Route
 * ─────────────────────────────────────────────────────────────────────────────
 * Security decisions:
 *   - Always returns 200 to prevent email enumeration
 *   - Token is a 32-byte CSPRNG hex string, expires in 1 hour
 *   - Only credential-based accounts can reset (OAuth users have no password)
 */

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: parsed.error.errors,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Find user — only send reset for credential-based accounts
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    })

    if (user && user.password) {
      // Delete any existing reset token for this email
      await prisma.verificationToken.deleteMany({ where: { identifier: email } })

      // Generate a fresh token
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: resetToken,
          expires: resetTokenExpiry,
        },
      })

      // Send the reset email
      try {
        await sendPasswordResetEmail(email, resetToken)
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError)
      }
    }

    // Always respond with success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.errors,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    console.error("Forgot password error:", error)
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "An error occurred" },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
