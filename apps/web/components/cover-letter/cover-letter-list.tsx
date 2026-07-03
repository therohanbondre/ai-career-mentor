"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  PenLine, MoreVertical, Trash2, Eye, Sparkles, RefreshCw, Building2,
} from "lucide-react"
import { format } from "date-fns"
import type { CoverLetter } from "@/types"

interface CoverLetterWithPreview extends Omit<CoverLetter, "content"> {
  preview?: string
}

interface CoverLetterListProps {
  onSelect: (id: string) => void
  selectedId?: string
  refreshTrigger?: number
}

const TONE_COLORS: Record<string, string> = {
  PROFESSIONAL:   "bg-blue-100   text-blue-700   dark:bg-blue-900/30  dark:text-blue-400",
  CONVERSATIONAL: "bg-green-100  text-green-700  dark:bg-green-900/30 dark:text-green-400",
  ENTHUSIASTIC:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  FORMAL:         "bg-slate-100  text-slate-700  dark:bg-slate-900/30 dark:text-slate-400",
}

export function CoverLetterList({ onSelect, selectedId, refreshTrigger }: CoverLetterListProps) {
  const [letters,  setLetters]  = useState<CoverLetterWithPreview[]>([])
  const [loading,  setLoading]  = useState(true)

  const fetchLetters = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/cover-letters?limit=30")
      const data = await res.json()
      if (res.ok) setLetters(data.coverLetters ?? [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLetters() }, [fetchLetters, refreshTrigger])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this cover letter?")) return
    const res = await fetch(`/api/cover-letter/${id}`, { method: "DELETE" })
    if (res.ok) {
      setLetters((prev) => prev.filter((l) => l.id !== id))
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Saved Cover Letters</CardTitle></CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Saved Cover Letters</CardTitle>
          <Button variant="ghost" size="icon" onClick={fetchLetters} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {letters.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <PenLine className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p>No cover letters yet</p>
            <p className="mt-1 text-sm">Generate your first one using the form</p>
          </div>
        ) : (
          <div className="space-y-2">
            {letters.map((letter) => (
              <button
                key={letter.id}
                onClick={() => onSelect(letter.id)}
                className={`group w-full rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                  selectedId === letter.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/40 hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-sm">{letter.title}</p>
                      {letter.aiGenerated && (
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3" /> AI
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {letter.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />{letter.company}
                        </span>
                      )}
                      <span>{format(new Date(letter.createdAt), "MMM d, yyyy")}</span>
                      {letter.wordCount && <span>{letter.wordCount} words</span>}
                    </div>

                    {letter.preview && (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {letter.preview}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_COLORS[letter.tone] ?? ""}`}>
                        {letter.tone.charAt(0) + letter.tone.slice(1).toLowerCase()}
                      </span>
                      <Badge
                        variant={letter.status === "FINAL" ? "success" : letter.status === "ARCHIVED" ? "outline" : "secondary"}
                        className="text-xs"
                      >
                        {letter.status.charAt(0) + letter.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(letter.id) }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDelete(letter.id, e)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
