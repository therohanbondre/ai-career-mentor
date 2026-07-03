"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { RoadmapTimeline } from "@/components/roadmap/roadmap-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { BookOpen, Plus, Sparkles, Loader2, ChevronRight } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import type { RoadmapData, RoadmapModule } from "@/types"

export default function RoadmapPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([])
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ targetRole: "", timelineWeeks: 12 })

  const fetchRoadmaps = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/skills/roadmap")
      const data = await res.json()
      if (res.ok) {
        setRoadmaps(data.roadmaps ?? [])
        if (data.roadmaps?.length > 0 && !activeRoadmap) {
          setActiveRoadmap(data.roadmaps[0])
        }
      }
    } catch (err) {
      console.error("Failed to fetch roadmaps:", err)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchRoadmaps() }, [fetchRoadmaps])

  const handleGenerate = async () => {
    if (!form.targetRole.trim()) {
      toast({ variant: "destructive" as any, title: "Target role is required" })
      return
    }

    setGenerating(true)
    try {
      const res = await fetch("/api/skills/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: form.targetRole,
          timelineWeeks: form.timelineWeeks,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")

      toast({
        variant: "success" as any,
        title: "Roadmap generated!",
        description: `${data.roadmap.duration}-week plan for ${data.roadmap.targetRole}`,
      })

      await fetchRoadmaps()
      setShowForm(false)
      setActiveRoadmap(data.roadmap)
    } catch (err) {
      toast({
        variant: "destructive" as any,
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Please try again",
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleModuleToggle = async (week: number, completed: boolean) => {
    if (!activeRoadmap) return

    const modules = (activeRoadmap.modules as RoadmapModule[]).map((m) =>
      m.week === week ? { ...m, completed } : m
    )
    const completedModules = modules.filter((m) => m.completed).map((m) => m.week)
    const progress = Math.round((completedModules.length / modules.length) * 100)

    // Optimistic update
    setActiveRoadmap({ ...activeRoadmap, modules, progress })

    try {
      await fetch(`/api/skills/roadmap/${activeRoadmap.id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress,
          completedModules,
          status: progress === 100 ? "COMPLETED" : "ACTIVE",
        }),
      })
    } catch (err) {
      console.error("Progress update failed:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar user={session?.user} />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Learning Roadmap</h1>
              <p className="text-muted-foreground">
                AI-generated week-by-week learning plans tailored to your goals
              </p>
            </div>
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="mr-2 h-4 w-4" />
              New Roadmap
            </Button>
          </div>

          {/* Generate form */}
          {showForm && (
            <Card className="border-primary/20">
              <CardContent className="space-y-5 pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="targetRole">Target Role</Label>
                    <Input
                      id="targetRole"
                      placeholder="e.g., Senior Frontend Developer"
                      value={form.targetRole}
                      onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeline: {form.timelineWeeks} weeks</Label>
                    <Slider
                      min={4} max={24} step={2}
                      value={[form.timelineWeeks]}
                      onValueChange={([v]) => setForm({ ...form, timelineWeeks: v })}
                      className="pt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      ~{(form.timelineWeeks * 10).toFixed(0)} total learning hours
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleGenerate} disabled={generating}>
                    {generating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                    ) : (
                      <><Sparkles className="mr-2 h-4 w-4" />Generate Roadmap</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Roadmap list + active roadmap */}
          {roadmaps.length === 0 && !showForm ? (
            <Card>
              <CardContent className="py-20 text-center">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-40" />
                <h3 className="text-xl font-semibold">No roadmaps yet</h3>
                <p className="mt-2 text-muted-foreground">
                  Generate your first AI learning roadmap to get started
                </p>
                <Button className="mt-6" onClick={() => setShowForm(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Roadmap
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Sidebar list */}
              {roadmaps.length > 1 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    My Roadmaps
                  </h2>
                  {roadmaps.map((rm) => (
                    <button
                      key={rm.id}
                      onClick={() => setActiveRoadmap(rm)}
                      className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                        activeRoadmap?.id === rm.id
                          ? "border-primary bg-primary/5 font-medium"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="line-clamp-1">{rm.targetRole}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {rm.progress}% · {rm.duration}w
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Active roadmap */}
              <div className={roadmaps.length > 1 ? "lg:col-span-3" : "lg:col-span-4"}>
                {activeRoadmap ? (
                  <RoadmapTimeline
                    roadmap={activeRoadmap}
                    onModuleToggle={handleModuleToggle}
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
