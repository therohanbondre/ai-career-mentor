import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { analyzeJobMatch, analyzeSkillGap } from "@/lib/ai/gemini"
import { extractTextFromFile } from "@/lib/resume/parser"
import { z } from "zod"
import {
  notifyJobMatchComplete,
  notifySkillGapComplete,
} from "@/lib/notifications/service"

/*
 * POST /api/jobs/analyze
 * Analyse a raw job description against the user's primary resume.
 * Steps:
 *   1. Resolve user's primary (or most-recent) resume
 *   2. Extract resume text
 *   3. Run analyzeJobMatch()  – overall / skill / exp / edu match scores
 *   4. Run analyzeSkillGap()  – present / missing / recommended skills
 *   5. Persist an ATSReport record  (optionally linked to a saved job)
 *   6. Return the full result
 */

const bodySchema = z.object({
  jobDescription: z.string().min(50, "Job description is too short"),
  jobDescriptionId: z.string().optional(), // link to a saved job if provided
  resumeId: z.string().optional(),         // override resume to use
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

    const { jobDescription, jobDescriptionId, resumeId } = parsed.data

    // ── 1. Resolve resume ────────────────────────────────────────────────────
    const resumeWhere = resumeId
      ? { id: resumeId, userId: session.user.id, status: "ACTIVE" as const }
      : { userId: session.user.id, isPrimary: true, status: "ACTIVE" as const }

    let resume = await prisma.resume.findFirst({ where: resumeWhere })

    // Fallback: most-recently uploaded active resume
    if (!resume) {
      resume = await prisma.resume.findFirst({
        where: { userId: session.user.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      })
    }

    if (!resume) {
      return NextResponse.json(
        { error: "No resume found. Please upload a resume first." },
        { status: 404 }
      )
    }

    // ── 2. Extract resume text ───────────────────────────────────────────────
    let resumeText: string
    if (resume.parsedData && typeof resume.parsedData === "object") {
      // Use already-parsed text if available (faster)
      resumeText = (resume.parsedData as any).rawText ?? ""
    } else {
      resumeText = ""
    }

    // If no cached text, read from file
    if (!resumeText && resume.filePath && resume.mimeType) {
      try {
        resumeText = await extractTextFromFile(resume.filePath, resume.mimeType)
      } catch {
        resumeText = ""
      }
    }

    if (!resumeText) {
      return NextResponse.json(
        { error: "Could not extract text from resume. Please re-upload or parse the resume first." },
        { status: 422 }
      )
    }

    // ── 3. Run AI analysis in parallel ──────────────────────────────────────
    const [jobMatchResult, skillGapResult] = await Promise.all([
      analyzeJobMatch(resumeText, jobDescription),
      analyzeSkillGap(
        (resume.parsedData as any)?.skills ?? [],
        "Software Developer", // default; will be refined once JD is parsed
        jobDescription
      ),
    ])

    // ── 4. Persist ATSReport ─────────────────────────────────────────────────
    const atsReport = await prisma.aTSReport.create({
      data: {
        resumeId:        resume.id,
        jobDescriptionId: jobDescriptionId ?? null,
        overallScore:    jobMatchResult.overallMatch,
        keywordScore:    jobMatchResult.skillMatch,
        formatScore:     resume.atsScore ?? 0, // reuse cached format score
        contentScore:    jobMatchResult.experienceMatch,
        readabilityScore: jobMatchResult.educationMatch,
        details: {
          matchedSkills:   jobMatchResult.matchedSkills,
          missingSkills:   jobMatchResult.missingSkills,
          recommendations: jobMatchResult.recommendations,
          summary:         jobMatchResult.summary,
        } as any,
        recommendations: jobMatchResult.recommendations as any,
      },
    })

    // ── 5. Persist SkillGap ──────────────────────────────────────────────────
    const skillGap = await prisma.skillGap.create({
      data: {
        userId:        session.user.id,
        resumeId:      resume.id,
        targetRole:    "Software Developer",
        presentSkills:  skillGapResult.presentSkills.map((s) => s.name),
        missingSkills:  skillGapResult.missingSkills as any,
        recommendedSkills: skillGapResult.recommendedSkills as any,
        analysisDetails: {
          learningPaths: skillGapResult.learningPaths,
          summary:       skillGapResult.summary,
        } as any,
      },
    })

    // ── 6. Fire notifications (non-blocking) ────────────────────────────────
    void Promise.all([
      notifyJobMatchComplete(
        session.user.id,
        jobDescriptionId ?? atsReport.id,
        jobDescription.slice(0, 60),
        "Company",
        jobMatchResult.overallMatch
      ),
      notifySkillGapComplete(
        session.user.id,
        skillGap.id,
        "Software Developer",
        jobMatchResult.missingSkills.length
      ),
    ])

    return NextResponse.json({
      success:     true,
      resumeUsed:  { id: resume.id, title: resume.title },
      jobMatch:    jobMatchResult,
      skillGap:    skillGapResult,
      atsReportId: atsReport.id,
      skillGapId:  skillGap.id,
    })
  } catch (error) {
    console.error("Job analyze error:", error)
    return NextResponse.json(
      {
        error:   "Failed to analyze job description",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
