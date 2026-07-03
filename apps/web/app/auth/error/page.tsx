"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server configuration error",
    description:
      "There is a problem with the server configuration. Please contact support.",
  },
  AccessDenied: {
    title: "Access denied",
    description:
      "You do not have permission to sign in. Your account may be suspended.",
  },
  Verification: {
    title: "Verification link expired",
    description:
      "The sign-in link has expired or has already been used. Please request a new one.",
  },
  InvalidToken: {
    title: "Invalid verification link",
    description:
      "This verification link is invalid. It may have already been used or the URL was modified.",
  },
  ExpiredToken: {
    title: "Verification link expired",
    description:
      "This verification link has expired. Links are valid for 24 hours. Request a new one below.",
  },
  MissingToken: {
    title: "Missing verification token",
    description:
      "The verification link is incomplete. Please use the full link from your email.",
  },
  VerificationFailed: {
    title: "Verification failed",
    description:
      "We couldn't verify your email. Please try again or request a new verification link.",
  },
  Default: {
    title: "Authentication error",
    description:
      "An error occurred during authentication. Please try again.",
  },
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("error") ?? "Default"
  const info = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES["Default"]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Link href="/" className="mb-8 flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">AI Career Mentor</span>
      </Link>

      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold">{info.title}</CardTitle>
          <CardDescription className="text-base">{info.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {(errorCode === "ExpiredToken" ||
            errorCode === "VerificationFailed" ||
            errorCode === "Verification") && (
            <Link href="/auth/resend-verification" className="block">
              <Button className="w-full">Request new verification email</Button>
            </Link>
          )}
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            Error code:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {errorCode}
            </code>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  )
}
