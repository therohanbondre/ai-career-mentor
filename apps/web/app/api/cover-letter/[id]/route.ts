import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// ── GET ────────────────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const letter = await prisma.coverLetter.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!letter) {
      return NextResponse.json({ error: "Cover letter not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, coverLetter: letter })
  } catch (error) {
    console.error("Cover letter fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch cover letter" }, { status: 500 })
  }
}

// ── PATCH ──────────────────────────────────────────────────────────────────────
const patchSchema = z.object({
  title:    z.string().min(1).optional(),
  content:  z.string().min(1).optional(),
  status:   z.enum(["DRAFT", "FINAL", "ARCHIVED"]).optional(),
  tone:     z.enum(["PROFESSIONAL", "CONVERSATIONAL", "ENTHUSIASTIC", "FORMAL"]).optional(),
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
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.errors },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = { ...parsed.data }

    // Recompute word count if content was changed
    if (parsed.data.content) {
      updateData.wordCount = parsed.data.content.split(/\s+/).filter(Boolean).length
      updateData.aiGenerated = false // user edited it
    }

    const letter = await prisma.coverLetter.update({
      where: { id: params.id, userId: session.user.id },
      data:  updateData,
    })

    return NextResponse.json({ success: true, coverLetter: letter })
  } catch (error) {
    console.error("Cover letter update error:", error)
    return NextResponse.json({ error: "Failed to update cover letter" }, { status: 500 })
  }
}

// ── DELETE ─────────────────────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.coverLetter.delete({
      where: { id: params.id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cover letter delete error:", error)
    return NextResponse.json({ error: "Failed to delete cover letter" }, { status: 500 })
  }
}
