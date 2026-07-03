"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { JobDescriptionForm } from "@/components/jobs/job-description-form"
import { MatchScoreCard } from "@/components/jobs/match-score-card"
import { SkillGapChart } from "@/components/jobs/skill-gap-chart"
import { MissingSkillsList } from "@/components/jobs/missing-skills-list"
import { JobHistoryList } from "@/components/jobs/job-history-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Save, ArrowLeft } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/lib/hooks/use-toast"

export default function JobsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [analysisResult, setAnalysisResult] = useState<any | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveJob = async () => {
    if (!analysisResult) return

    setIsSaving(true)
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: analysisResult.formData.jobDescription,
          title:          analysisResult.formData.title,
          company:        analysisResult.formData.company,
          location:       analysisResult.formData.location,
          atsReportId:    analysisResult.atsReportId,
          matchScore:     analysisResult.jobMatch.overallMatch,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to save job")

      toast({
        variant: "success" as any,
        title: "Job saved!",
        description: "You can find it in your saved jobs list below.",
      })

      // Clear analysis to go back to form
      setAnalysisResult(null)
    } catch (error) {
      console.error("Save error:", error)
      toast({
        variant: "destructive" as any,
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Job Analysis</h1>
              <p className="text-muted-foreground">
                Analyze job descriptions to see your match score and identify skill gaps
              </p>
            </div>
            {analysisResult && (
              <Button variant="outline" onClick={() => setAnalysisResult(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                New Analysis
              </Button>
            )}
          </div>

          {!analysisResult ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <JobDescriptionForm onAnalysisComplete={setAnalysisResult} />
              </div>
              <div>
                <JobHistoryList />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Action Bar */}
              <Card>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {analysisResult.formData.title || "Job Analysis"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {analysisResult.formData.company}
                      {analysisResult.formData.location && ` • ${analysisResult.formData.location}`}
                    </p>
                  </div>
                  <Button onClick={handleSaveJob} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Job"}
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <MatchScoreCard
                    overallMatch={analysisResult.jobMatch.overallMatch}
                    skillMatch={analysisResult.jobMatch.skillMatch}
                    experienceMatch={analysisResult.jobMatch.experienceMatch}
                    educationMatch={analysisResult.jobMatch.educationMatch}
                    matchedSkills={analysisResult.jobMatch.matchedSkills}
                    summary={analysisResult.jobMatch.summary}
                  />

                  <MissingSkillsList
                    missingSkills={analysisResult.jobMatch.missingSkills}
                    learningPaths={analysisResult.skillGap.learningPaths}
                    recommendations={analysisResult.jobMatch.recommendations}
                  />
                </div>

                <div className="space-y-6">
                  <SkillGapChart missingSkills={analysisResult.skillGap.missingSkills} />

                  <Card>
                    <CardContent className="space-y-3 pt-6">
                      <h3 className="font-semibold">Resume Used</h3>
                      <Separator />
                      <div className="text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">
                            {analysisResult.resumeUsed.title}
                          </span>
                        </p>
                        <p className="mt-1 text-xs">
                          Analysis based on your current resume
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
