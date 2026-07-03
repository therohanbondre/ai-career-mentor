import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await prisma.notification.updateMany({
      where: { userId: session.user.id, status: "UNREAD" },
      data:  { status: "READ", readAt: new Date() },
    })

    return NextResponse.json({ success: true, updated: result.count })
  } catch (error) {
    console.error("Mark all read error:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
