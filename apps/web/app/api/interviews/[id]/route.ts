import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const interviewSession = await prisma.interviewSession.findFirst({
      where:   { id: params.id, userId: session.user.id },
      include: {
        answers: { orderBy: { order: "asc" } },
      },
    })

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const evaluated = interviewSession.answers.filter((a) => a.score !== null)
    const avgScore  = evaluated.length
      ? Math.round(evaluated.reduce((s, a) => s + (a.score ?? 0), 0) / evaluated.length)
      : null

    return NextResponse.json({
      success: true,
      session: {
        ...interviewSession,
        averageScore: avgScore,
        questionCount: interviewSession.answers.length,
        evaluatedCount: evaluated.length,
      },
    })
  } catch (error) {
    console.error("Interview fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch interview" }, { status: 500 })
  }
}
