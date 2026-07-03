"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, ShieldCheck, ShieldOff, UserCog, Loader2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/lib/hooks/use-toast"
import type { AdminUser } from "@/types"

interface UserStatusToggleProps {
  user: AdminUser
  onUpdated: (userId: string, changes: Partial<AdminUser>) => void
}

export function UserStatusToggle({ user, onUpdated }: UserStatusToggleProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const update = async (payload: { status?: string; role?: string }) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Update failed")
      onUpdated(user.id, payload as Partial<AdminUser>)
      toast({ variant: "success" as any, title: "User updated" })
    } catch (err) {
      toast({
        variant: "destructive" as any,
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <MoreVertical className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Status actions */}
        {user.status !== "ACTIVE" && (
          <DropdownMenuItem onClick={() => update({ status: "ACTIVE" })}>
            <ShieldCheck className="mr-2 h-4 w-4 text-green-600" />
            Activate
          </DropdownMenuItem>
        )}
        {user.status === "ACTIVE" && (
          <DropdownMenuItem onClick={() => update({ status: "SUSPENDED" })}>
            <ShieldOff className="mr-2 h-4 w-4 text-orange-600" />
            Suspend
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Role actions */}
        {user.role !== "STUDENT" && (
          <DropdownMenuItem onClick={() => update({ role: "STUDENT" })}>
            <UserCog className="mr-2 h-4 w-4" />
            Set as Student
          </DropdownMenuItem>
        )}
        {user.role !== "RECRUITER" && (
          <DropdownMenuItem onClick={() => update({ role: "RECRUITER" })}>
            <UserCog className="mr-2 h-4 w-4" />
            Set as Recruiter
          </DropdownMenuItem>
        )}
        {user.role !== "ADMIN" && (
          <DropdownMenuItem onClick={() => update({ role: "ADMIN" })}>
            <UserCog className="mr-2 h-4 w-4 text-primary" />
            Set as Admin
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
