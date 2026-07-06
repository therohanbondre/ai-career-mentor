import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

/*
 * GET /api/recruiter/jobs/[id]/applicants
 * Returns applicants for a job, ranked by ATS / match score descending.
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

    // Verify ownership
    const job = await prisma.jobDescription.findFirst({
      where: {
        id: params.id,
        ...(session.user.role !== "ADMIN" ? { userId: session.user.id } : {}),
      },
    })
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

    const applications = await prisma.application.findMany({
      where: { jobDescriptionId: params.id },
      orderBy: [
        { matchScore: "desc" },
        { submittedAt: "desc" },
      ],
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                displayName: true,
                avatar: true,
                location: true,
                experienceLevel: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            title: true,
            atsScore: true,
            resumeScore: true,
            parsedData: true,
          },
        },
      },
    })

    const ranked = applications.map((app) => ({
      applicationId:    app.id,
      userId:           app.userId,
      candidateName:
        (app.user.profile?.displayName ??
         `${app.user.profile?.firstName ?? ""} ${app.user.profile?.lastName ?? ""}`.trim()) ||
        app.user.email,
      candidateEmail:   app.user.email,
      candidateAvatar:  app.user.profile?.avatar ?? null,
      resumeId:         app.resumeId,
      resumeTitle:      app.resume.title,
      atsScore:         app.resume.atsScore,
      matchScore:       app.matchScore,
      applicationStatus: app.status,
      submittedAt:      app.submittedAt,
      location:         app.user.profile?.location ?? null,
      experienceLevel:  app.user.profile?.experienceLevel ?? null,
      skills:           (app.resume.parsedData as any)?.skills ?? [],
    }))

    return NextResponse.json({ success: true, applicants: ranked, total: ranked.length })
  } catch (error) {
    console.error("Applicants fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch applicants" }, { status: 500 })
  }
}
