"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, FileText, PenLine } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import type { CoverLetterTone, CoverLetter } from "@/types"

const TONES: { value: CoverLetterTone; label: string; description: string }[] = [
  { value: "PROFESSIONAL",   label: "Professional",   description: "Polished & corporate" },
  { value: "CONVERSATIONAL", label: "Conversational", description: "Warm & approachable"  },
  { value: "ENTHUSIASTIC",   label: "Enthusiastic",   description: "Energetic & passionate" },
  { value: "FORMAL",         label: "Formal",         description: "Traditional & conservative" },
]

interface CoverLetterFormProps {
  onGenerated: (letter: CoverLetter & { highlights: string[]; subject: string }) => void
}

export function CoverLetterForm({ onGenerated }: CoverLetterFormProps) {
  const { toast } = useToast()
  const [resumes, setResumes] = useState<{ id: string; title: string; isPrimary: boolean }[]>([])
  const [jobs, setJobs]       = useState<{ id: string; title: string; company: string }[]>([])
  const [generating, setGenerating] = useState(false)

  const [form, setForm] = useState({
    jobTitle:       "",
    company:        "",
    jobDescription: "",
    tone:           "PROFESSIONAL" as CoverLetterTone,
    resumeId:       "",
    jobDescriptionId: "",
  })

  // Load user's resumes and saved jobs for pickers
  useEffect(() => {
    fetch("/api/resumes?limit=20&status=ACTIVE")
      .then((r) => r.json())
      .then((d) => setResumes(d.resumes ?? []))
      .catch(() => {})

    fetch("/api/jobs?limit=20")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))
      .catch(() => {})
  }, [])

  // Auto-fill job fields when a saved job is picked
  const handleJobPick = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return
    setForm((prev) => ({
      ...prev,
      jobDescriptionId: jobId,
      jobTitle:  prev.jobTitle  || job.title,
      company:   prev.company   || job.company,
    }))
  }

  const handleGenerate = async () => {
    if (!form.jobTitle || !form.company || form.jobDescription.length < 50) {
      toast({
        variant: "destructive" as any,
        title: "Missing information",
        description: "Please fill in job title, company and a job description (min 50 chars).",
      })
      return
    }

    setGenerating(true)
    try {
      const res = await fetch("/api/cover-letter/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle:        form.jobTitle,
          company:         form.company,
          jobDescription:  form.jobDescription,
          tone:            form.tone,
          resumeId:        form.resumeId   || undefined,
          jobDescriptionId: form.jobDescriptionId || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Generation failed")

      toast({ variant: "success" as any, title: "Cover letter generated!" })
      onGenerated(data.coverLetter)
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-primary" />
          <CardTitle>Generate Cover Letter</CardTitle>
        </div>
        <CardDescription>
          Fill in the job details and let AI craft a personalised cover letter from your resume
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Resume picker */}
        {resumes.length > 0 && (
          <div className="space-y-2">
            <Label>Resume to use</Label>
            <div className="flex flex-wrap gap-2">
              {resumes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, resumeId: r.id }))}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    form.resumeId === r.id
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {r.title}
                  {r.isPrimary && (
                    <Badge variant="secondary" className="ml-1 text-xs py-0">Primary</Badge>
                  )}
                </button>
              ))}
            </div>
            {!form.resumeId && (
              <p className="text-xs text-muted-foreground">
                No resume selected — will use your primary resume automatically
              </p>
            )}
          </div>
        )}

        {/* Saved jobs shortcut */}
        {jobs.length > 0 && (
          <div className="space-y-2">
            <Label>Quick-fill from saved job</Label>
            <div className="flex flex-wrap gap-2">
              {jobs.slice(0, 5).map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => handleJobPick(j.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    form.jobDescriptionId === j.id
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  {j.title} @ {j.company}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Job fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Senior Frontend Developer"
              value={form.jobTitle}
              onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              placeholder="e.g., Google"
              value={form.company}
              onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            />
          </div>
        </div>

        {/* JD textarea */}
        <div className="space-y-2">
          <Label htmlFor="jd">Job Description *</Label>
          <Textarea
            id="jd"
            placeholder="Paste the full job description here..."
            className="min-h-[160px] font-mono text-sm"
            value={form.jobDescription}
            onChange={(e) => setForm((p) => ({ ...p, jobDescription: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            {form.jobDescription.length} chars
            {form.jobDescription.length < 50 && form.jobDescription.length > 0 && " (min 50)"}
          </p>
        </div>

        {/* Tone selector */}
        <div className="space-y-2">
          <Label>Tone</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, tone: t.value }))}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  form.tone === t.value
                    ? "border-primary bg-primary/10"
                    : "hover:border-primary/40 hover:bg-accent"
                }`}
              >
                <p className={`text-sm font-semibold ${form.tone === t.value ? "text-primary" : ""}`}>
                  {t.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" />Generate Cover Letter</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
