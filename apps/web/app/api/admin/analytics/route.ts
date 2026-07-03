import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"

/*
 * GET /api/admin/analytics
 * Platform-wide statistics for the admin dashboard.
 * All counts run in parallel for performance.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const now    = new Date()
    const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const last7  = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
    const last30 = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalAdmins,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalResumes,
      totalInterviews,
      totalCoverLetters,
      totalRoadmaps,
      totalSkillGaps,
      totalJobs,
      newUsersToday,
      newUsersPast7Days,
      newUsersPast30Days,
      aiCallsTotal,
      aiCallsToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT"   } }),
      prisma.user.count({ where: { role: "RECRUITER" } }),
      prisma.user.count({ where: { role: "ADMIN"     } }),
      prisma.user.count({ where: { status: "ACTIVE"    } }),
      prisma.user.count({ where: { status: "PENDING"   } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.resume.count(),
      prisma.interviewSession.count(),
      prisma.coverLetter.count(),
      prisma.roadmap.count(),
      prisma.skillGap.count(),
      prisma.jobDescription.count(),
      prisma.user.count({ where: { createdAt: { gte: today  } } }),
      prisma.user.count({ where: { createdAt: { gte: last7  } } }),
      prisma.user.count({ where: { createdAt: { gte: last30 } } }),
      prisma.aILog.count(),
      prisma.aILog.count({ where: { createdAt: { gte: today } } }),
    ])

    // AI calls grouped by type
    const aiByTypeRaw = await prisma.aILog.groupBy({
      by:        ["type"],
      _count:    { _all: true },
      orderBy:   { _count: { type: "desc" } },
    })

    const aiCallsByType = aiByTypeRaw.reduce<Record<string, number>>(
      (acc, row) => { acc[row.type] = row._count._all; return acc },
      {}
    )

    const stats = {
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalAdmins,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalResumes,
      totalInterviews,
      totalCoverLetters,
      totalRoadmaps,
      totalSkillGaps,
      totalJobs,
      newUsersToday,
      newUsersPast7Days,
      newUsersPast30Days,
      aiCallsTotal,
      aiCallsToday,
      aiCallsByType,
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Admin analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
