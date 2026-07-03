import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
    const status = searchParams.get("status") // DRAFT | ACTIVE | PAUSED | COMPLETED | ARCHIVED
    const skip   = (page - 1) * limit

    const where: Record<string, any> = { userId: session.user.id }
    if (status) where.status = status

    const [roadmaps, total] = await Promise.all([
      prisma.roadmap.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id:          true,
          title:       true,
          targetRole:  true,
          duration:    true,
          progress:    true,
          status:      true,
          startedAt:   true,
          completedAt: true,
          createdAt:   true,
          updatedAt:   true,
          modules:     true,
        },
      }),
      prisma.roadmap.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      roadmaps,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Roadmaps fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch roadmaps" }, { status: 500 })
  }
}
