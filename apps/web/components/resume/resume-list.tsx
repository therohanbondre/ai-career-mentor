"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, MoreVertical, Eye, Trash2, RefreshCw, Star } from "lucide-react"
import { UploadModal } from "./upload-modal"
import { PreviewModal } from "./preview-modal"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { ReplaceModal } from "./replace-modal"

/* 
 * Architectural Decision: Resume List Component
 * - Lists all user resumes
 * - Shows metadata (title, date, size, ATS score)
 * - Quick actions (view, delete, replace, set primary)
 * - Loading and error states
 * - Refresh functionality
 */

interface Resume {
  id: string
  title: string
  originalFileName: string
  fileSize: number
  createdAt: string
  updatedAt: string
  isPrimary: boolean
  atsScore?: number
}

export function ResumeList() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [previewResume, setPreviewResume] = useState<Resume | null>(null)
  const [deleteResume, setDeleteResume] = useState<Resume | null>(null)
  const [replaceResume, setReplaceResume] = useState<Resume | null>(null)

  const fetchResumes = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/resumes")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch resumes")
      }

      setResumes(data.resumes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch resumes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const handleSetPrimary = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to set primary resume")
      }

      fetchResumes()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set primary resume")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">My Resumes</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={fetchResumes} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <UploadModal onUploadSuccess={fetchResumes} />
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first resume to get started with AI-powered analysis
            </p>
            <UploadModal onUploadSuccess={fetchResumes} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base font-medium line-clamp-1">
                    {resume.title}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPreviewResume(resume)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setReplaceResume(resume)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Replace
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSetPrimary(resume.id)}>
                      <Star className="mr-2 h-4 w-4" />
                      Set as Primary
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteResume(resume)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Size</span>
                    <span className="font-medium">{formatFileSize(resume.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{formatDate(resume.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ATS Score</span>
                    {resume.atsScore !== undefined ? (
                      <Badge
                        variant={resume.atsScore >= 80 ? "success" : resume.atsScore >= 60 ? "warning" : "destructive"}
                      >
                        {resume.atsScore}%
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                  {resume.isPrimary && (
                    <Badge variant="default" className="w-fit">
                      <Star className="mr-1 h-3 w-3" />
                      Primary
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {previewResume && (
        <PreviewModal
          resume={previewResume}
          open={!!previewResume}
          onOpenChange={() => setPreviewResume(null)}
        />
      )}

      {deleteResume && (
        <DeleteConfirmDialog
          resume={deleteResume}
          open={!!deleteResume}
          onOpenChange={() => setDeleteResume(null)}
          onSuccess={fetchResumes}
        />
      )}

      {replaceResume && (
        <ReplaceModal
          resume={replaceResume}
          open={!!replaceResume}
          onOpenChange={() => setReplaceResume(null)}
          onSuccess={fetchResumes}
        />
      )}
    </div>
  )
}
