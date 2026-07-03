import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

/*
 * GET /api/admin/ai-usage
 * Recent AI log entries with model, latency, status, and calling user.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "20"))
    const type   = searchParams.get("type")
    const status = searchParams.get("status")
    const skip   = (page - 1) * limit

    const where: Record<string, any> = {}
    if (type)   where.type   = type
    if (status) where.status = status

    const [logs, total] = await Promise.all([
      prisma.aILog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id:         true,
          userId:     true,
          type:       true,
          status:     true,
          tokensUsed: true,
          latency:    true,
          model:      true,
          error:      true,
          createdAt:  true,
          user: {
            select: { email: true },
          },
        },
      }),
      prisma.aILog.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Admin AI usage error:", error)
    return NextResponse.json({ error: "Failed to fetch AI usage" }, { status: 500 })
  }
}
