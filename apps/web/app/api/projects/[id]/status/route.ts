import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bodySchema = z.object({
  status: z.enum(["RECOMMENDED", "IN_PROGRESS", "COMPLETED", "ABANDONED"]),
  notes:  z.string().optional(),
})

export async function PATCH(
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

    const { status, notes } = parsed.data

    const updateData: any = { status }
    if (notes !== undefined) updateData.notes = notes

    if (status === "IN_PROGRESS" && !updateData.startedAt) {
      updateData.startedAt = new Date()
    }
    if (status === "COMPLETED") {
      updateData.completedAt = new Date()
    }

    const projectRec = await prisma.projectRecommendation.upsert({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: params.id,
        },
      },
      update: updateData,
      create: {
        userId: session.user.id,
        projectId: params.id,
        ...updateData,
      },
    })

    return NextResponse.json({ success: true, projectRecommendation: projectRec })
  } catch (error) {
    console.error("Project status update error:", error)
    return NextResponse.json(
      { error: "Failed to update project status" },
      { status: 500 }
    )
  }
}
