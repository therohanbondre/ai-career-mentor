"use client"

import { useState, useEffect, useCallback } from "react"
import { ProjectCard } from "@/components/projects/project-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Code2, Search, SlidersHorizontal } from "lucide-react"
import type { ProjectData } from "@/types"

interface ProjectGridProps {
  initialDifficulty?: string
}

const DIFFICULTIES = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED"]
const DIFFICULTY_LABELS: Record<string, string> = {
  All: "All", BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced",
}

export function ProjectGrid({ initialDifficulty }: ProjectGridProps) {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState(initialDifficulty ?? "All")
  const [search, setSearch] = useState("")

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "50" })
      if (difficulty !== "All") params.set("difficulty", difficulty)
      const res = await fetch(`/api/projects?${params}`)
      const data = await res.json()
      if (res.ok) setProjects(data.projects ?? [])
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }, [difficulty])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/projects/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, userStatus: status as any } : p))
      )
    }
  }

  const filtered = projects.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.skills.some((s) => s.toLowerCase().includes(q))
    )
  })

  const stats = {
    total:      projects.length,
    inProgress: projects.filter((p) => p.userStatus === "IN_PROGRESS").length,
    completed:  projects.filter((p) => p.userStatus === "COMPLETED").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Available", value: stats.total, color: "text-foreground" },
          { label: "In Progress", value: stats.inProgress, color: "text-primary" },
          { label: "Completed", value: stats.completed, color: "text-green-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="py-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1.5">
            {DIFFICULTIES.map((d) => (
              <Button
                key={d}
                size="sm"
                variant={difficulty === d ? "default" : "outline"}
                onClick={() => setDifficulty(d)}
                className="h-8 text-xs"
              >
                {DIFFICULTY_LABELS[d]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Code2 className="mx-auto mb-3 h-16 w-16 text-muted-foreground opacity-40" />
            <h3 className="text-lg font-semibold">No projects found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try a different search term" : "Generate AI recommendations below"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
