import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email/nodemailer"
import { z } from "zod"

/*
 * Resend Email Verification Route
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/auth/resend-verification
 * Body: { email: string }
 *
 * Always returns 200 to prevent email enumeration.
 * Deletes any existing token for this address before creating a fresh one.
 */

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid email" } },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    })

    // Only resend for users that exist and are still PENDING
    if (user && user.status === "PENDING" && !user.emailVerified) {
      // Remove any old tokens for this email
      await prisma.verificationToken.deleteMany({ where: { identifier: email } })

      const token = crypto.randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      })

      try {
        await sendVerificationEmail(
          email,
          token,
          user.profile?.firstName ?? undefined
        )
      } catch (emailError) {
        console.error("Resend verification email error:", emailError)
      }
    }

    // Always return success
    return NextResponse.json({
      success: true,
      message: "If your account is pending verification, a new link has been sent.",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "An error occurred" } },
      { status: 500 }
    )
  }
}
