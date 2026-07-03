"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Sidebar } from "@/components/dashboard/sidebar"
import { JobCard } from "@/components/recruiter/job-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Briefcase, Users, TrendingUp, FileText } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import type { RecruiterJob } from "@/types"

export default function RecruiterDashboardPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [jobs,    setJobs]    = useState<RecruiterJob[]>([])
  const [loading, setLoading] = useState(true)
  const [stats,   setStats]   = useState({
    total: 0, active: 0, totalApplicants: 0, avgMatch: 0,
  })

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/recruiter/jobs?limit=6")
      const data = await res.json()
      if (res.ok) {
        const list: RecruiterJob[] = data.jobs ?? []
        setJobs(list)
        setStats({
          total:           data.pagination?.total ?? list.length,
          active:          list.filter((j) => j.status === "ACTIVE").length,
          totalApplicants: list.reduce((s, j) => s + (j.applicantCount ?? 0), 0),
          avgMatch:        (() => {
            const scores = list
              .filter((j) => j.averageMatchScore !== null)
              .map((j) => j.averageMatchScore ?? 0)
            return scores.length
              ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
              : 0
          })(),
        })
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job? This cannot be undone.")) return
    const res = await fetch(`/api/recruiter/jobs/${id}`, { method: "DELETE" })
    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j.id !== id))
      toast({ variant: "success" as any, title: "Job deleted" })
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/recruiter/jobs/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    })
    if (res.ok) {
      setJobs((prev) =>
        prev.map((j) => j.id === id ? { ...j, status: status as any } : j)
      )
      toast({ variant: "success" as any, title: `Job ${status === "ACTIVE" ? "published" : "closed"}` })
    }
  }

  const statCards = [
    { label: "Total Jobs",      value: stats.total,           icon: Briefcase,   color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-900/30"   },
    { label: "Active Jobs",     value: stats.active,          icon: TrendingUp,  color: "text-green-600",  bg: "bg-green-100 dark:bg-green-900/30"  },
    { label: "Total Applicants",value: stats.totalApplicants, icon: Users,       color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30"},
    { label: "Avg Match Score", value: `${stats.avgMatch}%`,  icon: FileText,    color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30"},
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your job postings and find the best candidates
              </p>
            </div>
            <Link href="/dashboard/recruiter/jobs/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Post a Job
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4 py-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent jobs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Jobs</h2>
              <Link href="/dashboard/recruiter/jobs">
                <Button variant="outline" size="sm">View all →</Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Briefcase className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-40" />
                  <h3 className="text-lg font-semibold">No jobs yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first job posting to start receiving applications
                  </p>
                  <Link href="/dashboard/recruiter/jobs/new">
                    <Button className="mt-5 gap-2">
                      <Plus className="h-4 w-4" />
                      Post a Job
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
