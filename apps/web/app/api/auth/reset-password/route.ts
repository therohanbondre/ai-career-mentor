import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

/* 
 * Architectural Decision: Reset Password API Route
 * - Validates reset token
 * - Updates password with new hash
 * - Invalidates reset token after use
 * - Security: Token expiration check
 */

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  ),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input
    const { token, password } = resetPasswordSchema.parse(body)

    // Find valid verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired reset token",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // Check token expiration
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      })
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EXPIRED_TOKEN",
            message: "Reset token has expired",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Password has been reset successfully",
        timestamp: new Date().toISOString(),
      }
    )
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

    console.error("Reset password error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
