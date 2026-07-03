"use client"

import Link from "next/link"
import { ShieldOff, LogOut, Mail, Brain } from "lucide-react"
import { signOut } from "next-auth/react"
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

export default function AccountSuspendedPage() {
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <ShieldOff className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Account suspended</CardTitle>
          <CardDescription className="text-base">
            Your account has been suspended and you cannot access the platform at
            this time. If you believe this is a mistake, please contact support.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <a href="mailto:support@aicareermentor.app" className="block">
            <Button className="w-full gap-2">
              <Mail className="h-4 w-4" />
              Contact support
            </Button>
          </a>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            support@aicareermentor.app
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
