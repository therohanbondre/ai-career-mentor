"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Briefcase, MapPin, Calendar, MoreVertical, ExternalLink, Trash2, RefreshCw } from "lucide-react"
import { format } from "date-fns"

interface SavedJob {
  id: string
  title: string
  company: string
  location?: string
  matchScore?: number
  createdAt: string
  postedAt?: string
  skills: string[]
}

export function JobHistoryList() {
  const [jobs, setJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/jobs")
      const data = await res.json()
      if (res.ok) setJobs(data.jobs ?? [])
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved job?")) return
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" })
      if (res.ok) fetchJobs()
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saved Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Saved Jobs</CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchJobs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {jobs.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Briefcase className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>No saved jobs yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Saved {format(new Date(job.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {job.matchScore !== null && job.matchScore !== undefined && (
                    <Badge
                      variant={
                        job.matchScore >= 80 ? "success" : job.matchScore >= 60 ? "warning" : "destructive"
                      }
                    >
                      {job.matchScore}% match
                    </Badge>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(job.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
