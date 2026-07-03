import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bodySchema = z.object({
  status: z.enum(["READ", "ARCHIVED", "UNREAD"]),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body   = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = { status: parsed.data.status }
    if (parsed.data.status === "READ") {
      updateData.readAt = new Date()
    }

    const notification = await prisma.notification.update({
      where: { id: params.id, userId: session.user.id },
      data:  updateData,
    })

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error("Notification update error:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.notification.delete({
      where: { id: params.id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification delete error:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
