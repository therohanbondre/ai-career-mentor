import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

/*
 * GET /api/recruiter/candidates/[id]
 * Full candidate profile — only accessible to RECRUITER/ADMIN.
 * Returns public career data: profile, resumes (no file content), applications to this recruiter's jobs.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const candidate = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id:    true,
        email: true,
        profile: {
          select: {
            firstName:      true,
            lastName:       true,
            displayName:    true,
            avatar:         true,
            bio:            true,
            location:       true,
            linkedinUrl:    true,
            githubUrl:      true,
            experienceLevel: true,
            targetRole:     true,
          },
        },
        resumes: {
          where:   { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          select: {
            id:          true,
            title:       true,
            atsScore:    true,
            resumeScore: true,
            analyzedAt:  true,
            createdAt:   true,
            parsedData:  true,
          },
        },
        applications: {
          orderBy: { submittedAt: "desc" },
          select: {
            id:              true,
            jobDescriptionId: true,
            status:          true,
            matchScore:      true,
            submittedAt:     true,
            jobDescription: {
              select: { title: true, company: true, userId: true },
            },
          },
        },
      },
    })

    if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 })

    // Filter applications: only show applications to this recruiter's jobs (privacy)
    const myJobIds = new Set(
      candidate.applications
        .filter((a) => a.jobDescription.userId === session.user.id)
        .map((a) => a.jobDescriptionId)
    )

    const safeApplications = session.user.role === "ADMIN"
      ? candidate.applications
      : candidate.applications.filter((a) => myJobIds.has(a.jobDescriptionId))

    return NextResponse.json({
      success: true,
      candidate: {
        ...candidate,
        applications: safeApplications,
      },
    })
  } catch (error) {
    console.error("Candidate fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 })
  }
}
