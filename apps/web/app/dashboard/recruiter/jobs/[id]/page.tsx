"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft, Users, MapPin, TrendingUp, Briefcase,
  Eye, Star, Calendar, ExternalLink,
} from "lucide-react"
import { format } from "date-fns"
import type { RankedApplicant } from "@/types"

const SCORE_COLOR = (s: number | null | undefined) =>
  !s ? "text-muted-foreground" :
  s >= 80 ? "text-green-600" :
  s >= 60 ? "text-yellow-600" : "text-red-600"

const SCORE_BADGE = (s: number | null | undefined) =>
  !s ? "secondary" :
  s >= 80 ? "success" :
  s >= 60 ? "warning" : "destructive"

export default function JobDetailPage() {
  const { data: session } = useSession()
  const params            = useParams()
  const router            = useRouter()
  const jobId             = params.id as string

  const [job,        setJob]        = useState<any>(null)
  const [applicants, setApplicants] = useState<RankedApplicant[]>([])
  const [loading,    setLoading]    = useState(true)
  const [comparing,  setComparing]  = useState<string[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [jobRes, appRes] = await Promise.all([
        fetch(`/api/recruiter/jobs/${jobId}`),
        fetch(`/api/recruiter/jobs/${jobId}/applicants`),
      ])
      const jobData = await jobRes.json()
      const appData = await appRes.json()
      if (jobRes.ok)  setJob(jobData.job)
      if (appRes.ok)  setApplicants(appData.applicants ?? [])
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleCompare = (userId: string) => {
    setComparing((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : prev.length < 2 ? [...prev, userId] : prev
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar user={session?.user} />
        <main className="flex-1 p-6 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
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
          <div className="flex items-center gap-3">
            <Link href="/dashboard/recruiter/jobs">
              <Button variant="ghost" size="icon" aria-label="Back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{job?.title}</h1>
                {job?.status && (
                  <Badge variant={job.status === "ACTIVE" ? "success" : "secondary"}>
                    {job.status}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{job?.company}{job?.location && ` · ${job.location}`}</p>
            </div>
          </div>

          {/* Job stats */}
          {job && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Users,      label: "Applicants",    value: job.applicantCount ?? 0     },
                { icon: TrendingUp, label: "Avg Match",     value: job.averageMatchScore ? `${job.averageMatchScore}%` : "—" },
                { icon: Calendar,   label: "Posted",        value: job.postedAt ? format(new Date(job.postedAt), "MMM d, yyyy") : "Draft" },
              ].map(({ icon: Icon, label, value }) => (
                <Card key={label}>
                  <CardContent className="flex items-center gap-3 py-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Compare banner */}
          {comparing.length === 2 && (
            <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium">
                2 candidates selected for comparison
              </p>
              <Link href={`/dashboard/recruiter/candidates?compare=${comparing.join(",")}`}>
                <Button size="sm" className="gap-2">
                  <Star className="h-4 w-4" />
                  Compare Side by Side
                </Button>
              </Link>
            </div>
          )}

          {/* Applicant table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Applicants ({applicants.length}) — Ranked by Match Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applicants.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="mx-auto mb-3 h-12 w-12 opacity-40" />
                  <p>No applicants yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Candidate</th>
                        <th className="pb-3 pr-4 font-medium">Match</th>
                        <th className="pb-3 pr-4 font-medium">ATS Score</th>
                        <th className="pb-3 pr-4 font-medium">Status</th>
                        <th className="pb-3 pr-4 font-medium">Applied</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {applicants.map((app, idx) => (
                        <tr key={app.applicationId} className="hover:bg-accent/30 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                {idx < 3 && (
                                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                                    {idx + 1}
                                  </span>
                                )}
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={app.candidateAvatar ?? undefined} />
                                  <AvatarFallback className="text-xs">
                                    {app.candidateName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div>
                                <p className="font-medium leading-tight">{app.candidateName}</p>
                                <p className="text-xs text-muted-foreground">{app.candidateEmail}</p>
                                {app.location && (
                                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />{app.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-lg font-bold ${SCORE_COLOR(app.matchScore)}`}>
                              {app.matchScore ?? "—"}
                              {app.matchScore ? "%" : ""}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            {app.atsScore !== null && app.atsScore !== undefined ? (
                              <Badge variant={SCORE_BADGE(app.atsScore) as any} className="text-xs">
                                {app.atsScore}%
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not analysed</span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant="secondary" className="text-xs">
                              {app.applicationStatus.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground text-xs">
                            {app.submittedAt
                              ? format(new Date(app.submittedAt), "MMM d, yyyy")
                              : "—"}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <Link href={`/dashboard/recruiter/candidates/${app.userId}`}>
                                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </Button>
                              </Link>
                              <Button
                                variant={comparing.includes(app.userId) ? "default" : "ghost"}
                                size="sm"
                                className="h-7 gap-1 text-xs"
                                onClick={() => toggleCompare(app.userId)}
                                disabled={!comparing.includes(app.userId) && comparing.length >= 2}
                              >
                                <Star className="h-3.5 w-3.5" />
                                {comparing.includes(app.userId) ? "Selected" : "Compare"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills required */}
          {job?.skills?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
