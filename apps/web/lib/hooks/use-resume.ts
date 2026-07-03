"use client"

/*
 * Architectural Decision: Resume Hook
 * - Client-side resume state management
 * - Reusable resume operations
 * - Type-safe data handling
 * - Optimistic updates for better UX
 *
 * Path corrections (M0):
 *   /api/resume/*  →  /api/resumes/*   (matches actual Next.js route folder)
 */
import { useState, useCallback } from "react"
import type { Resume, ATSScore } from "@/types"

export function useResume() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch list ────────────────────────────────────────────────────────────
  const fetchResumes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/resumes")
      if (!response.ok) throw new Error("Failed to fetch resumes")
      const data = await response.json()
      setResumes(data.resumes ?? [])
      return data.resumes as Resume[]
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Upload ────────────────────────────────────────────────────────────────
  const uploadResume = useCallback(async (file: File, title?: string) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      if (title) formData.append("title", title)

      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? "Failed to upload resume")
      }
      const data = await response.json()
      setResumes((prev) => [data.resume, ...prev])
      return data.resume as Resume
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Parse ─────────────────────────────────────────────────────────────────
  const parseResume = useCallback(async (resumeId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/resumes/${resumeId}/parse`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to parse resume")
      const data = await response.json()
      return data.parsedData
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Analyse ───────────────────────────────────────────────────────────────
  const analyzeResume = useCallback(
    async (resumeId: string, jobDescription?: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/resumes/${resumeId}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription }),
        })
        if (!response.ok) throw new Error("Failed to analyze resume")
        const data = await response.json()
        return data.analysis as ATSScore
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed")
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // ── Update metadata ───────────────────────────────────────────────────────
  const updateResume = useCallback(
    async (resumeId: string, updates: { title?: string; isPrimary?: boolean }) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/resumes/${resumeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
        if (!response.ok) throw new Error("Failed to update resume")
        const data = await response.json()
        setResumes((prev) =>
          prev.map((r) => (r.id === resumeId ? { ...r, ...data.resume } : r))
        )
        return data.resume as Resume
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed")
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteResume = useCallback(async (resumeId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete resume")
      setResumes((prev) => prev.filter((r) => r.id !== resumeId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    resumes,
    loading,
    error,
    fetchResumes,
    uploadResume,
    parseResume,
    analyzeResume,
    updateResume,
    deleteResume,
  }
}
