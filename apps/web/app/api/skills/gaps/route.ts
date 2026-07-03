import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

/*
 * GET /api/skills/gaps
 * Fetch the authenticated user's skill gap history.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10"))
    const skip  = (page - 1) * limit

    const [skillGaps, total] = await Promise.all([
      prisma.skillGap.findMany({
        where:   { userId: session.user.id },
        skip,
        take:    limit,
        orderBy: { createdAt: "desc" },
        select: {
          id:               true,
          targetRole:       true,
          presentSkills:    true,
          missingSkills:    true,
          recommendedSkills: true,
          analysisDetails:  true,
          createdAt:        true,
          updatedAt:        true,
        },
      }),
      prisma.skillGap.count({ where: { userId: session.user.id } }),
    ])

    return NextResponse.json({
      success:    true,
      skillGaps,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Skill gaps fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch skill gaps" }, { status: 500 })
  }
}
