import type { NextConfig } from "next"

/*
 * Security headers applied to every response.
 * Duplicated in vercel.json for edge-level delivery.
 */
const securityHeaders = [
  { key: "X-Frame-Options",        value: "SAMEORIGIN"                      },
  { key: "X-Content-Type-Options", value: "nosniff"                         },
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on"                              },
  {
    key:   "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key:   "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://generativelanguage.googleapis.com",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }]
  },

  /*
   * serverExternalPackages — Next.js 15 stable API
   * (was experimental.serverComponentsExternalPackages in Next.js 13/14)
   *
   * Tells Next.js NOT to bundle these Node.js-only packages into the
   * server bundle. They are used only in API routes (pdf-parse, mammoth)
   * and auth (bcryptjs). Without this, Next.js tries to trace/bundle
   * them and emits warnings or fails when they reference native binaries.
   *
   * No webpack customisation is needed — this replaces the old
   * webpack externals approach entirely.
   */
  serverExternalPackages: [
    "pdf-parse",
    "mammoth",
    "bcryptjs",
    "nodemailer",
    "@prisma/client",
    "prisma",
  ],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com"            },
      { protocol: "https", hostname: "avatars.githubusercontent.com"         },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com"     },
    ],
  },

  typescript: {
    // Kept true so Vercel builds succeed while type issues are cleaned up.
    // CI runs tsc --noEmit separately to catch type errors.
    ignoreBuildErrors: true,
  },

  eslint: {
    // ESLint runs in the CI lint step; skip it during next build to save time.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
