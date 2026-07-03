import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { notifyInterviewComplete } from "@/lib/notifications/service"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const interviewSession = await prisma.interviewSession.findFirst({
      where:   { id: params.id, userId: session.user.id },
      include: { answers: true },
    })

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Compute overall score from evaluated answers
    const evaluated = interviewSession.answers.filter(
      (a) => a.status === "EVALUATED" && a.score !== null
    )

    const overallScore = evaluated.length
      ? Math.round(evaluated.reduce((s, a) => s + (a.score ?? 0), 0) / evaluated.length)
      : 0

    // Build performance summary
    const byType: Record<string, number[]> = {}
    for (const a of evaluated) {
      if (!byType[a.type]) byType[a.type] = []
      byType[a.type].push(a.score ?? 0)
    }

    const typeAverages = Object.entries(byType).reduce<Record<string, number>>(
      (acc, [type, scores]) => {
        acc[type] = Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
        return acc
      },
      {}
    )

    const feedback = {
      overallScore,
      totalQuestions:   interviewSession.answers.length,
      answeredQuestions: interviewSession.answers.filter((a) => a.userAnswer).length,
      evaluatedQuestions: evaluated.length,
      typeAverages,
      grade:
        overallScore >= 90 ? "A" :
        overallScore >= 75 ? "B" :
        overallScore >= 60 ? "C" :
        overallScore >= 45 ? "D" : "F",
    }

    const updated = await prisma.interviewSession.update({
      where: { id: params.id },
      data: {
        status:       "COMPLETED",
        completedAt:  new Date(),
        overallScore,
        feedback:     feedback as any,
      },
    })

    // Notify user (non-blocking)
    void notifyInterviewComplete(
      session.user.id,
      params.id,
      interviewSession.jobRole,
      overallScore
    )

    return NextResponse.json({ success: true, session: updated, feedback })
  } catch (error) {
    console.error("Complete interview error:", error)
    return NextResponse.json({ error: "Failed to complete interview" }, { status: 500 })
  }
}
