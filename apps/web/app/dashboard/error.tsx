"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

/*
 * Dashboard Error Boundary
 * Scoped to /dashboard/** routes — the sidebar stays mounted,
 * only the main content area shows this error state.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-bold">Page error</CardTitle>
          <CardDescription>
            This page ran into a problem. Your data is safe — try refreshing.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full gap-2" onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Back to dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
