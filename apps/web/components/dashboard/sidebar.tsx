"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Brain,
  MessageSquare,
  BookOpen,
  Code2,
  Bell,
  Settings,
  LogOut,
  User,
  Users,
  ClipboardList,
  BarChart2,
  PenLine,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { NotificationBell } from "@/components/notifications/notification-bell"

/*
 * Dashboard Sidebar
 * Renders different nav items based on the user's role:
 *   STUDENT   → career tools navigation
 *   RECRUITER → recruiter portal navigation
 *   ADMIN     → can see both (navigates to /dashboard/admin)
 */

const studentNav = [
  { name: "Dashboard",    href: "/dashboard",             icon: LayoutDashboard },
  { name: "Resumes",      href: "/dashboard/resumes",     icon: FileText        },
  { name: "Jobs",         href: "/dashboard/jobs",        icon: Briefcase       },
  { name: "Skills",       href: "/dashboard/skills",      icon: Brain           },
  { name: "Interviews",   href: "/dashboard/interviews",  icon: MessageSquare   },
  { name: "Roadmap",      href: "/dashboard/roadmap",     icon: BookOpen        },
  { name: "Projects",     href: "/dashboard/projects",    icon: Code2           },
  { name: "Cover Letter", href: "/dashboard/cover-letter",icon: PenLine         },
  { name: "Settings",     href: "/dashboard/settings",    icon: Settings        },
]

const recruiterNav = [
  { name: "Dashboard",   href: "/dashboard/recruiter",             icon: LayoutDashboard },
  { name: "Post a Job",  href: "/dashboard/recruiter/jobs/new",    icon: Briefcase       },
  { name: "My Jobs",     href: "/dashboard/recruiter/jobs",        icon: ClipboardList   },
  { name: "Candidates",  href: "/dashboard/recruiter/candidates",  icon: Users           },
  { name: "Analytics",   href: "/dashboard/recruiter/analytics",   icon: BarChart2       },
  { name: "Settings",    href: "/dashboard/settings",              icon: Settings        },
]

interface SidebarProps {
  user?: {
    name?:  string | null
    email?: string | null
    image?: string | null
    role?:  string | null
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const role = user?.role ?? session?.user?.role ?? "STUDENT"
  const isRecruiter = role === "RECRUITER"
  const isAdmin     = role === "ADMIN"

  const navItems = isRecruiter ? recruiterNav : studentNav

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link
          href={isRecruiter ? "/dashboard/recruiter" : "/dashboard"}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">CareerAI</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Role badge */}
      {(isRecruiter || isAdmin) && (
        <div className="border-b px-4 py-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {role.charAt(0) + role.slice(1).toLowerCase()} Portal
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

        {/* Notifications link always visible */}
        <Separator className="my-2" />
        <Link
          href="/dashboard/notifications"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/dashboard/notifications")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Bell className="h-5 w-5 shrink-0" />
          <span>Notifications</span>
        </Link>

        {/* Admin can switch portals */}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

      {/* User Profile */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">{user?.name || "User"}</span>
                <span className="max-w-[140px] truncate text-xs text-muted-foreground">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/api/auth/signout" className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}