import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email/nodemailer"
import { z } from "zod"

/*
 * Signup API Route
 * ─────────────────────────────────────────────────────────────────────────────
 * Security decisions:
 *   - bcrypt cost factor 12 (good balance of speed vs. brute-force resistance)
 *   - Zod validates all input before touching the DB
 *   - Duplicate email check returns a clear 400 (acceptable — not a login form)
 *   - New users start PENDING; account becomes ACTIVE only after email verification
 *   - Verification token is a 32-byte CSPRNG hex string, expires in 24 hours
 */

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ── Validate ──────────────────────────────────────────────────────────────
    const parsed = signupSchema.safeParse(body)
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

    const { email, password, firstName, lastName } = parsed.data

    // ── Duplicate check ───────────────────────────────────────────────────────
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "An account with this email already exists",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // ── Hash password ─────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12)

    // ── Create user + profile ─────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "STUDENT",
        status: "PENDING", // activated after email verification
        profile: {
          create: {
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
          },
        },
      },
    })

    // ── Email verification token ──────────────────────────────────────────────
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 h

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    })

    // ── Send verification email ───────────────────────────────────────────────
    try {
      await sendVerificationEmail(
        email,
        verificationToken,
        user.profile?.firstName ?? undefined
      )
    } catch (emailError) {
      // Non-fatal: user is created; they can request a resend later
      console.error("Failed to send verification email:", emailError)
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.profile?.displayName,
          },
          message:
            "Account created successfully. Please check your email to verify your account.",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred during registration",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
