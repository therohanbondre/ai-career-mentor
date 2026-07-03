import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"
import { writeFile, mkdir, unlink, readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

/* 
 * Architectural Decision: Resume Replace API
 * - Replace existing resume file
 * - Create new version entry
 * - Keep old version for history
 * - Update metadata
 */

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and DOCX are allowed" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // Get existing resume
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingResume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    // Save old file as version
    const uploadDir = join(process.cwd(), "private", "uploads", "resumes", "versions")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const versionFileName = `${randomUUID()}_${existingResume.fileName}`
    const versionFilePath = join(uploadDir, versionFileName)
    
    if (existsSync(existingResume.filePath)) {
      const oldFileBuffer = await readFile(existingResume.filePath)
      await writeFile(versionFilePath, oldFileBuffer)
    }

    // Create version record
    const newVersion = await prisma.resumeVersion.create({
      data: {
        resumeId: existingResume.id,
        version: existingResume.version + 1,
        fileName: versionFileName,
        filePath: versionFilePath,
        fileSize: existingResume.fileSize,
        mimeType: existingResume.mimeType,
      },
    })

    // Generate new filename for replacement
    const fileExtension = file.name.split(".").pop()
    const uniqueFilename = `${randomUUID()}.${fileExtension}`
    
    // Save new file
    const newFilePath = join(process.cwd(), "private", "uploads", "resumes", uniqueFilename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(newFilePath, buffer)

    // Delete old file
    if (existsSync(existingResume.filePath)) {
      await unlink(existingResume.filePath)
    }

    // Update resume record
    const updatedResume = await prisma.resume.update({
      where: {
        id: params.id,
      },
      data: {
        fileName: uniqueFilename,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        filePath: newFilePath,
        version: existingResume.version + 1,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        resume: updatedResume,
        version: newVersion,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resume replace error:", error)
    return NextResponse.json(
      { error: "Failed to replace resume" },
      { status: 500 }
    )
  }
}
