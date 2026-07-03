"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Loader2 } from "lucide-react"
import { NotificationItem } from "@/components/notifications/notification-item"
import type { Notification } from "@/types"

/*
 * Dashboard Notifications Widget
 * Replaces the old prop-driven mock component with real data fetched from
 * /api/notifications. Shows the 5 most recent, links to full page.
 */
export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [loading,       setLoading]       = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/notifications?limit=5")
      const data = await res.json()
      if (res.ok) {
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: "READ" }),
    })
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, status: "READ" } : n)
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  const handleArchive = async (id: string) => {
    const n = notifications.find((x) => x.id === id)
    await fetch(`/api/notifications/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: "ARCHIVED" }),
    })
    setNotifications((prev) => prev.filter((x) => x.id !== id))
    if (n?.status === "UNREAD") setUnreadCount((c) => Math.max(0, c - 1))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="mx-auto mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
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

        <Link href="/dashboard/notifications">
          <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
            View all notifications
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
