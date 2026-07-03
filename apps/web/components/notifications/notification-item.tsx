"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  FileText, Target, Brain, BookOpen, MessageSquare,
  Code2, Bell, Briefcase, Info, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Notification, NotificationType } from "@/types"

interface NotificationItemProps {
  notification: Notification
  onMarkRead:   (id: string) => void
  onArchive:    (id: string) => void
  compact?:     boolean
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  RESUME_ANALYSIS_COMPLETE: { icon: FileText,      color: "text-blue-600",   bg: "bg-blue-100   dark:bg-blue-900/30"   },
  SKILL_GAP_UPDATE:         { icon: Brain,         color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  INTERVIEW_REMINDER:       { icon: MessageSquare, color: "text-green-600",  bg: "bg-green-100  dark:bg-green-900/30"  },
  JOB_MATCH:                { icon: Briefcase,     color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  APPLICATION_UPDATE:       { icon: Target,        color: "text-red-600",    bg: "bg-red-100    dark:bg-red-900/30"    },
  ROADMAP_UPDATE:           { icon: BookOpen,      color: "text-cyan-600",   bg: "bg-cyan-100   dark:bg-cyan-900/30"   },
  PROJECT_RECOMMENDATION:   { icon: Code2,         color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  SYSTEM:                   { icon: Bell,          color: "text-slate-600",  bg: "bg-slate-100  dark:bg-slate-900/30"  },
  MARKETING:                { icon: Info,          color: "text-slate-500",  bg: "bg-slate-100  dark:bg-slate-900/30"  },
}

export function NotificationItem({
  notification,
  onMarkRead,
  onArchive,
  compact = false,
}: NotificationItemProps) {
  const cfg   = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.SYSTEM
  const Icon  = cfg.icon
  const unread = notification.status === "UNREAD"

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })

  const inner = (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border p-3 transition-colors",
        unread
          ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
          : "bg-background hover:bg-accent/50",
        compact && "py-2.5"
      )}
      onClick={() => unread && onMarkRead(notification.id)}
      role={unread ? "button" : undefined}
      tabIndex={unread ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && unread && onMarkRead(notification.id)}
    >
      {/* Icon */}
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", cfg.bg)}>
        <Icon className={cn("h-4 w-4", cfg.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-snug", unread ? "font-semibold" : "font-medium")}>
            {notification.title}
          </p>
          {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className={cn("mt-0.5 text-xs text-muted-foreground", compact ? "line-clamp-1" : "line-clamp-2")}>
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{timeAgo}</p>
      </div>

      {/* Hover actions (non-compact only) */}
      {!compact && (
        <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {unread && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Mark as read"
              onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id) }}
            >
              <Target className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            title="Archive"
            onClick={(e) => { e.stopPropagation(); onArchive(notification.id) }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {inner}
      </Link>
    )
  }
  return inner
}
