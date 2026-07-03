import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const patchSchema = z.object({
  title:            z.string().min(2).optional(),
  description:      z.string().min(50).optional(),
  requirements:     z.string().optional(),
  responsibilities: z.string().optional(),
  benefits:         z.string().optional(),
  skills:           z.array(z.string()).optional(),
  location:         z.string().optional(),
  salaryRange:      z.string().optional(),
  remote:           z.boolean().optional(),
  status:           z.enum(["DRAFT","ACTIVE","CLOSED","FILLED","ARCHIVED"]).optional(),
  expiresAt:        z.string().optional(),
})

async function getJobOrFail(id: string, userId: string, role: string) {
  const job = await prisma.jobDescription.findFirst({
    where: { id, ...(role !== "ADMIN" ? { userId } : {}) },
  })
  return job
}

// ─── GET ───────────────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const job = await getJobOrFail(params.id, session.user.id, session.user.role)
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

    const applicantCount = await prisma.application.count({
      where: { jobDescriptionId: params.id },
    })

    return NextResponse.json({ success: true, job: { ...job, applicantCount } })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}

// ─── PATCH ─────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await getJobOrFail(params.id, session.user.id, session.user.role)
    if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 })

    const body   = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error", details: parsed.error.errors }, { status: 400 })
    }

    const updateData: Record<string, any> = { ...parsed.data }

    // Auto-set postedAt when publishing for the first time
    if (parsed.data.status === "ACTIVE" && !existing.postedAt) {
      updateData.postedAt = new Date()
    }
    if (parsed.data.expiresAt) {
      updateData.expiresAt = new Date(parsed.data.expiresAt)
    }

    const job = await prisma.jobDescription.update({
      where: { id: params.id },
      data:  updateData,
    })

    return NextResponse.json({ success: true, job })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }
}

// ─── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const existing = await getJobOrFail(params.id, session.user.id, session.user.role)
    if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 })

    await prisma.jobDescription.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}
