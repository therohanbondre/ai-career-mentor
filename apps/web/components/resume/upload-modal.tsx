"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react"

/* 
 * Architectural Decision: Upload Modal Component
 * - Drag and drop support
 * - File validation (PDF, DOCX, 10MB)
 * - Progress indicator
 * - Error handling with user feedback
 */

interface UploadModalProps {
  onUploadSuccess?: () => void
}

export function UploadModal({ onUploadSuccess }: UploadModalProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB

  const handleFileSelect = (selectedFile: File | null) => {
    setError("")
    setSuccess(false)
    
    if (!selectedFile) {
      setFile(null)
      return
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Only PDF and DOCX files are allowed")
      return
    }

    if (selectedFile.size > MAX_SIZE) {
      setError("File size must be less than 10MB")
      return
    }

    setFile(selectedFile)
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)

      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Upload failed")
        setIsUploading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setFile(null)
        setTitle("")
        setSuccess(false)
        onUploadSuccess?.()
      }, 1500)
    } catch (err) {
      setError("An error occurred during upload")
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
          <DialogDescription>
            Upload your resume in PDF or DOCX format (max 10MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const droppedFile = e.dataTransfer.files[0]
              handleFileSelect(droppedFile)
            }}
          >
            {file ? (
              <div className="space-y-2">
                <FileText className="mx-auto h-12 w-12 text-primary" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop your file here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Resume Title</Label>
            <Input
              id="title"
              placeholder="e.g., Software Engineer Resume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!file}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Resume uploaded successfully!</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || !title || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
