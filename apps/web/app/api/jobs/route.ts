import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

/*
 * GET /api/jobs
 * List the authenticated user's saved job descriptions with pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page      = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit     = Math.min(50, parseInt(searchParams.get("limit") ?? "10"))
    const status    = searchParams.get("status")   // ACTIVE | DRAFT | ARCHIVED
    const sortBy    = searchParams.get("sortBy")   ?? "createdAt"
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc"
    const skip      = (page - 1) * limit

    const where: Record<string, unknown> = { userId: session.user.id }
    if (status) where.status = status

    const allowedSorts = ["createdAt", "updatedAt", "title", "company"]
    const orderField   = allowedSorts.includes(sortBy) ? sortBy : "createdAt"

    const [jobs, total] = await Promise.all([
      prisma.jobDescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
        select: {
          id:              true,
          title:           true,
          company:         true,
          location:        true,
          skills:          true,
          status:          true,
          employmentType:  true,
          experienceLevel: true,
          remote:          true,
          salaryRange:     true,
          postedAt:        true,
          createdAt:       true,
          updatedAt:       true,
          // Pull the latest ATSReport that was linked to this job
          atsReports: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { overallScore: true, createdAt: true },
          },
        },
      }),
      prisma.jobDescription.count({ where }),
    ])

    // Flatten the latest match score onto each job
    const jobsWithScore = jobs.map((j) => ({
      ...j,
      matchScore:    j.atsReports[0]?.overallScore ?? null,
      lastAnalyzed:  j.atsReports[0]?.createdAt    ?? null,
      atsReports:    undefined,
    }))

    return NextResponse.json({
      success: true,
      jobs: jobsWithScore,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Jobs list error:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
