import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"))
    const status = searchParams.get("status")
    const skip   = (page - 1) * limit

    const where: Record<string, any> = { userId: session.user.id }
    if (status) where.status = status

    const [letters, total] = await Promise.all([
      prisma.coverLetter.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: "desc" },
        select: {
          id:          true,
          title:       true,
          jobTitle:    true,
          company:     true,
          tone:        true,
          wordCount:   true,
          status:      true,
          aiGenerated: true,
          createdAt:   true,
          updatedAt:   true,
          // First 200 chars as preview — avoid returning full content in list
          content:     true,
        },
      }),
      prisma.coverLetter.count({ where }),
    ])

    const withPreview = letters.map((l) => ({
      ...l,
      preview: l.content.slice(0, 200).trimEnd() + (l.content.length > 200 ? "…" : ""),
      content: undefined,
    }))

    return NextResponse.json({
      success: true,
      coverLetters: withPreview,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Cover letters list error:", error)
    return NextResponse.json({ error: "Failed to fetch cover letters" }, { status: 500 })
  }
}
