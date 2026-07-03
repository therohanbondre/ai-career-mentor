/*
 * NextAuth Type Extensions
 * ─────────────────────────────────────────────────────────────────────────────
 * Augments the default NextAuth types with our custom fields:
 *   - id      : database user id (cuid)
 *   - role    : UserRole enum (STUDENT | RECRUITER | ADMIN)
 *   - status  : UserStatus enum (ACTIVE | PENDING | SUSPENDED | DELETED)
 *
 * M0 addition: status field added so middleware can read it from the JWT
 * without an extra DB round-trip.
 */

import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      status: string
      email: string
      name: string
      image?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    status: string
    email: string
    name: string
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    status: string
    email: string
    name: string
    image?: string | null
  }
}
