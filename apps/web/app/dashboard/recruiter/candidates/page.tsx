"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Users, Search, Eye, MapPin, Briefcase, Star, TrendingUp, X } from "lucide-react"
import type { CandidateProfile } from "@/types"

function CandidatesContent() {
  const { data: session } = useSession()
  const searchParams      = useSearchParams()
  const compareIds        = searchParams.get("compare")?.split(",").filter(Boolean) ?? []

  const [candidates, setCandidates] = useState<CandidateProfile[]>([])
  const [loading,    setLoading]    = useState(false)
  const [search,     setSearch]     = useState("")

  // Load comparison candidates if IDs provided
  const fetchCompareCandidates = useCallback(async () => {
    if (!compareIds.length) return
    setLoading(true)
    try {
      const results = await Promise.all(
        compareIds.map((id) =>
          fetch(`/api/recruiter/candidates/${id}`).then((r) => r.json())
        )
      )
      setCandidates(results.filter((r) => r.success).map((r) => r.candidate))
    } finally {
      setLoading(false)
    }
  }, [compareIds.join(",")])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchCompareCandidates() }, [fetchCompareCandidates])

  const isCompareMode = compareIds.length > 0

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isCompareMode ? "Candidate Comparison" : "Candidates"}
              </h1>
              <p className="text-muted-foreground">
                {isCompareMode
                  ? "Side-by-side comparison of selected candidates"
                  : "View and compare candidates who applied to your jobs"}
              </p>
            </div>
            {isCompareMode && (
              <Link href="/dashboard/recruiter/candidates">
                <Button variant="outline" className="gap-2">
                  <X className="h-4 w-4" />
                  Exit comparison
                </Button>
              </Link>
            )}
          </div>

          {/* Compare mode — side by side */}
          {isCompareMode ? (
            loading ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {candidates.map((c) => {
                  const name = c.profile?.displayName
                    ?? `${c.profile?.firstName ?? ""} ${c.profile?.lastName ?? ""}`.trim()
                    || c.email
                  const bestResume = c.resumes?.[0]

                  return (
                    <Card key={c.id} className="border-primary/20">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={c.profile?.avatar ?? undefined} />
                            <AvatarFallback className="text-lg font-bold">
                              {name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h2 className="text-xl font-bold">{name}</h2>
                            <p className="text-sm text-muted-foreground">{c.email}</p>
                            {c.profile?.location && (
                              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {c.profile.location}
                              </p>
                            )}
                          </div>
                          <Link href={`/dashboard/recruiter/candidates/${c.id}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              Full Profile
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <Separator />

                        {/* Key stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-muted/50 p-3 text-center">
                            <p className="text-2xl font-bold text-primary">
                              {bestResume?.atsScore ?? "—"}
                              {bestResume?.atsScore ? "%" : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">ATS Score</p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-3 text-center">
                            <p className="text-lg font-bold">
                              {c.profile?.experienceLevel?.replace("_", " ") ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">Experience</p>
                          </div>
                        </div>

                        {/* Resumes */}
                        <div>
                          <p className="mb-2 text-sm font-semibold">
                            Resumes ({c.resumes?.length ?? 0})
                          </p>
                          {c.resumes?.slice(0, 2).map((r) => (
                            <div key={r.id} className="flex items-center justify-between rounded-lg border p-2 mb-1.5">
                              <span className="text-sm truncate">{r.title}</span>
                              {r.atsScore && (
                                <Badge variant={r.atsScore >= 80 ? "success" : r.atsScore >= 60 ? "warning" : "destructive"} className="text-xs">
                                  {r.atsScore}%
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Target role */}
                        {c.profile?.targetRole && (
                          <div>
                            <p className="text-sm font-semibold mb-1">Target Role</p>
                            <p className="text-sm text-muted-foreground">{c.profile.targetRole}</p>
                          </div>
                        )}

                        {/* Bio */}
                        {c.profile?.bio && (
                          <div>
                            <p className="text-sm font-semibold mb-1">About</p>
                            <p className="text-sm text-muted-foreground line-clamp-3">{c.profile.bio}</p>
                          </div>
                        )}

                        {/* Links */}
                        <div className="flex gap-2 flex-wrap">
                          {c.profile?.linkedinUrl && (
                            <a href={c.profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                LinkedIn
                              </Button>
                            </a>
                          )}
                          {c.profile?.githubUrl && (
                            <a href={c.profile.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                GitHub
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )
          ) : (
            /* Browse mode */
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-40" />
                <h3 className="text-lg font-semibold">Find candidates via job applicants</h3>
                <p className="mt-2 max-w-sm mx-auto text-sm text-muted-foreground">
                  Open any of your job postings, then click View on an applicant to see their full profile,
                  or select two candidates to compare them side by side.
                </p>
                <Link href="/dashboard/recruiter/jobs">
                  <Button className="mt-6 gap-2">
                    <Briefcase className="h-4 w-4" />
                    View My Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function CandidatesPage() {
  return (
    <Suspense>
      <CandidatesContent />
    </Suspense>
  )
}
