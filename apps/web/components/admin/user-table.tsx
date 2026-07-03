"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserStatusToggle } from "@/components/admin/user-status-toggle"
import { Search, RefreshCw, Loader2, Users } from "lucide-react"
import { format } from "date-fns"
import type { AdminUser, UserRole, UserStatus } from "@/types"

const STATUS_STYLES: Record<UserStatus, { variant: any; label: string }> = {
  ACTIVE:    { variant: "success",     label: "Active"    },
  PENDING:   { variant: "warning",     label: "Pending"   },
  SUSPENDED: { variant: "destructive", label: "Suspended" },
}

const ROLE_STYLES: Record<UserRole, string> = {
  STUDENT:   "bg-blue-100   text-blue-700   dark:bg-blue-900/30",
  RECRUITER: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
  ADMIN:     "bg-red-100    text-red-700    dark:bg-red-900/30",
}

const ROLE_FILTERS:   Array<{ label: string; value: string }> = [
  { label: "All",       value: ""          },
  { label: "Students",  value: "STUDENT"   },
  { label: "Recruiters",value: "RECRUITER" },
  { label: "Admins",    value: "ADMIN"     },
]

const STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: "All",       value: ""          },
  { label: "Active",    value: "ACTIVE"    },
  { label: "Pending",   value: "PENDING"   },
  { label: "Suspended", value: "SUSPENDED" },
]

export function UserTable() {
  const [users,      setUsers]      = useState<AdminUser[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const LIMIT = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (search)       params.set("search", search)
      if (roleFilter)   params.set("role",   roleFilter)
      if (statusFilter) params.set("status", statusFilter)

      const res  = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users ?? [])
        setTotalPages(data.pagination?.totalPages ?? 1)
        setTotal(data.pagination?.total ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { setPage(1) }, [search, roleFilter, statusFilter])

  const handleUpdated = (userId: string, changes: Partial<AdminUser>) => {
    setUsers((prev) =>
      prev.map((u) => u.id === userId ? { ...u, ...changes } : u)
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Users ({total.toLocaleString()})</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ROLE_FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={roleFilter === f.value ? "default" : "outline"}
                onClick={() => setRoleFilter(f.value)}
                className="h-9 text-xs"
              >
                {f.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={statusFilter === f.value ? "default" : "outline"}
                onClick={() => setStatusFilter(f.value)}
                className="h-9 text-xs"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Resumes</th>
                  <th className="pb-3 pr-4 font-medium">Interviews</th>
                  <th className="pb-3 pr-4 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => {
                  const ss = STATUS_STYLES[user.status as UserStatus] ?? STATUS_STYLES.PENDING
                  const name = user.profile?.displayName
                    ?? `${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim()
                    || user.email
                  const initials = name.charAt(0).toUpperCase()

                  return (
                    <tr key={user.id} className="group hover:bg-accent/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile?.avatar ?? undefined} />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium leading-tight">{name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_STYLES[user.role as UserRole]}`}>
                          {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={ss.variant} className="text-xs">{ss.label}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span className="font-medium">{user._count?.resumes ?? 0}</span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span className="font-medium">{user._count?.interviewSessions ?? 0}</span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="py-3">
                        <UserStatusToggle user={user} onUpdated={handleUpdated} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
