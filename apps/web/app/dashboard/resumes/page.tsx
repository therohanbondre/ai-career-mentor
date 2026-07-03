import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ResumeList } from "@/components/resume/resume-list"

/* 
 * Architectural Decision: Resumes Page
 * - Server component for performance
 * - Protected by authentication
 * - Full resume management interface
 * - Integrates all resume components
 */
export default async function ResumesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const { user } = session

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <ResumeList />
        </div>
      </main>
    </div>
  )
}
