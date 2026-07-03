"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Briefcase, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"

interface JobDescriptionFormProps {
  onAnalysisComplete: (result: any) => void
}

export function JobDescriptionForm({ onAnalysisComplete }: JobDescriptionFormProps) {
  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    jobDescription: "",
    title: "",
    company: "",
    location: "",
  })

  const handleAnalyze = async () => {
    if (!formData.jobDescription.trim() || formData.jobDescription.length < 50) {
      toast({
        variant: "destructive" as any,
        title: "Invalid input",
        description: "Please paste a full job description (minimum 50 characters)",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      const res = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: formData.jobDescription }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      toast({
        variant: "success" as any,
        title: "Analysis complete!",
        description: `Match score: ${data.jobMatch.overallMatch}%`,
      })

      onAnalysisComplete({ ...data, formData })
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        variant: "destructive" as any,
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handlePasteExample = () => {
    setFormData({
      title: "Senior Frontend Developer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      jobDescription: `We are seeking a Senior Frontend Developer to join our team.

Requirements:
- 5+ years of experience in frontend development
- Expert knowledge of React, TypeScript, Next.js
- Experience with state management (Redux, Zustand)
- Strong understanding of responsive design and accessibility
- Experience with modern build tools (Webpack, Vite)
- Excellent problem-solving skills
- Strong communication and teamwork abilities

Responsibilities:
- Build and maintain scalable web applications
- Collaborate with designers and backend engineers
- Write clean, maintainable, and well-documented code
- Mentor junior developers
- Participate in code reviews

Nice to have:
- Experience with GraphQL
- Knowledge of testing frameworks (Jest, Playwright)
- Open source contributions`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle>Analyze Job Description</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handlePasteExample}>
            Load Example
          </Button>
        </div>
        <CardDescription>
          Paste a job description to see how well your resume matches and identify skill gaps
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g., Senior Developer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="e.g., Google"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Remote"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description *</Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the full job description here..."
            className="min-h-[280px] font-mono text-sm"
            value={formData.jobDescription}
            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            {formData.jobDescription.length} characters
            {formData.jobDescription.length < 50 && " (minimum 50 required)"}
          </p>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleAnalyze}
          disabled={isAnalyzing || formData.jobDescription.length < 50}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Match & Skills
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
