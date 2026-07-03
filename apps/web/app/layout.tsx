import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "CareerGPT — Your Personal Career Coach",
    template: "%s | CareerGPT",
  },
  description:
    "CareerGPT — AI-powered career platform. Analyze your resume, identify skill gaps, generate learning roadmaps, and ace your interviews.",
  keywords: [
    "CareerGPT",
    "career mentor",
    "resume analysis",
    "ATS score",
    "interview preparation",
    "skill gap analysis",
    "learning roadmap",
    "AI career coach",
  ],
  authors: [{ name: "Rohan Bondre", url: "https://github.com/therohanbondre" }],
  creator: "Rohan Bondre",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://careergpt.vercel.app",
    title: "CareerGPT — Your Personal Career Coach",
    description:
      "CareerGPT — AI-powered career platform. Analyze your resume, identify skill gaps, generate learning roadmaps, and ace your interviews.",
    siteName: "CareerGPT",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerGPT — Your Personal Career Coach",
    description:
      "CareerGPT — AI-powered career platform for resume analysis, skill gap identification, and interview preparation.",
    creator: "@therohanbondre",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
