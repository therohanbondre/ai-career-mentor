"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Brain, AlertCircle, CheckCircle2, Github } from "lucide-react"
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
import { useToast } from "@/lib/hooks/use-toast"

/* ─── Google icon ─────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

/* ─── Inner page (uses useSearchParams — must be inside Suspense) ─────────── */
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const justRegistered = searchParams.get("registered") === "true"
  const justVerified = searchParams.get("verified") === "true"

  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })

  useEffect(() => {
    if (justRegistered) {
      toast({
        variant: "success" as any,
        title: "Account created!",
        description: "Check your email to verify your account before signing in.",
      })
    }
    if (justVerified) {
      toast({
        variant: "success" as any,
        title: "Email verified!",
        description: "Your account is now active. Sign in to get started.",
      })
    }
  }, [justRegistered, justVerified]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider)
    setError("")
    try {
      await signIn(provider, { callbackUrl })
    } catch {
      setError(`Failed to sign in with ${provider}`)
      setOauthLoading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
        setIsLoading(false)
        return
      }

      toast({ variant: "success" as any, title: "Welcome back!" })
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const anyLoading = isLoading || !!oauthLoading

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel (desktop) ──────────────────────────────────────── */}
      <div className="hidden flex-col justify-between bg-muted/40 p-12 lg:flex lg:w-1/2">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">AI Career Mentor</span>
        </Link>
        <blockquote className="space-y-4">
          <p className="text-xl font-medium leading-relaxed text-foreground">
            &ldquo;My ATS score went from 42 to 91 after following the AI
            suggestions. I got 3× more callbacks the very next week.&rdquo;
          </p>
          <footer className="text-sm text-muted-foreground">
            Arjun Mehta &mdash; Frontend Developer @ Razorpay
          </footer>
        </blockquote>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AI Career Mentor
        </p>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-12 sm:px-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="mb-1 flex items-center gap-2 lg:hidden">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-bold">AI Career Mentor</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to continue your career journey</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Banners */}
            {justVerified && (
              <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Email verified! Your account is now active.</span>
              </div>
            )}
            {justRegistered && !justVerified && (
              <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Account created! Check your email to verify before signing in.</span>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("google")}
                disabled={anyLoading}
                className="gap-2"
              >
                <GoogleIcon />
                <span className="text-sm">Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("github")}
                disabled={anyLoading}
                className="gap-2"
              >
                <Github className="h-4 w-4" />
                <span className="text-sm">GitHub</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Credentials form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={anyLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={anyLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={anyLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center pb-6 pt-2">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign up free
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
