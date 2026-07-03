import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { generateCoverLetter } from "@/lib/ai/gemini"
import { z } from "zod"

const bodySchema = z.object({
  jobTitle:        z.string().min(2, "Job title is required"),
  company:         z.string().min(1, "Company is required"),
  jobDescription:  z.string().min(50, "Job description too short"),
  tone:            z.enum(["PROFESSIONAL", "CONVERSATIONAL", "ENTHUSIASTIC", "FORMAL"]).default("PROFESSIONAL"),
  resumeId:        z.string().optional(),
  jobDescriptionId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const { jobTitle, company, jobDescription, tone, resumeId, jobDescriptionId } = parsed.data

    // ── Resolve resume data ───────────────────────────────────────────────────
    const resumeWhere = resumeId
      ? { id: resumeId, userId: session.user.id }
      : { userId: session.user.id, isPrimary: true, status: "ACTIVE" as const }

    let resume = await prisma.resume.findFirst({ where: resumeWhere })
    if (!resume) {
      resume = await prisma.resume.findFirst({
        where:   { userId: session.user.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      })
    }

    if (!resume) {
      return NextResponse.json(
        { error: "No resume found. Please upload a resume first." },
        { status: 404 }
      )
    }

    // Extract structured data from parsedData
    const pd = (resume.parsedData as any) ?? {}
    const resumeData = {
      name:         pd.name         ?? session.user.name ?? "Candidate",
      skills:       pd.skills       ?? [],
      experience:   Array.isArray(pd.experience)
        ? pd.experience.map((e: any) => `${e.position ?? ""} at ${e.company ?? ""}`).join("; ")
        : pd.experience ?? "",
      education:    Array.isArray(pd.education)
        ? pd.education.map((e: any) => `${e.degree ?? ""} from ${e.institution ?? ""}`).join("; ")
        : pd.education ?? "",
      achievements: pd.achievements ?? [],
    }

    // ── Generate with AI ──────────────────────────────────────────────────────
    const result = await generateCoverLetter(resumeData, jobDescription, jobTitle, company, tone)

    // ── Persist ───────────────────────────────────────────────────────────────
    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId:          session.user.id,
        resumeId:        resume.id,
        jobDescriptionId: jobDescriptionId ?? null,
        title:           `${jobTitle} at ${company}`,
        jobTitle,
        company,
        tone,
        content:         result.content,
        wordCount:       result.wordCount,
        status:          "DRAFT",
        aiGenerated:     true,
      },
    })

    return NextResponse.json({
      success:     true,
      coverLetter: { ...coverLetter, highlights: result.highlights, subject: result.subject },
    })
  } catch (error) {
    console.error("Cover letter generate error:", error)
    return NextResponse.json(
      { error: "Failed to generate cover letter", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    )
  }
}
