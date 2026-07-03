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
    const page       = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit      = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
    const difficulty = searchParams.get("difficulty") // BEGINNER | INTERMEDIATE | ADVANCED
    const category   = searchParams.get("category")
    const skip       = (page - 1) * limit

    const where: Record<string, any> = {}
    if (difficulty) where.difficulty = difficulty
    if (category)   where.category   = category

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ])

    // Fetch user's project status (from ProjectRecommendation)
    const userProjects = await prisma.projectRecommendation.findMany({
      where: { userId: session.user.id },
      select: { projectId: true, status: true, startedAt: true, completedAt: true, notes: true },
    })

    const projectMap = new Map(userProjects.map((p) => [p.projectId, p]))

    const enriched = projects.map((p) => {
      const userStatus = projectMap.get(p.id)
      return {
        ...p,
        userStatus: userStatus?.status ?? "RECOMMENDED",
        startedAt:  userStatus?.startedAt,
        completedAt: userStatus?.completedAt,
        notes:      userStatus?.notes,
      }
    })

    return NextResponse.json({
      success: true,
      projects: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Projects fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
