import { analyzeAspect } from "@/lib/ai/gemini"

/* 
 * Architectural Decision: Job Description Parser Service
 * - Extracts structured data from job descriptions
 * - Uses AI for accurate parsing
 * - Returns structured JSON
 * - Reusable service functions
 * - Error handling for malformed descriptions
 */

export interface ParsedJobDescription {
  title?: string
  company?: string
  location?: string
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
  technologies: string[]
  education: EducationRequirement[]
  experience: ExperienceRequirement[]
  keywords: string[]
  seniority: SeniorityLevel
  salary?: SalaryRange
  benefits?: string[]
  rawText?: string
}

export interface EducationRequirement {
  degree?: string
  field?: string
  required: boolean
}

export interface ExperienceRequirement {
  years?: number
  level?: string
  required: boolean
}

export type SeniorityLevel = "entry" | "mid" | "senior" | "lead" | "executive" | "unknown"

export interface SalaryRange {
  min?: number
  max?: number
  currency?: string
  period?: "yearly" | "monthly" | "hourly"
}

/**
 * Parse job description using AI
 */
export async function parseJobDescription(jobDescriptionText: string): Promise<ParsedJobDescription> {
  try {
    const result = await analyzeAspect(jobDescriptionText, "job")
    return validateJobDescription(result)
  } catch (error) {
    console.error("Job description parsing error:", error)
    // Fallback to regex-based parsing
    return parseJobDescriptionRegex(jobDescriptionText)
  }
}

/**
 * Parse job description using regex (fallback)
 */
function parseJobDescriptionRegex(text: string): ParsedJobDescription {
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0)
  
  return {
    title: extractTitle(text),
    company: extractCompany(text),
    location: extractLocation(text),
    requiredSkills: extractSkills(text, "required"),
    preferredSkills: extractSkills(text, "preferred"),
    responsibilities: extractResponsibilities(text),
    technologies: extractTechnologies(text),
    education: extractEducation(text),
    experience: extractExperience(text),
    keywords: extractKeywords(text),
    seniority: extractSeniority(text),
    salary: extractSalary(text),
    benefits: extractBenefits(text),
    rawText: text,
  }
}

/**
 * Extract job title
 */
function extractTitle(text: string): string | undefined {
  const titlePatterns = [
    /(?:Job Title|Position|Role):\s*(.+)/i,
    /^(?:Senior|Lead|Principal|Junior|Intern)?\s*(?:Software|Frontend|Backend|Full Stack|Data|Machine Learning|DevOps|Product|Project)?\s*(?:Engineer|Developer|Manager|Designer|Analyst|Specialist)/i,
  ]
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern)
    if (match) return match[1] || match[0]
  }
  
  return undefined
}

/**
 * Extract company name
 */
function extractCompany(text: string): string | undefined {
  const companyPatterns = [
    /(?:Company|Organization|Employer):\s*(.+)/i,
    /at\s+([A-Z][a-zA-Z\s&]+)/i,
  ]
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern)
    if (match) return match[1]
  }
  
  return undefined
}

/**
 * Extract location
 */
function extractLocation(text: string): string | undefined {
  const locationPatterns = [
    /(?:Location|Remote|Office):\s*(.+)/i,
    /(?:in|at)\s+([A-Z][a-zA-Z\s,]+(?:\s+[A-Z]{2})?)/i,
  ]
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) return match[1]
  }
  
  return undefined
}

/**
 * Extract skills (required or preferred)
 */
