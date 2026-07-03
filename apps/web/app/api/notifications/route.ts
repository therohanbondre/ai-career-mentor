import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

/*
 * GET /api/notifications
 * Returns paginated notifications for the current user plus an unread count.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
    const status = searchParams.get("status") // UNREAD | READ | ARCHIVED
    const type   = searchParams.get("type")   // NotificationType filter
    const skip   = (page - 1) * limit

    const where: Record<string, any> = { userId: session.user.id }
    if (status) where.status = status
    if (type)   where.type   = type

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.user.id, status: "UNREAD" },
      }),
    ])

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
