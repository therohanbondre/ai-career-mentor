import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { parseJobDescription } from "@/lib/job/parser"

/*
 * POST /api/jobs/save
 * Parse and persist a job description. Optionally links an existing
 * analysis result (atsReportId) to the newly saved job.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      jobDescription,
      title,
      company,
      location,
      atsReportId, // optional – link analysis already performed
      matchScore,  // optional – pass through from /api/jobs/analyze
    } = body

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      )
    }
    if (jobDescription.length > 15_000) {
      return NextResponse.json(
        { error: "Job description is too long (max 15 000 characters)" },
        { status: 400 }
      )
    }

    // Parse job description with AI + regex fallback
    const parsed = await parseJobDescription(jobDescription)

    const job = await prisma.jobDescription.create({
      data: {
        userId:          session.user.id,
        title:           title           ?? parsed.title           ?? "Untitled Job",
        company:         company         ?? parsed.company         ?? "Unknown Company",
        location:        location        ?? parsed.location        ?? null,
        description:     jobDescription,
        requirements:    jobDescription,
        responsibilities: Array.isArray(parsed.responsibilities)
          ? parsed.responsibilities.join("\n")
          : jobDescription,
        skills:          Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
        status:          "ACTIVE",
        postedAt:        new Date(),
      },
    })

    // If the caller already ran /api/jobs/analyze, back-link the ATS report
    if (atsReportId) {
      await prisma.aTSReport.update({
        where: { id: atsReportId },
        data:  { jobDescriptionId: job.id },
      })
    }

    return NextResponse.json({
      success: true,
      job: {
        id:        job.id,
        title:     job.title,
        company:   job.company,
        location:  job.location,
        skills:    job.skills,
        status:    job.status,
        matchScore: matchScore ?? null,
        createdAt: job.createdAt,
        parsed,
      },
    })
  } catch (error) {
    console.error("Job save error:", error)
    return NextResponse.json(
      {
        error:   "Failed to save job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
