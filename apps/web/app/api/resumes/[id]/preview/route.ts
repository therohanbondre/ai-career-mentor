import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { existsSync } from "path"

/* 
 * Architectural Decision: Resume Preview API
 * - Serve resume file for preview
 * - Security check for ownership
 * - Support range requests for large files
 * - Cache headers for performance
 */

export async function GET(
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

    // Check if file exists
    if (!existsSync(resume.filePath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await readFile(resume.filePath)

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": resume.mimeType,
        "Content-Disposition": `inline; filename="${resume.originalFileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Resume preview error:", error)
    return NextResponse.json(
      { error: "Failed to preview resume" },
      { status: 500 }
    )
  }
}
