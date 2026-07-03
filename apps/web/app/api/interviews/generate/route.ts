import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { generateInterviewQuestions } from "@/lib/ai/gemini"
import { z } from "zod"

const bodySchema = z.object({
  jobRole:       z.string().min(2, "Job role is required"),
  interviewType: z.enum(["TECHNICAL", "BEHAVIORAL", "MIXED", "SYSTEM_DESIGN", "CODING"]).default("MIXED"),
  difficulty:    z.enum(["easy", "medium", "hard", "mixed"]).default("mixed"),
  count:         z.number().min(3).max(20).default(10),
  jobDescriptionId: z.string().optional(),
  jobDescription:   z.string().optional(),
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

    const { jobRole, interviewType, difficulty, count, jobDescriptionId, jobDescription } = parsed.data

    // Optionally fetch JD text if only ID was given
    let jdText = jobDescription
    if (!jdText && jobDescriptionId) {
      const jd = await prisma.jobDescription.findFirst({
        where: { id: jobDescriptionId, userId: session.user.id },
        select: { description: true },
      })
      jdText = jd?.description
    }

    // Generate questions with AI
    const result = await generateInterviewQuestions(jobRole, interviewType, difficulty, count, jdText)

    // Create the interview session
    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId:          session.user.id,
        type:            interviewType,
        jobRole,
        jobDescriptionId: jobDescriptionId ?? null,
        status:          "SCHEDULED",
        duration:        result.totalDuration,
      },
    })

    // Persist each question as an InterviewAnswer row (answer is null until submitted)
    await prisma.interviewAnswer.createMany({
      data: result.questions.map((q) => ({
        interviewSessionId: interviewSession.id,
        question:           q.question,
        type:               q.type,
        category:           q.category,
        difficulty:         q.difficulty,
        order:              q.order,
        status:             "PENDING",
      })),
    })

    // Fetch the created answers so client has IDs
    const answers = await prisma.interviewAnswer.findMany({
      where:   { interviewSessionId: interviewSession.id },
      orderBy: { order: "asc" },
    })

    // Merge AI question metadata (hints, tags, expectedDuration) with DB rows
    const questionsWithMeta = answers.map((a, idx) => ({
      ...a,
      hints:           result.questions[idx]?.hints ?? [],
      tags:            result.questions[idx]?.tags  ?? [],
      expectedDuration: result.questions[idx]?.expectedDuration ?? 5,
    }))

    return NextResponse.json({
      success: true,
      sessionId:    interviewSession.id,
      session:      interviewSession,
      questions:    questionsWithMeta,
      focusAreas:   result.focusAreas,
      totalDuration: result.totalDuration,
    })
  } catch (error) {
    console.error("Interview generate error:", error)
    return NextResponse.json(
      { error: "Failed to generate interview", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    )
  }
}
