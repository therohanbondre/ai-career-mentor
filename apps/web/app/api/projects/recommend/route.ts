import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { recommendProjects } from "@/lib/ai/gemini"
import { z } from "zod"
import { notifyProjectRecommendation } from "@/lib/notifications/service"

const bodySchema = z.object({
  targetRole:      z.string().min(2),
  currentSkills:   z.array(z.string()).optional(),
  difficultyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "MIXED"]).default("MIXED"),
  resumeId:        z.string().optional(),
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

    const { targetRole, currentSkills: explicitSkills, difficultyLevel, resumeId } = parsed.data

    // Resolve skills from resume if not provided
    let currentSkills: string[] = explicitSkills ?? []

    if (!currentSkills.length) {
      const resumeWhere = resumeId
        ? { id: resumeId, userId: session.user.id }
        : { userId: session.user.id, isPrimary: true, status: "ACTIVE" as const }

      const resume = await prisma.resume.findFirst({ where: resumeWhere })
      if (resume?.parsedData) {
        currentSkills = (resume.parsedData as any)?.skills ?? []
      }
    }

    if (!currentSkills.length) {
      return NextResponse.json(
        { error: "No skills found. Provide currentSkills array or upload a resume." },
        { status: 422 }
      )
    }

    // Generate project recommendations with AI
    const result = await recommendProjects(currentSkills, targetRole, difficultyLevel)

    // Persist unique projects to global catalog (if not exist)
    for (const proj of result.projects) {
      await prisma.project.upsert({
        where: { title: proj.title },
        update: {},
        create: {
          title:       proj.title,
          description: proj.description,
          difficulty:  proj.difficulty,
          skills:      proj.skills,
          duration:    `${proj.estimatedHours}h`,
          category:    proj.category,
          resources:   proj.resources as any,
        },
      })
    }

    // Notify user (non-blocking)
    void notifyProjectRecommendation(
      session.user.id,
      targetRole,
      result.projects.length
    )

    return NextResponse.json({
      success: true,
      projects: result.projects,
      summary:  result.summary,
    })
  } catch (error) {
    console.error("Project recommendation error:", error)
    return NextResponse.json(
      { error: "Failed to recommend projects", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    )
  }
}
