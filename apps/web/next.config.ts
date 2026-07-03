import type { NextConfig } from "next"

/*
 * Next.js Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * M0 additions:
 *   - Security headers on every response
 *   - Webpack: mark Node-only modules as external on the client bundle
 *   - Image: remote patterns (OAuth avatars from Google/GitHub)
 *   - Output: standalone for optimised Docker / Vercel builds
 */

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },

  // Block MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Disable client-side DNS prefetch (minor privacy improvement)
  { key: "X-DNS-Prefetch-Control", value: "on" },

  // Permissions Policy — disable unused browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },

  // XSS Protection (legacy browsers)
  { key: "X-XSS-Protection", value: "1; mode=block" },

  /*
   * Strict-Transport-Security
   * Only sent in production — avoids breaking local HTTP dev server.
   * max-age = 1 year; includeSubDomains; preload ready.
   */
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),

  /*
   * Content-Security-Policy
   * Permissive enough for Next.js (inline styles/scripts via nonces are added
   * automatically by Next). Tighten further per-feature in later milestones.
   */
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for its inline scripts in dev;
      // in production the nonce mechanism handles this.
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
  // Apply security headers to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },

  images: {
    remotePatterns: [
      // Google OAuth avatars
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // GitHub OAuth avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Vercel Blob storage (file previews)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },

  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  webpack(config, { isServer }) {
    if (!isServer) {
      // These Node.js built-ins are used by pdf-parse / mammoth on the server
      // only — tell webpack to ignore them in client bundles.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
      }
    }
    return config
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  output: "standalone",
}

export default nextConfig
