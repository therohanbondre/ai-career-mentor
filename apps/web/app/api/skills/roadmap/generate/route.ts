import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { generateLearningRoadmap } from "@/lib/ai/gemini"
import { z } from "zod"
import { notifyRoadmapGenerated } from "@/lib/notifications/service"

const bodySchema = z.object({
  skillGapId:    z.string().optional(),
  missingSkills: z.array(z.string()).optional(),
  targetRole:    z.string().min(2),
  timelineWeeks: z.number().min(1).max(52).default(12),
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

    const { skillGapId, missingSkills: explicitSkills, targetRole, timelineWeeks } = parsed.data

    // Resolve missing skills from skill gap if ID provided
    let missingSkills: string[] = explicitSkills ?? []

    if (!missingSkills.length && skillGapId) {
      const skillGap = await prisma.skillGap.findFirst({
        where: { id: skillGapId, userId: session.user.id },
      })

      if (skillGap?.missingSkills) {
        const parsed = skillGap.missingSkills as any
        missingSkills = Array.isArray(parsed)
          ? parsed.map((s: any) => s.name || s.skill || s).filter(Boolean)
          : []
      }
    }

    if (!missingSkills.length) {
      return NextResponse.json(
        { error: "No skills provided. Provide missingSkills array or valid skillGapId." },
        { status: 422 }
      )
    }

    // Generate roadmap with AI
    const roadmapResult = await generateLearningRoadmap(missingSkills, targetRole, timelineWeeks)

    // Persist to database
    const roadmap = await prisma.roadmap.create({
      data: {
        userId:      session.user.id,
        title:       roadmapResult.title,
        targetRole:  roadmapResult.targetRole,
        duration:    roadmapResult.duration,
        modules:     roadmapResult.modules as any,
        progress:    0,
        status:      "DRAFT",
      },
    })

    // Notify user (non-blocking)
    void notifyRoadmapGenerated(
      session.user.id,
      roadmap.id,
      roadmapResult.targetRole,
      roadmapResult.duration
    )

    return NextResponse.json({
      success: true,
      roadmapId: roadmap.id,
      roadmap: {
        ...roadmap,
        totalHours: roadmapResult.totalHours,
        prerequisites: roadmapResult.prerequisites,
        summary: roadmapResult.summary,
      },
    })
  } catch (error) {
    console.error("Roadmap generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate roadmap", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    )
  }
}
