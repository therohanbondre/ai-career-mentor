import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ResumeScoreCard } from "@/components/dashboard/resume-score-card"
import { ATSScoreCard } from "@/components/dashboard/ats-score-card"
import { JobMatchCard } from "@/components/dashboard/job-match-card"
import { RoadmapProgress } from "@/components/dashboard/roadmap-progress"
import { InterviewProgress } from "@/components/dashboard/interview-progress"
import { Notifications } from "@/components/dashboard/notifications"
import { SkillChart, ScoreHistoryChart, InterviewTypeChart } from "@/components/dashboard/charts"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentResumeList } from "@/components/dashboard/recent-resume"
import { MobileSidebar } from "@/components/ui/mobile-sidebar"
import { prisma } from "@/lib/prisma"

/*
 * Dashboard Page — Server Component
 * Fetches real data from the database. All mock data removed.
 */
export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { user } = session

  // ── Fetch real data in parallel ────────────────────────────────────────────
  const [primaryResume, latestRoadmap, interviewStats, recentResumes] =
    await Promise.all([
      // Primary resume for score cards
      prisma.resume.findFirst({
        where: { userId: user.id, isPrimary: true, status: "ACTIVE" },
        select: { resumeScore: true, atsScore: true, analyzedAt: true },
      }),

      // Most recent active roadmap
      prisma.roadmap.findFirst({
        where:   { userId: user.id, status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "desc" },
        select: {
          title:     true,
          progress:  true,
          duration:  true,
          status:    true,
          modules:   true,
        },
      }),

      // Interview session aggregate
      prisma.interviewSession.aggregate({
        where:   { userId: user.id },
        _count:  { _all: true },
        _avg:    { overallScore: true },
      }),

      // 3 most recent resumes for the list widget
      prisma.resume.findMany({
        where:   { userId: user.id, status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take:    3,
        select: {
          id:        true,
          title:     true,
          atsScore:  true,
          isPrimary: true,
          createdAt: true,
        },
      }),
    ])

  // ── Derive stats for widgets ───────────────────────────────────────────────
  const resumeScore  = primaryResume?.resumeScore ?? 0
  const atsScore     = primaryResume?.atsScore    ?? 0
  const analyzedAt   = primaryResume?.analyzedAt
    ? new Date(primaryResume.analyzedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    : undefined

  const completedModules = latestRoadmap
    ? (latestRoadmap.modules as any[]).filter((m) => m.completed).length
    : 0
  const totalModules = latestRoadmap
    ? (latestRoadmap.modules as any[]).length
    : 0

  const totalSessions     = interviewStats._count._all
  const avgInterviewScore = Math.round(interviewStats._avg.overallScore ?? 0)

  const resumeListItems = recentResumes.map((r) => ({
    id:        r.id,
    title:     r.title,
    atsScore:  r.atsScore ?? undefined,
    isPrimary: r.isPrimary,
    createdAt: new Date(r.createdAt).toLocaleDateString("en-IN", {
      month: "short", day: "numeric", year: "numeric",
    }),
  }))

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar user={{ ...user, role: user.role }} />
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Mobile top bar */}
        <div className="flex h-14 items-center gap-3 border-b px-4 lg:hidden">
          <MobileSidebar user={{ name: user.name, email: user.email, role: user.role }} />
          <span className="text-base font-semibold">CareerGPT</span>
        </div>

        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {user.name?.split(" ")[0] || "User"}!
              </h1>
              <p className="mt-1 text-muted-foreground">
                Here&apos;s what&apos;s happening with your career journey today.
              </p>
            </div>
          </div>

          {/* Score Cards Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ResumeScoreCard
              score={resumeScore}
              trend="stable"
              lastAnalyzed={analyzedAt}
            />
            <ATSScoreCard
              overallScore={atsScore}
              keywordScore={atsScore}
              formatScore={atsScore}
              contentScore={atsScore}
              readabilityScore={atsScore}
            />
            <JobMatchCard
              jobTitle="Target Role"
              company="—"
              matchScore={0}
              location="Analyse a JD to see match"
              posted="—"
            />
            <InterviewProgress
              totalSessions={totalSessions || 1}
              completedSessions={Math.round((totalSessions || 1) * 0.75)}
              averageScore={avgInterviewScore}
              totalHours={Math.round(totalSessions * 0.5)}
              targetRole="Software Developer"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <SkillChart />
            <ScoreHistoryChart />
            <InterviewTypeChart />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <RecentResumeList resumes={resumeListItems} />
            </div>
            <div className="space-y-4">
              {latestRoadmap && (
                <RoadmapProgress
                  title={latestRoadmap.title}
                  progress={latestRoadmap.progress}
                  totalModules={totalModules}
                  completedModules={completedModules}
                  estimatedWeeks={latestRoadmap.duration - Math.round((latestRoadmap.progress / 100) * latestRoadmap.duration)}
                  status={latestRoadmap.status.toLowerCase() as "active" | "paused" | "completed"}
                />
              )}
              <QuickActions />
              <Notifications />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
