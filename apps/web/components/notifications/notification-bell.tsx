"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { NotificationItem } from "@/components/notifications/notification-item"
import type { Notification } from "@/types"

/*
 * NotificationBell
 * Polls for unread count every 60 s and shows a dropdown preview of the 5
 * most recent notifications. Full list is on /dashboard/notifications.
 */
export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [open,          setOpen]          = useState(false)
  const [loading,       setLoading]       = useState(false)

  const fetchPreview = useCallback(async () => {
    try {
      const res  = await fetch("/api/notifications?limit=5")
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch {
      // silent
    }
  }, [])

  // Initial fetch + 60-second polling
  useEffect(() => {
    fetchPreview()
    const id = setInterval(fetchPreview, 60_000)
    return () => clearInterval(id)
  }, [fetchPreview])

  // Refresh when dropdown opens
  useEffect(() => {
    if (open) fetchPreview()
  }, [open, fetchPreview])

  const handleMarkRead = async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/notifications/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "READ" }),
      })
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, status: "READ" } : n)
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/notifications/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "ARCHIVED" }),
      })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setUnreadCount((c) => {
        const n = notifications.find((x) => x.id === id)
        return n?.status === "UNREAD" ? Math.max(0, c - 1) : c
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/mark-all-read", { method: "PATCH" })
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" as const })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 h-8 w-8 opacity-30" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onArchive={handleArchive}
                  compact
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
              View all notifications →
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
