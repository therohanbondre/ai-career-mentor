"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ModuleCard } from "@/components/roadmap/module-card"
import { BookOpen, Clock, Target, Trophy } from "lucide-react"
import type { RoadmapData, RoadmapModule } from "@/types"

interface RoadmapTimelineProps {
  roadmap: RoadmapData
  onModuleToggle: (week: number, completed: boolean) => void
}

export function RoadmapTimeline({ roadmap, onModuleToggle }: RoadmapTimelineProps) {
  const modules = (roadmap.modules ?? []) as RoadmapModule[]

  const { completedCount, totalHours, completedHours, activeWeek } = useMemo(() => {
    const completedCount   = modules.filter((m) => m.completed).length
    const totalHours       = modules.reduce((s, m) => s + (m.estimatedHours ?? 0), 0)
    const completedHours   = modules
      .filter((m) => m.completed)
      .reduce((s, m) => s + (m.estimatedHours ?? 0), 0)
    // First non-completed module
    const activeWeek = modules.find((m) => !m.completed)?.week ?? null

    return { completedCount, totalHours, completedHours, activeWeek }
  }, [modules])

  const statusVariant =
    roadmap.status === "COMPLETED"  ? "success"   :
    roadmap.status === "ACTIVE"     ? "default"   :
    roadmap.status === "PAUSED"     ? "warning"   : "secondary"

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">{roadmap.title}</CardTitle>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Target: <span className="font-medium text-foreground">{roadmap.targetRole}</span>
              </p>
            </div>
            <Badge variant={statusVariant as any}>
              {roadmap.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Clock,   label: "Duration",   value: `${roadmap.duration}w` },
              { icon: BookOpen,label: "Modules",    value: `${completedCount}/${modules.length}` },
              { icon: Clock,   label: "Hours",      value: `${completedHours}/${totalHours}h` },
              { icon: Trophy,  label: "Progress",   value: `${roadmap.progress ?? 0}%` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {label}
                </div>
                <p className="mt-0.5 text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall progress</span>
              <span>{roadmap.progress ?? 0}%</span>
            </div>
            <Progress value={roadmap.progress ?? 0} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Module list */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Weekly Modules</h2>
          <span className="text-sm text-muted-foreground">({modules.length} weeks)</span>
        </div>

        {modules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 h-12 w-12 opacity-40" />
              <p>No modules found in this roadmap.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.week}
                module={module}
                isActive={module.week === activeWeek}
                onToggleComplete={onModuleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
