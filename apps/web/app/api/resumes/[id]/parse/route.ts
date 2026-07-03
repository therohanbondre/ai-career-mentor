import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { extractTextFromFile, parseResumeData } from "@/lib/resume/parser"

/* 
 * Architectural Decision: Resume Parse API
 * - Parse existing resume file
 * - Extract structured data
 * - Store parsed data in database
 * - Handle errors gracefully
 * - Return structured JSON
 */

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get resume from database
    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    // Extract text from file
    const text = await extractTextFromFile(resume.filePath, resume.mimeType)

    // Parse structured data
    const parsedData = parseResumeData(text)

    // Store parsed data in database
    await prisma.resume.update({
      where: {
        id: params.id,
      },
      data: {
        parsedData: parsedData as any,
        parsedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      parsedData,
    })
  } catch (error) {
    console.error("Resume parse error:", error)
    return NextResponse.json(
      { 
        error: "Failed to parse resume",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
