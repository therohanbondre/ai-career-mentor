import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bodySchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING", "DELETED"]).optional(),
  role:   z.enum(["STUDENT", "RECRUITER", "ADMIN"]).optional(),
})

/*
 * PATCH /api/admin/users/[id]
 * Change a user's status (suspend/activate) or role.
 * Admin cannot change their own role to prevent lockout.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Prevent self-modification
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot modify your own account via the admin panel." },
        { status: 422 }
      )
    }

    const body   = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.errors },
        { status: 400 }
      )
    }

    if (!parsed.data.status && !parsed.data.role) {
      return NextResponse.json(
        { error: "Provide at least one of: status, role" },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data:  {
        ...(parsed.data.status && { status: parsed.data.status }),
        ...(parsed.data.role   && { role:   parsed.data.role   }),
      },
      select: {
        id:     true,
        email:  true,
        role:   true,
        status: true,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
