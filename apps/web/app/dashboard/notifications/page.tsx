"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { NotificationItem } from "@/components/notifications/notification-item"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Loader2, CheckCheck, Trash2 } from "lucide-react"
import { useToast } from "@/lib/hooks/use-toast"
import type { Notification, NotificationStatus } from "@/types"

const FILTER_TABS: { label: string; value: NotificationStatus | "ALL" }[] = [
  { label: "All",      value: "ALL"      },
  { label: "Unread",   value: "UNREAD"   },
  { label: "Read",     value: "READ"     },
  { label: "Archived", value: "ARCHIVED" },
]

export default function NotificationsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [filter,        setFilter]        = useState<NotificationStatus | "ALL">("ALL")
  const [page,          setPage]          = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [loading,       setLoading]       = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (filter !== "ALL") params.set("status", filter)

      const res  = await fetch(`/api/notifications?${params}`)
      const data = await res.json()

      if (res.ok) {
        setNotifications(data.notifications ?? [])
        setUnreadCount(data.unreadCount ?? 0)
        setTotalPages(data.pagination?.totalPages ?? 1)
      }
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  // Reset page when filter changes
  useEffect(() => { setPage(1) }, [filter])

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

  const handleMarkAllRead = async () => {
    const res = await fetch("/api/notifications/mark-all-read", { method: "PATCH" })
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" as const })))
      setUnreadCount(0)
      toast({ variant: "success" as any, title: "All notifications marked as read" })
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={session?.user} />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-3xl p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground">
                Stay updated on your career progress
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4" />
                Mark all read
                <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
              </Button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={filter === tab.value ? "default" : "outline"}
                onClick={() => setFilter(tab.value)}
                className="h-8"
              >
                {tab.label}
                {tab.value === "UNREAD" && unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-20 text-center">
                <Bell className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-40" />
                <h3 className="text-lg font-semibold">
                  {filter === "UNREAD" ? "No unread notifications" : "No notifications yet"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filter === "UNREAD"
                    ? "You're all caught up!"
                    : "Notifications will appear here as you use the platform."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={handleMarkRead}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
