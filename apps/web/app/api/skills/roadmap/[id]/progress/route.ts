import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const bodySchema = z.object({
  progress:    z.number().min(0).max(100),
  status:      z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  completedModules: z.array(z.number()).optional(),
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

    const { progress, status, completedModules } = parsed.data

    const updateData: any = { progress }

    if (status) {
      updateData.status = status
      if (status === "ACTIVE" && !updateData.startedAt) {
        updateData.startedAt = new Date()
      }
      if (status === "COMPLETED") {
        updateData.completedAt = new Date()
        updateData.progress = 100
      }
    }

    // If completed modules provided, store in modules JSON
    if (completedModules) {
      const roadmap = await prisma.roadmap.findFirst({
        where: { id: params.id, userId: session.user.id },
      })

      if (roadmap?.modules) {
        const modules = roadmap.modules as any[]
        const updatedModules = modules.map((m: any, idx: number) => ({
          ...m,
          completed: completedModules.includes(m.week ?? idx + 1),
        }))
        updateData.modules = updatedModules
      }
    }

    const roadmap = await prisma.roadmap.update({
      where: { id: params.id, userId: session.user.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, roadmap })
  } catch (error) {
    console.error("Roadmap progress update error:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
