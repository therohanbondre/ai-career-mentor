"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ProjectGrid } from "@/components/projects/project-grid"
import { ProjectCard } from "@/components/projects/project-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Loader2, Code2 } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import type { ProjectRecommendationData } from "@/types"

export default function ProjectsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [generating, setGenerating] = useState(false)
  const [aiProjects, setAiProjects] = useState<ProjectRecommendationData[]>([])
  const [aiSummary, setAiSummary] = useState("")
  const [form, setForm] = useState({
    targetRole: "",
    difficultyLevel: "MIXED" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "MIXED",
  })

  const handleGenerate = async () => {
    if (!form.targetRole.trim()) {
      toast({ variant: "destructive" as any, title: "Please enter a target role" })
      return
    }

    setGenerating(true)
    try {
      const res = await fetch("/api/projects/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")

      setAiProjects(data.projects ?? [])
      setAiSummary(data.summary ?? "")
      toast({
        variant: "success" as any,
        title: `${data.projects?.length} projects recommended!`,
      })
    } catch (err) {
      toast({
        variant: "destructive" as any,
        title: "Recommendation failed",
        description: err instanceof Error ? err.message : "Please try again",
      })
    } finally {
      setGenerating(false)
    }
  }

  const DIFFICULTIES = ["MIXED", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const
  const DIFF_LABELS: Record<string, string> = {
    MIXED: "Mixed", BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced",
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              AI-recommended portfolio projects to build and demonstrate your skills
            </p>
          </div>

          {/* AI Recommendations Form */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Get AI Project Recommendations</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Tell us your target role and we'll suggest projects that will impress recruiters
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Full Stack Developer"
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <div className="flex gap-1.5">
                    {DIFFICULTIES.map((d) => (
                      <Button
                        key={d}
                        size="sm"
                        variant={form.difficultyLevel === d ? "default" : "outline"}
                        onClick={() => setForm({ ...form, difficultyLevel: d })}
                        className="h-9 text-xs"
                      >
                        {DIFF_LABELS[d]}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="h-9 shrink-0"
                >
                  {generating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" />Recommend</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations Results */}
          {aiProjects.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  AI Recommendations for {form.targetRole}
                </h2>
              </div>

              {aiSummary && (
                <p className="text-sm text-muted-foreground max-w-3xl">{aiSummary}</p>
              )}

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {aiProjects.map((proj, i) => (
                  <ProjectCard key={i} project={proj} />
                ))}
              </div>

              <Separator />
            </div>
          )}

          {/* Catalog */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Project Catalog</h2>
            </div>
            <ProjectGrid />
          </div>
        </div>
      </main>
    </div>
  )
}
