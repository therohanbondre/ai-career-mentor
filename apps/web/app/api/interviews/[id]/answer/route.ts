import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bodySchema = z.object({
  answerId:   z.string(),
  userAnswer: z.string().min(1, "Answer cannot be empty"),
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

    const { answerId, userAnswer } = parsed.data

    // Verify the answer belongs to this session and user
    const existing = await prisma.interviewAnswer.findFirst({
      where: {
        id:                 answerId,
        interviewSessionId: params.id,
        interviewSession:   { userId: session.user.id },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 })
    }

    // Mark session as IN_PROGRESS on first answer
    await prisma.interviewSession.updateMany({
      where: { id: params.id, status: "SCHEDULED" },
      data:  { status: "IN_PROGRESS", startedAt: new Date() },
    })

    const updated = await prisma.interviewAnswer.update({
      where: { id: answerId },
      data:  { userAnswer, status: "SUBMITTED", answeredAt: new Date() },
    })

    return NextResponse.json({ success: true, answer: updated })
  } catch (error) {
    console.error("Answer submit error:", error)
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 })
  }
}
