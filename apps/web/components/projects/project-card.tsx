"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Code2,
  CheckCircle2,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Github,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProjectData, ProjectRecommendationData } from "@/types"

type AnyProject = ProjectData | ProjectRecommendationData

interface ProjectCardProps {
  project: AnyProject
  onStatusChange?: (id: string, status: string) => void
}

const DIFFICULTY_STYLES = {
  BEGINNER:     { badge: "success"     as const, label: "Beginner",     dot: "bg-green-500"  },
  INTERMEDIATE: { badge: "warning"     as const, label: "Intermediate", dot: "bg-yellow-500" },
  ADVANCED:     { badge: "destructive" as const, label: "Advanced",     dot: "bg-red-500"    },
}

export function ProjectCard({ project, onStatusChange }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  const isDbProject = "id" in project
  const userStatus  = isDbProject ? (project as ProjectData).userStatus ?? "RECOMMENDED" : "RECOMMENDED"
  const difficulty  = project.difficulty ?? "INTERMEDIATE"
  const style       = DIFFICULTY_STYLES[difficulty]

  const technologies = "technologies" in project
    ? (project as ProjectRecommendationData).technologies
    : (project as ProjectData).skills

  const features = "features" in project
    ? (project as ProjectRecommendationData).features
    : []

  const outcomes = "outcomes" in project
    ? (project as ProjectRecommendationData).outcomes
    : []

  const estimatedTime = "estimatedHours" in project
    ? `${(project as ProjectRecommendationData).estimatedHours}h`
    : (project as ProjectData).duration

  const githubIdeas = "githubIdeas" in project
    ? (project as ProjectRecommendationData).githubIdeas ?? []
    : []

  const handleStatusChange = async (newStatus: string) => {
    if (!isDbProject || !onStatusChange) return
    setUpdating(true)
    try {
      await onStatusChange((project as ProjectData).id, newStatus)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card
      className={cn(
        "flex flex-col transition-all duration-200 hover:shadow-md",
        userStatus === "COMPLETED"   && "border-green-200  bg-green-50/30  dark:border-green-900/40",
        userStatus === "IN_PROGRESS" && "border-primary/30 bg-primary/5"
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{project.title}</h3>
              <p className="text-xs text-muted-foreground">{project.category}</p>
            </div>
          </div>
          <Badge variant={style.badge} className="shrink-0 text-xs">
            {style.label}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {estimatedTime}
          </span>
          {userStatus === "IN_PROGRESS" && (
            <Badge variant="outline" className="gap-1 text-xs text-primary border-primary/40">
              <PlayCircle className="h-3 w-3" />
              In Progress
            </Badge>
          )}
          {userStatus === "COMPLETED" && (
            <Badge variant="success" className="gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          )}
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5">
          {technologies.slice(0, 5).map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
          {technologies.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{technologies.length - 5}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Expandable section */}
      {(features.length > 0 || outcomes.length > 0 || githubIdeas.length > 0) && (
        <>
          <CardContent className="pt-0">
            <button
              className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              <span>{expanded ? "Hide details" : "Show details"}</span>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {expanded && (
              <div className="mt-4 space-y-4">
                {features.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Key Features
                    </p>
                    <ul className="space-y-1">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-0.5 text-primary">•</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {outcomes.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      What You'll Learn
                    </p>
                    <ul className="space-y-1">
                      {outcomes.map((o, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {githubIdeas.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      GitHub Repo Ideas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {githubIdeas.map((idea) => (
                        <span
                          key={idea}
                          className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-mono text-foreground"
                        >
                          <Github className="h-3 w-3" />
                          {idea}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </>
      )}

      <CardFooter className="mt-auto gap-2 pt-3">
        {isDbProject && onStatusChange && (
          <>
            {userStatus === "RECOMMENDED" && (
              <Button
                size="sm"
                className="flex-1 gap-2"
                disabled={updating}
                onClick={() => handleStatusChange("IN_PROGRESS")}
              >
                <PlayCircle className="h-4 w-4" />
                Start Project
              </Button>
            )}
            {userStatus === "IN_PROGRESS" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2 text-green-600 border-green-200 hover:bg-green-50"
                  disabled={updating}
                  onClick={() => handleStatusChange("COMPLETED")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Done
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating}
                  onClick={() => handleStatusChange("ABANDONED")}
                >
                  Abandon
                </Button>
              </>
            )}
            {userStatus === "COMPLETED" && (
              <Button size="sm" variant="outline" className="flex-1" disabled>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Completed
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}
