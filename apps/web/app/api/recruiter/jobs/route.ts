import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/*
 * GET  /api/recruiter/jobs  — list all jobs created by this recruiter
 * POST /api/recruiter/jobs  — create a new job posting
 */

// ─── Validation ────────────────────────────────────────────────────────────────
const createJobSchema = z.object({
  title:            z.string().min(2,  "Job title is required"),
  company:          z.string().min(1,  "Company is required"),
  description:      z.string().min(50, "Description must be at least 50 characters"),
  requirements:     z.string().min(20, "Requirements are required"),
  responsibilities: z.string().min(20, "Responsibilities are required"),
  benefits:         z.string().optional(),
  skills:           z.array(z.string()).default([]),
  location:         z.string().optional(),
  salaryRange:      z.string().optional(),
  employmentType:   z.enum(["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP","FREELANCE"]).optional(),
  experienceLevel:  z.enum(["ENTRY_LEVEL","JUNIOR","MID_LEVEL","SENIOR","LEAD","EXECUTIVE"]).optional(),
  remote:           z.boolean().default(false),
  status:           z.enum(["DRAFT","ACTIVE"]).default("DRAFT"),
  expiresAt:        z.string().optional(),
})

// ─── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
    const status = searchParams.get("status")
    const skip   = (page - 1) * limit

    const where: Record<string, any> = { userId: session.user.id }
    if (status) where.status = status

    const [jobs, total] = await Promise.all([
      prisma.jobDescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { applications: true } },
          applications: {
            select: { matchScore: true },
            where: { matchScore: { not: null } },
          },
        },
      }),
      prisma.jobDescription.count({ where }),
    ])

    const enriched = jobs.map((j) => {
      const scores = j.applications.map((a) => a.matchScore ?? 0)
      const avgScore = scores.length
        ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
        : null
      return {
        ...j,
        applications:    undefined,
        applicantCount:  j._count.applications,
        averageMatchScore: avgScore,
        _count:          undefined,
      }
    })

    return NextResponse.json({
      success: true,
      jobs: enriched,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Recruiter jobs list error:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

// ─── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body   = await req.json()
    const parsed = createJobSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const d = parsed.data

    const job = await prisma.jobDescription.create({
      data: {
        userId:          session.user.id,
        title:           d.title,
        company:         d.company,
        description:     d.description,
        requirements:    d.requirements,
        responsibilities: d.responsibilities,
        benefits:        d.benefits ?? null,
        skills:          d.skills,
        location:        d.location ?? null,
        salaryRange:     d.salaryRange ?? null,
        employmentType:  d.employmentType ?? null,
        experienceLevel: d.experienceLevel ?? null,
        remote:          d.remote,
        status:          d.status,
        postedAt:        d.status === "ACTIVE" ? new Date() : null,
        expiresAt:       d.expiresAt ? new Date(d.expiresAt) : null,
      },
    })

    return NextResponse.json({ success: true, job }, { status: 201 })
  } catch (error) {
    console.error("Create job error:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
