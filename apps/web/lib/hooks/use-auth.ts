"use client"

/* 
 * Architectural Decision: Auth Hook
 * - Client-side authentication state management
 * - Reusable across components
 * - Type-safe user data access
 * - Automatic session refresh
 */
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}
