"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Users, FileText, MessageSquare, PenLine,
  Map, Brain, Briefcase, TrendingUp,
} from "lucide-react"
import type { AdminStats } from "@/types"

interface AnalyticsGridProps {
  stats: AdminStats
}

export function AnalyticsGrid({ stats }: AnalyticsGridProps) {
  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      sub: `+${stats.newUsersToday} today`,
      icon: Users,
      color: "text-blue-600",
      bg:    "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Students",
      value: stats.totalStudents,
      sub: `${stats.totalRecruiters} recruiters`,
      icon: Users,
      color: "text-green-600",
      bg:    "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Resumes",
      value: stats.totalResumes,
      sub: "uploaded",
      icon: FileText,
      color: "text-purple-600",
      bg:    "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Interviews",
      value: stats.totalInterviews,
      sub: "sessions",
      icon: MessageSquare,
      color: "text-orange-600",
      bg:    "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      label: "Cover Letters",
      value: stats.totalCoverLetters,
      sub: "generated",
      icon: PenLine,
      color: "text-pink-600",
      bg:    "bg-pink-100 dark:bg-pink-900/30",
    },
    {
      label: "Roadmaps",
      value: stats.totalRoadmaps,
      sub: "created",
      icon: Map,
      color: "text-cyan-600",
      bg:    "bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      label: "Skill Gaps",
      value: stats.totalSkillGaps,
      sub: "analysed",
      icon: Brain,
      color: "text-yellow-600",
      bg:    "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      label: "AI Calls",
      value: stats.aiCallsTotal,
      sub: `+${stats.aiCallsToday} today`,
      icon: TrendingUp,
      color: "text-red-600",
      bg:    "bg-red-100 dark:bg-red-900/30",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.bg}`}>
                <Icon className={`h-6 w-6 ${c.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{c.value.toLocaleString()}</p>
                <p className="text-sm font-medium text-foreground">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
