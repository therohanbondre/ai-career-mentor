"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { TrendingDown, AlertTriangle } from "lucide-react"
import type { SkillDetail } from "@/types"

interface SkillGapChartProps {
  missingSkills: SkillDetail[]
}

const PRIORITY_COLORS = {
  CRITICAL: "#ef4444", // red
  HIGH:     "#f59e0b", // orange
  MEDIUM:   "#eab308", // yellow
  LOW:      "#94a3b8", // gray
}

const PRIORITY_LABELS = {
  CRITICAL: "Critical",
  HIGH:     "High",
  MEDIUM:   "Medium",
  LOW:      "Low",
}

export function SkillGapChart({ missingSkills }: SkillGapChartProps) {
  // Group by priority and count
  const priorityCounts = missingSkills.reduce(
    (acc, skill) => {
      acc[skill.priority] = (acc[skill.priority] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const chartData = (["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const)
    .filter((p) => priorityCounts[p] > 0)
    .map((priority) => ({
      priority: PRIORITY_LABELS[priority],
      count: priorityCounts[priority],
      fill: PRIORITY_COLORS[priority],
    }))

  const criticalCount = priorityCounts.CRITICAL || 0
  const highCount = priorityCounts.HIGH || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            <CardTitle>Skill Gaps by Priority</CardTitle>
          </div>
          {(criticalCount + highCount) > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalCount + highCount} urgent
            </Badge>
          )}
        </div>
        <CardDescription>
          Skills you need to acquire to match this role
        </CardDescription>
      </CardHeader>

      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No skill gaps detected — you're a perfect match!
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="priority" type="category" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {Object.entries(PRIORITY_LABELS).map(([key, label]) => {
                const count = priorityCounts[key as keyof typeof PRIORITY_LABELS]
                if (!count) return null
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: PRIORITY_COLORS[key as keyof typeof PRIORITY_COLORS] }}
                    />
                    <span className="text-muted-foreground">
                      {label}: <span className="font-medium text-foreground">{count}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
