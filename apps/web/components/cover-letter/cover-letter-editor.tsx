"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Copy, Check, Save, Mail, Sparkles,
  FileCheck2, Archive, ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/lib/hooks/use-toast"
import type { CoverLetter, CoverLetterStatus } from "@/types"

interface CoverLetterEditorProps {
  letter: CoverLetter & { highlights?: string[]; subject?: string }
  onSaved?: (updated: CoverLetter) => void
}

const STATUS_LABELS: Record<CoverLetterStatus, string> = {
  DRAFT:    "Draft",
  FINAL:    "Final",
  ARCHIVED: "Archived",
}

const STATUS_VARIANTS: Record<CoverLetterStatus, "secondary" | "success" | "outline"> = {
  DRAFT:    "secondary",
  FINAL:    "success",
  ARCHIVED: "outline",
}

export function CoverLetterEditor({ letter, onSaved }: CoverLetterEditorProps) {
  const { toast } = useToast()
  const [content,  setContent]  = useState(letter.content)
  const [status,   setStatus]   = useState<CoverLetterStatus>(letter.status)
  const [copied,   setCopied]   = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [isDirty,  setIsDirty]  = useState(false)

  // Track unsaved edits
  useEffect(() => {
    setIsDirty(content !== letter.content || status !== letter.status)
  }, [content, status, letter.content, letter.status])

  const wordCount = content.split(/\s+/).filter(Boolean).length

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ variant: "success" as any, title: "Copied to clipboard!" })
    } catch {
      toast({ variant: "destructive" as any, title: "Copy failed" })
    }
  }

  const handleCopyEmail = async () => {
    const subject = letter.subject ?? `Application for ${letter.jobTitle} at ${letter.company}`
    const body    = `Subject: ${subject}\n\n${content}`
    try {
      await navigator.clipboard.writeText(body)
      toast({ variant: "success" as any, title: "Copied with subject line!" })
    } catch {
      toast({ variant: "destructive" as any, title: "Copy failed" })
    }
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/cover-letter/${letter.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Save failed")

      toast({ variant: "success" as any, title: "Saved!" })
      setIsDirty(false)
      onSaved?.(data.coverLetter)
    } catch (err) {
      toast({
        variant:     "destructive" as any,
        title:       "Save failed",
        description: err instanceof Error ? err.message : "Please try again",
      })
    } finally {
      setSaving(false)
    }
  }, [content, status, letter.id, onSaved, toast])

  const handleStatusChange = (newStatus: CoverLetterStatus) => {
    setStatus(newStatus)
    setIsDirty(true)
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate text-lg">{letter.title}</CardTitle>
            {letter.subject && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{letter.subject}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Badge variant={STATUS_VARIANTS[status]} className="text-xs">
                    {STATUS_LABELS[status]}
                  </Badge>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange("DRAFT")}>
                  <FileCheck2 className="mr-2 h-4 w-4" />
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("FINAL")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Final
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("ARCHIVED")}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {letter.aiGenerated && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                AI
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="flex flex-col gap-4 pt-4 flex-1">
        {/* Highlights */}
        {letter.highlights && letter.highlights.length > 0 && (
          <div className="rounded-lg bg-primary/5 p-3 space-y-1.5">
            <p className="text-xs font-semibold text-primary">Key highlights</p>
            <ul className="space-y-1">
              {letter.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 text-primary">•</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Editor */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Edit your cover letter below</span>
            <span className={wordCount > 400 ? "text-orange-500" : ""}>
              {wordCount} words
              {wordCount > 400 && " (consider trimming)"}
            </span>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[380px] resize-y font-serif text-[15px] leading-relaxed"
            placeholder="Your cover letter will appear here…"
          />
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            onClick={handleSave}
            disabled={saving || !isDirty}
            size="sm"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : isDirty ? "Save changes" : "Saved"}
          </Button>

          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>

          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyEmail}>
            <Mail className="h-4 w-4" />
            Copy with subject
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
