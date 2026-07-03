import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const roadmap = await prisma.roadmap.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, roadmap })
  } catch (error) {
    console.error("Roadmap fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.roadmap.delete({
      where: { id: params.id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Roadmap delete error:", error)
    return NextResponse.json({ error: "Failed to delete roadmap" }, { status: 500 })
  }
}
