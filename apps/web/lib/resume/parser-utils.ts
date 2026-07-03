import { ParsedResume } from "./parser"

/* 
 * Architectural Decision: Parser Utility Functions
 * - Reusable helper functions
 * - Data validation
 * - Data transformation
 * - Error handling helpers
 */

/**
 * Validate parsed resume data
 */
export function validateParsedResume(data: ParsedResume): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name) {
    errors.push("Name is missing")
  }

  if (!data.email) {
    errors.push("Email is missing")
  } else if (!isValidEmail(data.email)) {
    errors.push("Email is invalid")
  }

  if (!data.skills || data.skills.length === 0) {
    errors.push("No skills found")
  }

  if (!data.experience || data.experience.length === 0) {
    errors.push("No experience found")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Calculate resume completeness score
 */
export function calculateCompletenessScore(data: ParsedResume): number {
  const fields = [
    data.name,
    data.email,
    data.phone,
    data.education && data.education.length > 0,
    data.skills && data.skills.length > 0,
    data.experience && data.experience.length > 0,
    data.projects && data.projects.length > 0,
    data.achievements && data.achievements.length > 0,
    data.certificates && data.certificates.length > 0,
    data.languages && data.languages.length > 0,
  ]

  const filledFields = fields.filter(Boolean).length
  return Math.round((filledFields / fields.length) * 100)
}

/**
 * Format parsed data for display
 */
export function formatParsedData(data: ParsedResume): Record<string, any> {
  return {
    personal: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
    education: data.education || [],
    skills: data.skills || [],
    experience: data.experience || [],
    projects: data.projects || [],
    achievements: data.achievements || [],
    certificates: data.certificates || [],
    languages: data.languages || [],
    completeness: calculateCompletenessScore(data),
  }
}

/**
 * Extract keywords for ATS matching
 */
export function extractKeywords(data: ParsedResume): string[] {
  const keywords: string[] = []

  // Add skills
  if (data.skills) {
    keywords.push(...data.skills)
  }

  // Add technologies from projects
  if (data.projects) {
    data.projects.forEach(project => {
      if (project.technologies) {
        keywords.push(...project.technologies)
      }
    })
  }

  // Add degree fields
  if (data.education) {
    data.education.forEach(edu => {
      if (edu.field) keywords.push(edu.field)
      if (edu.degree) keywords.push(edu.degree)
    })
  }

  // Add position titles
  if (data.experience) {
    data.experience.forEach(exp => {
      if (exp.position) keywords.push(exp.position)
    })
  }

  // Remove duplicates and normalize
  return [...new Set(keywords.map(k => k.toLowerCase()))]
}

/**
 * Generate resume summary
 */
export function generateSummary(data: ParsedResume): string {
  const parts: string[] = []

  if (data.name) {
    parts.push(data.name)
  }

  if (data.experience && data.experience.length > 0) {
    const totalYears = calculateTotalExperience(data.experience)
    parts.push(`${totalYears}+ years of experience`)
  }

  if (data.skills && data.skills.length > 0) {
    parts.push(`skilled in ${data.skills.slice(0, 3).join(", ")}`)
  }

  if (data.education && data.education.length > 0) {
    const firstEdu = data.education[0]
    const degree = firstEdu?.degree || "degree"
    const institution = firstEdu?.institution || "institution"
    parts.push(`with ${degree} from ${institution}`)
  }

  return parts.join(", ") + "."
}

/**
 * Calculate total years of experience
 */
function calculateTotalExperience(experiences: any[]): number {
  let totalYears = 0

  for (const exp of experiences) {
    if (exp.startDate && exp.endDate) {
      const start = new Date(exp.startDate)
      const end = new Date(exp.endDate)
      const years = (end.getFullYear() - start.getFullYear())
      totalYears += years
    }
  }

  return totalYears
}

/**
 * Sanitize text for storage
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + "..."
}
