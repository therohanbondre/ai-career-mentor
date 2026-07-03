import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { extractTextFromFile } from "@/lib/resume/parser"
import { analyzeResume } from "@/lib/ai/gemini"
import { notifyResumeAnalysisComplete } from "@/lib/notifications/service"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resume = await prisma.resume.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const text = await extractTextFromFile(resume.filePath, resume.mimeType)
    const body = await req.json()
    const jobDescription = body.jobDescription

    const analysis = await analyzeResume(text, jobDescription)

    await prisma.resume.update({
      where: { id: params.id },
      data: {
        analysis:    analysis as any,
        resumeScore: analysis.resumeScore,
        atsScore:    analysis.atsScore,
        analyzedAt:  new Date(),
      },
    })

    // ── Notify user ────────────────────────────────────────────────────────
    await notifyResumeAnalysisComplete(
      session.user.id,
      resume.id,
      resume.title,
      analysis.atsScore
    )

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error("Resume analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze resume", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
