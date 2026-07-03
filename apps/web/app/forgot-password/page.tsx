"use client"

import { useState } from "react"
import Link from "next/link"
import { Brain, AlertCircle, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message || "Something went wrong. Please try again.")
        setIsLoading(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">AI Career Mentor</span>
      </Link>

      <Card className="w-full max-w-md">
        {submitted ? (
          <>
            <CardHeader className="items-center space-y-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Mail className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Check your inbox</CardTitle>
              <CardDescription>
                If an account exists for{" "}
                <span className="font-medium text-foreground">{email}</span>, a
                reset link has been sent. It expires in 1 hour.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
                Don&apos;t see it? Check your spam or junk folder.
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSubmitted(false)
                  setEmail("")
                }}
              >
                Try a different email
              </Button>
            </CardContent>
            <CardFooter className="justify-center">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Forgot your password?</CardTitle>
              <CardDescription>
                No worries — enter your email and we&apos;ll send you a reset link.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending…
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
