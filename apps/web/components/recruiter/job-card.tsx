"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MapPin, Users, MoreVertical, Edit, Trash2, Eye, TrendingUp, Clock, Globe } from "lucide-react"
import { format } from "date-fns"
import type { RecruiterJob } from "@/types"

interface JobCardProps {
  job: RecruiterJob
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

const STATUS_STYLES: Record<string, { variant: any; label: string }> = {
  DRAFT:    { variant: "secondary",    label: "Draft"    },
  ACTIVE:   { variant: "success",      label: "Active"   },
  CLOSED:   { variant: "outline",      label: "Closed"   },
  FILLED:   { variant: "default",      label: "Filled"   },
  ARCHIVED: { variant: "destructive",  label: "Archived" },
}

export function JobCard({ job, onDelete, onStatusChange }: JobCardProps) {
  const ss = STATUS_STYLES[job.status] ?? STATUS_STYLES.DRAFT

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant={ss.variant}>{ss.label}</Badge>
              {job.remote && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Globe className="h-3 w-3" /> Remote
                </Badge>
              )}
              {job.employmentType && (
                <span className="text-xs text-muted-foreground">
                  {job.employmentType.replace("_", " ")}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> View applicants
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/recruiter/jobs/${job.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              {job.status === "DRAFT" && (
                <DropdownMenuItem onClick={() => onStatusChange(job.id, "ACTIVE")}>
                  <TrendingUp className="mr-2 h-4 w-4 text-green-600" /> Publish
                </DropdownMenuItem>
              )}
              {job.status === "ACTIVE" && (
                <DropdownMenuItem onClick={() => onStatusChange(job.id, "CLOSED")}>
                  <Clock className="mr-2 h-4 w-4" /> Close
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(job.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats row */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span><strong className="text-foreground">{job.applicantCount ?? 0}</strong> applicants</span>
          </div>
          {job.averageMatchScore !== null && job.averageMatchScore !== undefined && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Avg match: <strong className="text-foreground">{job.averageMatchScore}%</strong></span>
            </div>
          )}
          {job.location && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 5).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="outline" className="text-xs">+{job.skills.length - 5}</Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {job.postedAt
              ? `Posted ${format(new Date(job.postedAt), "MMM d, yyyy")}`
              : `Created ${format(new Date(job.createdAt), "MMM d, yyyy")}`}
          </span>
          <Link href={`/dashboard/recruiter/jobs/${job.id}`}>
            <Button size="sm" variant="outline" className="h-7 text-xs">
              View applicants →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
