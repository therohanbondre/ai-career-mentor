"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"

/* 
 * Architectural Decision: Protected Route Component
 * - Client-side protection as additional layer
 * - Works alongside middleware for defense in depth
 * - Shows loading state while checking auth
 * - Redirects unauthenticated users
 * - Role-based access control support
 */
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, requiredRoles, fallback }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-slate-50 dark:border-t-transparent" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Redirecting to login...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check role requirements
  if (requiredRoles && session?.user && !requiredRoles.includes(session.user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
