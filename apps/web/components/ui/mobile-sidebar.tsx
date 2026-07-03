"use client"

import { useState } from "react"
import { Menu, X, Brain } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard, FileText, Briefcase, Brain as BrainIcon,
  MessageSquare, BookOpen, Code2, Bell, Settings, LogOut,
  User, Users, ClipboardList, BarChart2, PenLine,
} from "lucide-react"
import { signOut } from "next-auth/react"

/*
 * MobileSidebar
 * Hamburger button + slide-in overlay for screens below lg.
 * Uses a controlled state (no Radix Sheet dependency).
 */

const studentNav = [
  { name: "Dashboard",    href: "/dashboard",             icon: LayoutDashboard },
  { name: "Resumes",      href: "/dashboard/resumes",     icon: FileText        },
  { name: "Jobs",         href: "/dashboard/jobs",        icon: Briefcase       },
  { name: "Skills",       href: "/dashboard/skills",      icon: BrainIcon       },
  { name: "Interviews",   href: "/dashboard/interviews",  icon: MessageSquare   },
  { name: "Roadmap",      href: "/dashboard/roadmap",     icon: BookOpen        },
  { name: "Projects",     href: "/dashboard/projects",    icon: Code2           },
  { name: "Cover Letter", href: "/dashboard/cover-letter",icon: PenLine         },
  { name: "Notifications",href: "/dashboard/notifications",icon: Bell           },
  { name: "Settings",     href: "/dashboard/settings",    icon: Settings        },
]

const recruiterNav = [
  { name: "Dashboard",   href: "/dashboard/recruiter",           icon: LayoutDashboard },
  { name: "Post a Job",  href: "/dashboard/recruiter/jobs/new",  icon: Briefcase       },
  { name: "My Jobs",     href: "/dashboard/recruiter/jobs",      icon: ClipboardList   },
  { name: "Candidates",  href: "/dashboard/recruiter/candidates",icon: Users           },
  { name: "Analytics",   href: "/dashboard/recruiter/analytics", icon: BarChart2       },
  { name: "Notifications",href:"/dashboard/notifications",       icon: Bell            },
  { name: "Settings",    href: "/dashboard/settings",            icon: Settings        },
]

interface MobileSidebarProps {
  user?: {
    name?:  string | null
    email?: string | null
    role?:  string | null
  }
}

export function MobileSidebar({ user }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const role = user?.role ?? session?.user?.role ?? "STUDENT"
  const isRecruiter = role === "RECRUITER"
  const isAdmin     = role === "ADMIN"
  const navItems    = isRecruiter ? recruiterNav : studentNav

  return (
    <>
      {/* Hamburger — only visible on mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r bg-card shadow-xl transition-transform duration-300 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link
            href={isRecruiter ? "/dashboard/recruiter" : "/dashboard"}
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">CareerGPT</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Role badge */}
        {(isRecruiter || isAdmin) && (
          <div className="border-b px-4 py-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {role.charAt(0) + role.slice(1).toLowerCase()} Portal
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/dashboard/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Users className="h-5 w-5 shrink-0" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t p-4 space-y-3">
          <div>
            <p className="text-sm font-medium">{user?.name || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-red-600"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </>
  )
}