function extractSkills(text: string, type: "required" | "preferred"): string[] {
  const skills: string[] = []
  const keywords = type === "required" 
    ? ["required", "must have", "essential", "need"]
    : ["preferred", "nice to have", "bonus", "plus"]
  
  const lines = text.split("\n").map(l => l.trim())
  let inSkillsSection = false
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    
    // Check if we're in a skills section
    if (lowerLine.includes("skill") || lowerLine.includes("technologies") || lowerLine.includes("tech stack")) {
      inSkillsSection = true
      continue
    }
    
    // Exit section on new major section
    if (inSkillsSection && (lowerLine.includes("responsibility") || lowerLine.includes("experience") || lowerLine.includes("education"))) {
      inSkillsSection = false
      continue
    }
    
    if (inSkillsSection) {
      // Extract skills from the line
      const extracted = extractSkillsFromLine(line)
      skills.push(...extracted)
    }
  }
  
  return [...new Set(skills)]
}

/**
 * Extract skills from a single line
 */
function extractSkillsFromLine(line: string): string[] {
  const skills: string[] = []
  
  // Common skill separators
  const parts = line.split(/[,•\-\|]/).map(p => p.trim()).filter(p => p.length > 2)
  
  // Filter out non-skill words
  const nonSkillWords = ["and", "or", "with", "using", "including", "such as", "experience", "knowledge", "familiarity"]
  
  for (const part of parts) {
    const lowerPart = part.toLowerCase()
    if (!nonSkillWords.some(word => lowerPart.includes(word))) {
      skills.push(part)
    }
  }
  
  return skills
}

/**
 * Extract responsibilities
 */
function extractResponsibilities(text: string): string[] {
  const responsibilities: string[] = []
  
  const lines = text.split("\n").map(l => l.trim())
  let inResponsibilitySection = false
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    
    if (lowerLine.includes("responsibilit") || lowerLine.includes("what you'll do") || lowerLine.includes("duties")) {
      inResponsibilitySection = true
      continue
    }
    
    if (inResponsibilitySection && (lowerLine.includes("requirement") || lowerLine.includes("qualification") || lowerLine.includes("skill"))) {
      inResponsibilitySection = false
      continue
    }
    
    if (inResponsibilitySection && (line.startsWith("•") || line.startsWith("-") || line.match(/^\d+\./))) {
      responsibilities.push(line.replace(/^[•\-\d\.]\s*/, ""))
    }
  }
  
  return responsibilities
}

/**
 * Extract technologies
 */
function extractTechnologies(text: string): string[] {
  const technologies: string[] = []
  
  // Common technology keywords
  const techKeywords = [
    "javascript", "typescript", "python", "java", "c\\+\\+", "go", "rust", "ruby", "php",
    "react", "angular", "vue", "svelte", "next", "nuxt",
    "node", "express", "django", "flask", "spring", "rails",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "git", "github", "gitlab", "ci/cd", "jenkins", "github actions",
    "agile", "scrum", "kanban", "jira", "confluence"
  ]
  
  const lowerText = text.toLowerCase()
  
  for (const tech of techKeywords) {
    if (lowerText.includes(tech)) {
      technologies.push(tech.charAt(0).toUpperCase() + tech.slice(1))
    }
  }
  
  return [...new Set(technologies)]
}

/**
 * Extract education requirements
 */
function extractEducation(text: string): EducationRequirement[] {
  const education: EducationRequirement[] = []
  const lowerText = text.toLowerCase()
  
  // Check for degree requirements
  const degreePatterns = [
    /bachelor'?s?\s*(?:degree)?\s*(?:in\s+)?([a-z\s]+)/i,
    /master'?s?\s*(?:degree)?\s*(?:in\s+)?([a-z\s]+)/i,
    /phd\s*(?:in\s+)?([a-z\s]+)/i,
  ]
  
  for (const pattern of degreePatterns) {
    const match = text.match(pattern)
    if (match) {
      education.push({
        degree: match[0],
        field: match[1]?.trim(),
        required: lowerText.includes("required") || lowerText.includes("must"),
      })
    }
  }
  
  return education
}

/**
 * Extract experience requirements
 */
