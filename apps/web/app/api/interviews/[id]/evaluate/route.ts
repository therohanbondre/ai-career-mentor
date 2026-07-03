import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { evaluateAnswer } from "@/lib/ai/gemini"
import { z } from "zod"

const bodySchema = z.object({
  answerId: z.string(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { answerId } = parsed.data

    // Load answer + session
    const answer = await prisma.interviewAnswer.findFirst({
      where: {
        id:                 answerId,
        interviewSessionId: params.id,
        interviewSession:   { userId: session.user.id },
      },
      include: { interviewSession: true },
    })

    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 })
    }

    if (!answer.userAnswer) {
      return NextResponse.json({ error: "No answer to evaluate" }, { status: 422 })
    }

    // Run AI evaluation
    const evaluation = await evaluateAnswer(
      answer.question,
      answer.type,
      answer.userAnswer,
      answer.interviewSession.jobRole,
      answer.difficulty
    )

    // Persist evaluation results
    const updated = await prisma.interviewAnswer.update({
      where: { id: answerId },
      data: {
        score:      evaluation.score,
        aiFeedback: JSON.stringify({
          grade:            evaluation.grade,
          strengths:        evaluation.strengths,
          improvements:     evaluation.improvements,
          modelAnswer:      evaluation.modelAnswer,
          detailedFeedback: evaluation.detailedFeedback,
          technicalAccuracy: evaluation.technicalAccuracy,
          communication:    evaluation.communication,
          completeness:     evaluation.completeness,
        }),
        status:      "EVALUATED",
        evaluatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success:    true,
      evaluation,
      score:      updated.score,
      answerId:   updated.id,
    })
  } catch (error) {
    console.error("Evaluate answer error:", error)
    return NextResponse.json(
      { error: "Failed to evaluate answer", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    )
  }
}
