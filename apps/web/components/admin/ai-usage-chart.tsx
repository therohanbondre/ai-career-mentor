"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import { Brain } from "lucide-react"
import type { AdminStats } from "@/types"

interface AIUsageChartProps {
  stats: AdminStats
}

const COLORS = [
  "#3b82f6","#8b5cf6","#10b981","#f59e0b",
  "#ef4444","#06b6d4","#ec4899","#84cc16","#f97316",
]

const TYPE_LABELS: Record<string, string> = {
  RESUME_ANALYSIS:        "Resume",
  SKILL_GAP_ANALYSIS:     "Skill Gap",
  INTERVIEW_GENERATION:   "Interview Q",
  INTERVIEW_EVALUATION:   "Interview Eval",
  COVER_LETTER_GENERATION:"Cover Letter",
  PROJECT_RECOMMENDATION: "Projects",
  ROADMAP_GENERATION:     "Roadmap",
  JOB_MATCHING:           "Job Match",
  ERROR:                  "Errors",
}

export function AIUsageChart({ stats }: AIUsageChartProps) {
  const data = Object.entries(stats.aiCallsByType)
    .map(([type, count]) => ({
      type: TYPE_LABELS[type] ?? type,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Usage by Feature</CardTitle>
          </div>
          <Badge variant="secondary">
            {stats.aiCallsTotal.toLocaleString()} total calls
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            No AI usage data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="type" type="category" width={110} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border:          "1px solid hsl(var(--border))",
                  borderRadius:    "8px",
                  fontSize:        "12px",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
