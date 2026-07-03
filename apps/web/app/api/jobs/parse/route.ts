import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import { parseJobDescription } from "@/lib/job/parser"

/* 
 * Architectural Decision: Job Description Parse API
 * - Parse job description text
 * - Extract structured data
 * - Return JSON response
 * - Authentication optional for public use
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jobDescription } = body

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      )
    }

    if (jobDescription.length > 10000) {
      return NextResponse.json(
        { error: "Job description is too long (max 10,000 characters)" },
        { status: 400 }
      )
    }

    // Parse job description
    const parsed = await parseJobDescription(jobDescription)

    return NextResponse.json({
      success: true,
      parsed,
    })
  } catch (error) {
    console.error("Job description parse error:", error)
    return NextResponse.json(
      { 
        error: "Failed to parse job description",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
