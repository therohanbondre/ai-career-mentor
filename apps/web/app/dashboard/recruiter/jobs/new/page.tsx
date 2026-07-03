"use client"

import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { JobPostingForm } from "@/components/recruiter/job-posting-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewJobPage() {
  const { data: session } = useSession()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-3xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/recruiter/jobs">
              <Button variant="ghost" size="icon" aria-label="Back to jobs">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Post a Job</h1>
              <p className="text-muted-foreground">
                Create a new job posting and start receiving applications
              </p>
            </div>
          </div>

          <JobPostingForm />
        </div>
      </main>
    </div>
  )
}
