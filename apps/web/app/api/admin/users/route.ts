import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

/*
 * GET /api/admin/users
 * Paginated user list with role / status / search filters.
 * ADMIN only — enforced by middleware and double-checked here.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
    const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "20"))
    const role   = searchParams.get("role")
    const status = searchParams.get("status")
    const search = searchParams.get("search")?.trim()
    const skip   = (page - 1) * limit

    const where: Record<string, any> = {}
    if (role)   where.role   = role
    if (status) where.status = status
    if (search) {
      where.OR = [
        { email:   { contains: search, mode: "insensitive" } },
        { profile: { displayName: { contains: search, mode: "insensitive" } } },
        { profile: { firstName:   { contains: search, mode: "insensitive" } } },
        { profile: { lastName:    { contains: search, mode: "insensitive" } } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id:            true,
          email:         true,
          role:          true,
          status:        true,
          emailVerified: true,
          lastLoginAt:   true,
          createdAt:     true,
          profile: {
            select: {
              displayName: true,
              firstName:   true,
              lastName:    true,
              avatar:      true,
            },
          },
          _count: {
            select: {
              resumes:          true,
              interviewSessions: true,
              skillGaps:        true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
