import Link from "next/link"
import { Brain, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <Link href="/" className="mb-12 flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">AI Career Mentor</span>
      </Link>

      <div className="text-center">
        {/* Large 404 */}
        <div className="mb-2 bg-gradient-to-br from-primary to-purple-500 bg-clip-text text-[8rem] font-extrabold leading-none tracking-tighter text-transparent sm:text-[10rem]">
          404
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Go home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
}
