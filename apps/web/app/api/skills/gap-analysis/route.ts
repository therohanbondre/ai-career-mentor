import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { analyzeSkillGap } from "@/lib/ai/gemini"
import { z } from "zod"
import { notifySkillGapComplete } from "@/lib/notifications/service"

/*
 * POST /api/skills/gap-analysis
 * Run a standalone skill gap analysis (not tied to a specific JD).
 * Expects either an explicit skills array or resolves from the primary resume.
 */

const bodySchema = z.object({
  targetRole:  z.string().min(2, "Target role is required"),
  skills:      z.array(z.string()).optional(),
  resumeId:    z.string().optional(),
  jobDescription: z.string().optional(),
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

    const { targetRole, skills: explicitSkills, resumeId, jobDescription } = parsed.data

    // ── Resolve skills ───────────────────────────────────────────────────────
    let presentSkills: string[] = explicitSkills ?? []

    if (!presentSkills.length) {
      const resumeWhere = resumeId
        ? { id: resumeId, userId: session.user.id }
        : { userId: session.user.id, isPrimary: true, status: "ACTIVE" as const }

      const resume = await prisma.resume.findFirst({ where: resumeWhere })
      if (resume?.parsedData) {
        presentSkills = (resume.parsedData as any)?.skills ?? []
      }
    }

    if (!presentSkills.length) {
      return NextResponse.json(
        { error: "No skills found. Please upload and parse your resume first, or provide a skills list." },
        { status: 422 }
      )
    }

    // ── AI analysis ──────────────────────────────────────────────────────────
    const result = await analyzeSkillGap(presentSkills, targetRole, jobDescription)

    // ── Persist ──────────────────────────────────────────────────────────────
    const skillGap = await prisma.skillGap.create({
      data: {
        userId:        session.user.id,
        targetRole,
        presentSkills,
        missingSkills:    result.missingSkills    as any,
        recommendedSkills: result.recommendedSkills as any,
        analysisDetails: {
          learningPaths: result.learningPaths,
          summary:       result.summary,
        } as any,
      },
    })

    // Notify user (non-blocking)
    void notifySkillGapComplete(
      session.user.id,
      skillGap.id,
      targetRole,
      Array.isArray(result.missingSkills) ? result.missingSkills.length : 0
    )

    return NextResponse.json({
      success:    true,
      skillGapId: skillGap.id,
      targetRole,
      result,
    })
  } catch (error) {
    console.error("Skill gap analysis error:", error)
    return NextResponse.json(
      {
        error:   "Failed to perform skill gap analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
