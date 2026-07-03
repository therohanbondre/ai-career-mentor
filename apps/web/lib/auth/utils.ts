import { auth } from "./config"

/* 
 * Architectural Decision: Authentication Utilities
 * - Helper functions for auth checks
 * - Role-based access control
 * - Session management utilities
 */

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth()
  
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient permissions")
  }
  
  return user
}

export function hasRole(user: any, role: string): boolean {
  return user?.role === role
}

export function hasAnyRole(user: any, roles: string[]): boolean {
  return user && roles.includes(user.role)
}

export function isAdmin(user: any): boolean {
  return hasRole(user, "ADMIN")
}

export function isRecruiter(user: any): boolean {
  return hasRole(user, "RECRUITER")
}

export function isStudent(user: any): boolean {
  return hasRole(user, "STUDENT")
}
