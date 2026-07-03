"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X, Briefcase } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"

const EMPLOYMENT_TYPES  = ["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP","FREELANCE"]
const EXPERIENCE_LEVELS = ["ENTRY_LEVEL","JUNIOR","MID_LEVEL","SENIOR","LEAD","EXECUTIVE"]

export function JobPostingForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState("")

  const [form, setForm] = useState({
    title: "", company: "", location: "", salaryRange: "",
    description: "", requirements: "", responsibilities: "", benefits: "",
    skills: [] as string[],
    employmentType: "FULL_TIME", experienceLevel: "MID_LEVEL",
    remote: false, status: "DRAFT" as "DRAFT" | "ACTIVE",
  })

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) {
      setForm((p) => ({ ...p, skills: [...p.skills, s] }))
    }
    setSkillInput("")
  }

  const removeSkill = (skill: string) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== skill) }))

  const set = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }))

  const handleSubmit = async (submitStatus: "DRAFT" | "ACTIVE") => {
    if (!form.title || !form.company || form.description.length < 50) {
      toast({ variant: "destructive" as any, title: "Please fill in all required fields (title, company, description ≥ 50 chars)" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/recruiter/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: submitStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create job")

      toast({
        variant: "success" as any,
        title: submitStatus === "ACTIVE" ? "Job published!" : "Draft saved!",
        description: `"${form.title}" at ${form.company}`,
      })
      router.push(`/dashboard/recruiter/jobs/${data.job.id}`)
    } catch (err) {
      toast({ variant: "destructive" as any, title: "Failed", description: err instanceof Error ? err.message : "Try again" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <CardTitle>Create Job Posting</CardTitle>
        </div>
        <CardDescription>Fill in the details below. You can save as draft first.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input id="title" placeholder="e.g., Senior Frontend Developer"
              value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input id="company" placeholder="e.g., Acme Corp"
              value={form.company} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g., Bangalore, India"
              value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range</Label>
            <Input id="salary" placeholder="e.g., ₹15L–₹25L"
              value={form.salaryRange} onChange={(e) => set("salaryRange", e.target.value)} />
          </div>
        </div>

        {/* Type selectors */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Employment Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMPLOYMENT_TYPES.map((t) => (
                <button key={t} type="button"
                  onClick={() => set("employmentType", t)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                    form.employmentType === t ? "border-primary bg-primary/10 font-medium text-primary" : "hover:border-primary/40"
                  }`}>
                  {t.replace("_"," ")}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCE_LEVELS.map((l) => (
                <button key={l} type="button"
                  onClick={() => set("experienceLevel", l)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                    form.experienceLevel === l ? "border-primary bg-primary/10 font-medium text-primary" : "hover:border-primary/40"
                  }`}>
                  {l.replace("_"," ")}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Remote</Label>
            <button type="button" onClick={() => set("remote", !form.remote)}
              className={`rounded-lg border px-4 py-1.5 text-sm transition-colors ${
                form.remote ? "border-primary bg-primary/10 font-medium text-primary" : "hover:border-primary/40"
              }`}>
              {form.remote ? "✓ Remote OK" : "On-site only"}
            </button>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Required Skills</Label>
          <div className="flex gap-2">
            <Input placeholder="e.g., React"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
            <Button type="button" variant="outline" size="icon" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.skills.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1 pr-1">
                  {s}
                  <button onClick={() => removeSkill(s)} className="ml-1 rounded hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Text areas */}
        {[
          { key: "description",      label: "Job Description *",    rows: 6, min: 50 },
          { key: "requirements",     label: "Requirements *",       rows: 4, min: 20 },
          { key: "responsibilities", label: "Responsibilities *",   rows: 4, min: 20 },
          { key: "benefits",         label: "Benefits (optional)",  rows: 3, min: 0  },
        ].map(({ key, label, rows, min }) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Textarea
              placeholder={`Enter ${label.replace(" *","").toLowerCase()}…`}
              className="font-mono text-sm"
              style={{ minHeight: `${rows * 24}px` }}
              value={(form as any)[key] ?? ""}
              onChange={(e) => set(key, e.target.value)}
            />
            {min > 0 && (
              <p className="text-xs text-muted-foreground">
                {((form as any)[key] ?? "").length} chars{" "}
                {((form as any)[key] ?? "").length < min && `(min ${min})`}
              </p>
            )}
          </div>
        ))}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => handleSubmit("DRAFT")} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit("ACTIVE")} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish Job
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
