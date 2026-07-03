import { handlers } from "@/lib/auth/config"

/* 
 * Architectural Decision: NextAuth Route Handler
 * - Exports GET and POST handlers for NextAuth
 * - Handles all authentication endpoints
 * - Supports OAuth and credential providers
 */
export const { GET, POST } = handlers