function extractExperience(text: string): ExperienceRequirement[] {
  const experience: ExperienceRequirement[] = []
  const lowerText = text.toLowerCase()
  
  // Extract years of experience
  const yearPatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience)?/i,
    /(\d+)\s*-\s*(\d+)\s*years?\s*(?:of\s*)?(?:experience)?/i,
  ]
  
  for (const pattern of yearPatterns) {
    const match = text.match(pattern)
    if (match) {
      const years = match[2] ? (parseInt(match[1]) + parseInt(match[2])) / 2 : parseInt(match[1])
      experience.push({
        years,
        required: lowerText.includes("required") || lowerText.includes("must"),
      })
    }
  }
  
  return experience
}

/**
 * Extract keywords
 */
function extractKeywords(text: string): string[] {
  const keywords: string[] = []
  
  // Combine skills and technologies
  const skills = extractSkills(text, "required")
  const technologies = extractTechnologies(text)
  
  keywords.push(...skills, ...technologies)
  
  // Add common industry keywords
  const industryKeywords = [
    "software", "development", "engineering", "architecture", "design",
    "management", "leadership", "agile", "scrum", "cloud", "devops",
    "frontend", "backend", "fullstack", "database", "api", "microservices"
  ]
  
  const lowerText = text.toLowerCase()
  for (const keyword of industryKeywords) {
    if (lowerText.includes(keyword)) {
      keywords.push(keyword)
    }
  }
  
  return [...new Set(keywords)]
}

/**
 * Extract seniority level
 */
function extractSeniority(text: string): SeniorityLevel {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes("intern") || lowerText.includes("junior") || lowerText.includes("entry")) {
    return "entry"
  }
  if (lowerText.includes("mid") || lowerText.includes("intermediate")) {
    return "mid"
  }
  if (lowerText.includes("senior") || lowerText.includes("sr")) {
    return "senior"
  }
  if (lowerText.includes("lead") || lowerText.includes("principal")) {
    return "lead"
  }
  if (lowerText.includes("director") || lowerText.includes("vp") || lowerText.includes("cto") || lowerText.includes("manager")) {
    return "executive"
  }
  
  return "unknown"
}

/**
 * Extract salary range
 */
function extractSalary(text: string): SalaryRange | undefined {
  const salaryPatterns = [
    /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s*)?(year|yr|annual|month|mo|hour|hr)?/i,
    /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s*)?(year|yr|annual|month|mo|hour|hr)/i,
  ]
  
  for (const pattern of salaryPatterns) {
    const match = text.match(pattern)
    if (match) {
      const min = parseFloat(match[1].replace(/,/g, ""))
      const max = match[2] ? parseFloat(match[2].replace(/,/g, "")) : min
      const period = match[3] || "year"
      
      return {
        min,
        max,
        currency: "USD",
        period: period.includes("month") ? "monthly" : period.includes("hour") ? "hourly" : "yearly",
      }
    }
  }
  
  return undefined
}

/**
 * Extract benefits
 */
function extractBenefits(text: string): string[] {
  const benefits: string[] = []
  const lowerText = text.toLowerCase()
  
  const benefitKeywords = [
    "health insurance", "dental", "vision", "401k", "retirement", "stock options",
    "remote", "flexible", "pto", "paid time off", "vacation", "sick leave",
    "bonus", "equity", "learning", "training", "conference", "gym"
  ]
  
  for (const keyword of benefitKeywords) {
    if (lowerText.includes(keyword)) {
      benefits.push(keyword.charAt(0).toUpperCase() + keyword.slice(1))
    }
  }
  
  return [...new Set(benefits)]
}

/**
 * Validate job description data
 */
function validateJobDescription(data: any): ParsedJobDescription {
  return {
    title: data.title || undefined,
    company: data.company || undefined,
    location: data.location || undefined,
    requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
    preferredSkills: Array.isArray(data.preferredSkills) ? data.preferredSkills : [],
    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    education: Array.isArray(data.education) ? data.education : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    seniority: data.seniority || "unknown",
    salary: data.salary || undefined,
    benefits: Array.isArray(data.benefits) ? data.benefits : [],
  }
}
