import NextAuth from "next-auth"

/*
 * Middleware Auth — Edge-compatible JWT-only auth handler.
 *
 * WHY THIS FILE EXISTS:
 * lib/auth/config.ts imports PrismaClient and bcrypt — both are Node.js-only.
 * Next.js middleware runs on the Edge Runtime which does NOT support Node.js
 * built-in modules (net, tls, fs, crypto, etc).
 * Importing lib/auth/config.ts in middleware.ts causes:
 *   "The edge runtime does not support Node.js 'net' module"
 *
 * SOLUTION: A minimal NextAuth instance that ONLY decodes the JWT cookie.
 * Zero Node.js imports — safe for the Edge Runtime.
 *
 * middleware.ts  →  imports from HERE        (edge-safe, JWT decode only)
 * API routes     →  imports from lib/auth/config.ts  (Node.js runtime)
 */
export const { auth } = NextAuth({
  providers: [],
  session:   { strategy: "jwt" },
  secret:    process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id     = user.id
        // Cast to unknown first to avoid TypeScript operator-precedence issue:
        // `x as T ?? fallback` applies `as T` before `??`, making fallback unreachable.
        // `(x as unknown as T) ?? fallback` is the correct pattern.
        token.role   = ((user as unknown as Record<string, unknown>).role   as string) ?? "STUDENT"
        token.status = ((user as unknown as Record<string, unknown>).status as string) ?? "PENDING"
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id    = (token.id    as string) ?? ""
        session.user.role  = (token.role  as string) ?? "STUDENT"
        session.user.email = (token.email as string) ?? ""
        session.user.name  = (token.name  as string) ?? ""
        // next-auth types session.user.image as string | null | undefined
        // normalise to string | null only
        session.user.image = typeof token.image === "string" ? token.image : null
      }
      return session
    },
  },
})
