import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

/* 
 * Architectural Decision: Resume Upload API
 * - Secure file upload with validation
 * - PDF and DOCX support only
 * - File size limit: 10MB
 * - Text extraction for indexing
 * - Version history tracking
 * - Secure storage outside public directory
 */

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
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
    const title = formData.get("title") as string

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

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const uniqueFilename = `${randomUUID()}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "private", "uploads", "resumes")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file securely
    const filePath = join(uploadDir, uniqueFilename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create resume record in database
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: title || file.name,
        fileName: uniqueFilename,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        filePath: filePath,
        version: 1,
        status: "ACTIVE",
      },
    })

    // TODO: Extract text from file for indexing
    // This would require pdf-parse and mammoth libraries

    return NextResponse.json(
      {
        success: true,
        resume: {
          id: resume.id,
          title: resume.title,
          fileName: resume.fileName,
          originalFileName: resume.originalFileName,
          fileSize: resume.fileSize,
          createdAt: resume.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    )
  }
}
