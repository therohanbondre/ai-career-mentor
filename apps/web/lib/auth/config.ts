import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

/*
 * Auth Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * Providers  : Google OAuth, GitHub OAuth, Email/Password credentials
 * Adapter    : Prisma (persists sessions, accounts, verification tokens)
 * Strategy   : JWT (stateless — works on serverless/edge)
 * RBAC       : role attached to JWT token and forwarded to session
 *
 * M0 fixes applied:
 *   1. GitHub provider added (was referenced in .env.example but missing here)
 *   2. signIn callback — PENDING users coming via credentials are allowed
 *      through so the middleware can redirect them to the verification notice
 *      page rather than silently bouncing them. SUSPENDED / DELETED are still
 *      blocked. ACTIVE is always allowed.
 *   3. OAuth sign-in creates profile record if absent (safe upsert pattern).
 */

const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/dashboard",
  },

  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // ── GitHub OAuth ──────────────────────────────────────────────────────────
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // ── Email / Password credentials ──────────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentialsSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
          })

          if (!user || !user.password) {
            // Unknown email or OAuth-only account
            throw new Error("InvalidCredentials")
          }

          // Block hard-deleted and suspended accounts at the credential level
          if (user.status === "DELETED") throw new Error("AccountDeleted")
          if (user.status === "SUSPENDED") throw new Error("AccountSuspended")

          // PENDING users can sign in — they are redirected to the verification
          // notice page by middleware (status check happens there, not here).

          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) throw new Error("InvalidCredentials")

          // Update last login timestamp
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          return {
            id: user.id,
            email: user.email,
            name:
              user.profile?.displayName ||
              `${user.profile?.firstName ?? ""} ${user.profile?.lastName ?? ""}`.trim() ||
              user.email,
            image: user.profile?.avatar ?? null,
            role: user.role,
            status: user.status,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
  ],

  callbacks: {
    // ── JWT callback — runs on sign-in and every session access ───────────────
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign-in: stamp role + status onto the token
        token.id = user.id
        token.role = (user as any).role ?? "STUDENT"
        token.status = (user as any).status ?? "PENDING"
        token.email = user.email!
        token.name = user.name ?? user.email!
        token.image = user.image ?? null
      }

      // Allow client-side session updates (e.g. profile edits)
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }

      return token
    },

    // ── Session callback — shapes the object available via useSession() ───────
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = (token.image as string | null) ?? null
      }
      return session
    },

    // ── signIn callback — final gate before the session is created ────────────
    async signIn({ user, account }) {
      // For OAuth providers: auto-create or update the user record
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          // Brand-new OAuth user — create with ACTIVE status (email is pre-verified)
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              emailVerified: new Date(),
              role: "STUDENT",
              status: "ACTIVE",
              profile: {
                create: {
                  displayName: user.name ?? user.email!,
                  avatar: user.image ?? null,
                },
              },
            },
          })
          ;(user as any).id = newUser.id
          ;(user as any).role = newUser.role
          ;(user as any).status = newUser.status
        } else {
          // Returning OAuth user
          if (!existingUser.emailVerified) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date(), status: "ACTIVE" },
            })
          }
          ;(user as any).id = existingUser.id
          ;(user as any).role = existingUser.role
          ;(user as any).status = existingUser.status

          // Block suspended / deleted OAuth users
          if (
            existingUser.status === "SUSPENDED" ||
            existingUser.status === "DELETED"
          ) {
            return false
          }
        }

        // Update last login
        await prisma.user.update({
          where: { email: user.email! },
          data: { lastLoginAt: new Date() },
        })
      }

      // Credentials provider: blocked statuses were already handled in authorize()
      return true
    },
  },

  events: {
    async signIn({ user }) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Auth] signed in: ${user.email}`)
      }
    },
    async signOut({ token }) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Auth] signed out: ${(token as any)?.email}`)
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
})
