import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { readFile, unlink } from "fs/promises"
import { existsSync } from "fs"
import { randomUUID } from "crypto"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

/* 
 * Architectural Decision: Resume Detail API
 * - Get resume by ID
 * - Update resume metadata
 * - Delete resume with file cleanup
 * - Replace resume with version history
 */

// GET - Fetch resume details
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
      include: {
        versions: {
          orderBy: { version: "desc" },
        },
      },
    })

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      resume,
    })
  } catch (error) {
    console.error("Resume fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch resume" },
      { status: 500 }
    )
  }
}

// PATCH - Update resume metadata
export async function PATCH(
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

    const body = await req.json()
    const { title, isPrimary } = body

    // If setting as primary, unset other primary resumes
    if (isPrimary) {
      await prisma.resume.updateMany({
        where: {
          userId: session.user.id,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      })
    }

    const resume = await prisma.resume.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        ...(title && { title }),
        ...(isPrimary !== undefined && { isPrimary }),
      },
    })

    return NextResponse.json({
      success: true,
      resume,
    })
  } catch (error) {
    console.error("Resume update error:", error)
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    )
  }
}

// DELETE - Delete resume with file cleanup
export async function DELETE(
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

    // Delete physical file
    if (existsSync(resume.filePath)) {
      await unlink(resume.filePath)
    }

    // Delete from database (cascade will handle versions)
    await prisma.resume.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
    })
  } catch (error) {
    console.error("Resume delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    )
  }
}
