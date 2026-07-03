"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck, RefreshCw, LogOut } from "lucide-react"

/*
 * Verify Notice Page
 * Shown to users whose account status is PENDING (email not yet verified).
 * Lets them request a fresh verification link without having to log out first.
 */
export default function VerifyNoticePage() {
  const { data: session } = useSession()
  const email = session?.user?.email ?? ""

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleResend = async () => {
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Request failed")
      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-3 pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <MailCheck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
            <br />
            Click the link in the email to activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {sent && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-300">
              A new verification link has been sent. Check your inbox (and spam folder).
            </div>
          )}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder, or request a new link.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={sending || sent}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${sending ? "animate-spin" : ""}`} />
            {sending ? "Sending…" : sent ? "Link sent!" : "Resend verification email"}
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
