"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Download, ExternalLink } from "lucide-react"

/* 
 * Architectural Decision: Preview Modal Component
 * - Preview resume files in browser
 * - Support PDF and DOCX
 * - Download option
 * - Open in new tab option
 * - Loading and error states
 */

interface Resume {
  id: string
  title: string
  originalFileName: string
}

interface PreviewModalProps {
  resume: Resume
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewModal({ resume, open, onOpenChange }: PreviewModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    if (open) {
      setLoading(true)
      setError("")
      setPreviewUrl(`/api/resumes/${resume.id}/preview`)
      setLoading(false)
    }
  }, [open, resume.id])

  const handleDownload = () => {
    window.open(previewUrl, "_blank")
  }

  const handleOpenNewTab = () => {
    window.open(previewUrl, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{resume.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-600">
              {error}
            </div>
          ) : (
            <div className="flex-1 bg-muted rounded-lg overflow-hidden">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title={resume.title}
                onLoad={() => setLoading(false)}
                onError={() => {
                  setError("Failed to load preview")
                  setLoading(false)
                }}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" onClick={handleOpenNewTab}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
