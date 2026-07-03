"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Brain, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

/*
 * Global Error Boundary
 * Catches unhandled errors in any route segment.
 * In production, Next.js automatically shows this instead of a white screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to an error reporting service in production
    console.error("Global error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground text-sm">
              An unexpected error occurred. Our team has been notified.
              {error.digest && (
                <span className="mt-2 block font-mono text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </span>
              )}
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full gap-2" onClick={reset}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Brain className="h-4 w-4" />
                Back to home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </body>
    </html>
  )
}
