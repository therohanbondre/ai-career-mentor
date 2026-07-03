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
    const status = searchParams.get("status")
    const skip   = (page - 1) * limit

    const where: Record<string, any> = { userId: session.user.id }
    if (status) where.status = status

    const [sessions, total] = await Promise.all([
      prisma.interviewSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          answers: {
            select: { id: true, score: true, status: true, order: true },
            orderBy: { order: "asc" },
          },
        },
      }),
      prisma.interviewSession.count({ where }),
    ])

    const enriched = sessions.map((s) => {
      const evaluated = s.answers.filter((a) => a.status === "EVALUATED")
      const avgScore  = evaluated.length
        ? Math.round(evaluated.reduce((sum, a) => sum + (a.score ?? 0), 0) / evaluated.length)
        : null
      return {
        ...s,
        questionCount:    s.answers.length,
        answeredCount:    s.answers.filter((a) => a.status !== "PENDING").length,
        evaluatedCount:   evaluated.length,
        averageScore:     avgScore,
      }
    })

    return NextResponse.json({
      success: true,
      sessions: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Interviews list error:", error)
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 })
  }
}
