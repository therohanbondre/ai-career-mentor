"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  ExternalLink,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { RoadmapModule } from "@/types"

interface ModuleCardProps {
  module: RoadmapModule
  isActive: boolean
  onToggleComplete: (week: number, completed: boolean) => void
}

const RESOURCE_ICONS: Record<string, string> = {
  course:    "🎓",
  book:      "📚",
  tutorial:  "📝",
  practice:  "💻",
}

export function ModuleCard({ module, isActive, onToggleComplete }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(isActive && !module.completed)

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        module.completed
          ? "border-green-200 bg-green-50/40 dark:border-green-900/40 dark:bg-green-950/10"
          : isActive
          ? "border-primary/40 shadow-sm"
          : "opacity-80"
      )}
    >
      {/* Header row */}
      <div
        className="flex cursor-pointer items-start gap-4 p-4"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Week badge */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            module.completed
              ? "bg-green-500 text-white"
              : isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {module.completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            `W${module.week}`
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm leading-tight">{module.title}</h3>
            {isActive && !module.completed && (
              <Badge variant="default" className="text-xs">Current</Badge>
            )}
            {module.completed && (
              <Badge variant="success" className="text-xs">Done</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {module.description}
          </p>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {module.estimatedHours}h
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {module.resources?.length ?? 0} resources
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {module.milestones?.length ?? 0} milestones
            </span>
          </div>
        </div>

        <div className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <CardContent className="px-4 pb-4 pt-0 space-y-4">
          <Separator />

          {/* Skills & Topics */}
          {module.skills?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Skills Covered
              </p>
              <div className="flex flex-wrap gap-1.5">
                {module.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {module.topics?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Topics
              </p>
              <ul className="space-y-1">
                {module.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 text-primary">•</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resources */}
          {module.resources?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Resources
              </p>
              <div className="space-y-2">
                {module.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <span>{RESOURCE_ICONS[res.type] ?? "🔗"}</span>
                      <div>
                        <p className="font-medium">{res.name}</p>
                        {res.duration && (
                          <p className="text-xs text-muted-foreground">{res.duration}</p>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {module.milestones?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Milestones
              </p>
              <ul className="space-y-2">
                {module.milestones.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Complete toggle */}
          <div className="pt-2">
            <Button
              variant={module.completed ? "outline" : "default"}
              size="sm"
              className="w-full gap-2"
              onClick={(e) => {
                e.stopPropagation()
                onToggleComplete(module.week, !module.completed)
              }}
            >
              {module.completed ? (
                <>
                  <Circle className="h-4 w-4" />
                  Mark as Incomplete
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Complete
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
