"use client"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { CoverLetterForm } from "@/components/cover-letter/cover-letter-form"
import { CoverLetterEditor } from "@/components/cover-letter/cover-letter-editor"
import { CoverLetterList } from "@/components/cover-letter/cover-letter-list"
import { Button } from "@/components/ui/button"
import { PenLine, ArrowLeft, Loader2 } from "lucide-react"
import type { CoverLetter } from "@/types"

type View = "hub" | "editor"

export default function CoverLetterPage() {
  const { data: session } = useSession()

  const [view,          setView]          = useState<View>("hub")
  const [activeLetter,  setActiveLetter]  = useState<(CoverLetter & { highlights?: string[]; subject?: string }) | null>(null)
  const [loadingLetter, setLoadingLetter] = useState(false)
  const [refreshTick,   setRefreshTick]   = useState(0)

  // Called when the form generates a new letter
  const handleGenerated = useCallback(
    (letter: CoverLetter & { highlights: string[]; subject: string }) => {
      setActiveLetter(letter)
      setView("editor")
      setRefreshTick((t) => t + 1)
    },
    []
  )

  // Called when a saved letter is selected from the list
  const handleSelectSaved = useCallback(async (id: string) => {
    setLoadingLetter(true)
    try {
      const res  = await fetch(`/api/cover-letter/${id}`)
      const data = await res.json()
      if (res.ok) {
        setActiveLetter(data.coverLetter)
        setView("editor")
      }
    } finally {
      setLoadingLetter(false)
    }
  }, [])

  const handleSaved = useCallback((updated: CoverLetter) => {
    setActiveLetter((prev) => prev ? { ...prev, ...updated } : prev)
    setRefreshTick((t) => t + 1)
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view === "editor" && (
                <Button variant="ghost" size="icon" onClick={() => setView("hub")} aria-label="Back">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Cover Letter</h1>
                <p className="text-muted-foreground">
                  AI-crafted cover letters tailored to every job application
                </p>
              </div>
            </div>

            {view === "editor" && (
              <Button variant="outline" onClick={() => { setActiveLetter(null); setView("hub") }}>
                <PenLine className="mr-2 h-4 w-4" />
                New Letter
              </Button>
            )}
          </div>

          {loadingLetter ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : view === "hub" ? (
            /* ── Hub: form + list side by side ── */
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <CoverLetterForm onGenerated={handleGenerated} />
              </div>
              <div className="lg:col-span-2">
                <CoverLetterList
                  onSelect={handleSelectSaved}
                  refreshTrigger={refreshTick}
                />
              </div>
            </div>
          ) : activeLetter ? (
            /* ── Editor view ── */
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <CoverLetterEditor
                  letter={activeLetter}
                  onSaved={handleSaved}
                />
              </div>
              <div className="lg:col-span-2">
                <CoverLetterList
                  onSelect={handleSelectSaved}
                  selectedId={activeLetter.id}
                  refreshTrigger={refreshTick}
                />
              </div>
            </div>
          ) : null}

        </div>
      </main>
    </div>
  )
}
