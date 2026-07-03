"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Sidebar } from "@/components/dashboard/sidebar"
import { JobCard } from "@/components/recruiter/job-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Briefcase, Search, RefreshCw } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import type { RecruiterJob } from "@/types"

const STATUS_FILTERS = [
  { label: "All",      value: ""          },
  { label: "Active",   value: "ACTIVE"    },
  { label: "Draft",    value: "DRAFT"     },
  { label: "Closed",   value: "CLOSED"    },
  { label: "Filled",   value: "FILLED"    },
  { label: "Archived", value: "ARCHIVED"  },
]

export default function RecruiterJobsPage() {
  const { data: session } = useSession()
  const { toast }         = useToast()

  const [jobs,        setJobs]        = useState<RecruiterJob[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState("")
  const [statusFilter,setStatusFilter]= useState("")
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const LIMIT = 12

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (statusFilter) params.set("status", statusFilter)
      const res  = await fetch(`/api/recruiter/jobs?${params}`)
      const data = await res.json()
      if (res.ok) {
        setJobs(data.jobs ?? [])
        setTotalPages(data.pagination?.totalPages ?? 1)
      }
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchJobs() }, [fetchJobs])
  useEffect(() => { setPage(1) }, [statusFilter])

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
    }
  }

  const filtered = jobs.filter((j) =>
    !search ||
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>
              <p className="text-muted-foreground">
                Manage all your job postings
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={fetchJobs} aria-label="Refresh">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Link href="/dashboard/recruiter/jobs/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <Button
                  key={f.value}
                  size="sm"
                  variant={statusFilter === f.value ? "default" : "outline"}
                  onClick={() => setStatusFilter(f.value)}
                  className="h-9"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Briefcase className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-40" />
                <h3 className="text-lg font-semibold">
                  {search ? "No jobs match your search" : "No jobs yet"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search ? "Try a different search term" : "Create your first job posting"}
                </p>
                {!search && (
                  <Link href="/dashboard/recruiter/jobs/new">
                    <Button className="mt-5 gap-2">
                      <Plus className="h-4 w-4" />
                      Post a Job
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
