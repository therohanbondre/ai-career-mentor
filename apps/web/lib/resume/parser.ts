import pdf from "pdf-parse"
import mammoth from "mammoth"
import { readFile } from "fs/promises"
import { existsSync } from "fs"

/* 
 * Architectural Decision: Resume Parser Service
 * - Extracts text from PDF and DOCX files
 * - Parses structured data from resume text
 * - Handles malformed data gracefully
 * - Returns structured JSON
 * - Reusable service functions
 */

export interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  education?: Education[]
  skills?: string[]
  experience?: Experience[]
  projects?: Project[]
  achievements?: string[]
  certificates?: Certificate[]
  languages?: string[]
  rawText?: string
}

export interface Education {
  institution?: string
  degree?: string
  field?: string
  startDate?: string
  endDate?: string
  gpa?: string
}

export interface Experience {
  company?: string
  position?: string
  startDate?: string
  endDate?: string
  description?: string[]
}

export interface Project {
  name?: string
  description?: string
  technologies?: string[]
  startDate?: string
  endDate?: string
}

export interface Certificate {
  name?: string
  issuer?: string
  date?: string
  url?: string
}

/**
 * Extract text from a file based on its MIME type
 */
export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    if (!existsSync(filePath)) {
      throw new Error("File not found")
    }

    const buffer = await readFile(filePath)

    if (mimeType === "application/pdf") {
      return await extractTextFromPDF(buffer)
    } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return await extractTextFromDOCX(buffer)
    } else {
      throw new Error("Unsupported file type")
    }
  } catch (error) {
    console.error("Text extraction error:", error)
    throw new Error("Failed to extract text from file")
  }
}

/**
 * Extract text from PDF buffer using pdf-parse
 */
declare module "pdf-parse" {
  function pdf(buffer: Buffer): Promise<{ text: string; numpages: number }>
  export = pdf
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error("PDF parsing error:", error)
    throw new Error("Failed to parse PDF")
  }
}

/**
 * Extract text from DOCX buffer using mammoth
 */
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error("DOCX parsing error:", error)
    throw new Error("Failed to parse DOCX")
  }
}

/**
 * Parse structured data from resume text
 * Uses regex patterns and heuristics to extract information
 */
export function parseResumeData(text: string): ParsedResume {
  const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0)
  
  return {
    name: extractName(lines),
    email: extractEmail(text),
    phone: extractPhone(text),
    education: extractEducation(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    projects: extractProjects(text),
    achievements: extractAchievements(text),
    certificates: extractCertificates(text),
    languages: extractLanguages(text),
    rawText: text,
  }
}

/**
 * Extract name from resume (heuristic: first line or capitalized words)
 */
function extractName(lines: string[]): string | undefined {
  if (lines.length === 0) return undefined
  
  // Try first line as name (common in resumes)
  const firstLine = lines[0]
  if (isValidName(firstLine)) {
    return firstLine
  }
  
  // Look for capitalized name pattern
  const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?$/
  for (const line of lines.slice(0, 5)) {
    if (namePattern.test(line) && !line.includes("@")) {
      return line
    }
  }
  
  return undefined
}

/**
 * Validate if text looks like a name
 */
function isValidName(text: string): boolean {
  // Should not contain email, phone, or special characters
  if (text.includes("@") || text.includes("http") || /\d{3}/.test(text)) {
    return false
  }
  
  // Should be 2-4 words, mostly letters
  const words = text.split(" ")
  if (words.length < 2 || words.length > 4) {
    return false
  }
  
  return words.every(word => /^[A-Z][a-z]+$/.test(word))
}

/**
 * Extract email using regex
 */
function extractEmail(text: string): string | undefined {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  const match = text.match(emailRegex)
  return match ? match[0] : undefined
}

/**
 * Extract phone number using regex
 */
function extractPhone(text: string): string | undefined {
  // Match various phone formats
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/
  const match = text.match(phoneRegex)
  return match ? match[0] : undefined
}

/**
 * Extract education information
 */
function extractEducation(text: string): Education[] {
  const education: Education[] = []
  
  // Common degree keywords
  const degreeKeywords = [
    "Bachelor", "Master", "PhD", "Doctorate", "Associate", "B.S.", "M.S.", "B.A.", "M.A.",
    "B.Tech", "M.Tech", "MBA", "Computer Science", "Engineering", "Business"
  ]
  
  // Look for education sections
  const educationSection = extractSection(text, ["Education", "Academic", "Qualifications"])
  
  if (!educationSection) return education
  
  const lines = educationSection.split("\n").map(l => l.trim()).filter(l => l)
  
  let currentEducation: Education | null = null
  
  for (const line of lines) {
    // Check if line contains degree keyword
    const hasDegree = degreeKeywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    )
    
    if (hasDegree) {
      if (currentEducation) {
        education.push(currentEducation)
      }
      currentEducation = {
        degree: line,
      }
    } else if (currentEducation) {
      // Add details to current education
      if (line.includes("University") || line.includes("College") || line.includes("Institute")) {
        currentEducation.institution = line
      } else if (/\d{4}/.test(line)) {
        // Extract dates
        const dates = line.match(/\d{4}/g)
        if (dates) {
          currentEducation.startDate = dates[0]
          if (dates.length > 1) {
            currentEducation.endDate = dates[1]
          }
        }
      } else if (line.toLowerCase().includes("gpa")) {
        currentEducation.gpa = line
      }
    }
  }
  
  if (currentEducation) {
    education.push(currentEducation)
  }
  
  return education
}

/**
 * Extract skills from resume
 */
function extractSkills(text: string): string[] {
  const skills: string[] = []
  
  // Look for skills section
  const skillsSection = extractSection(text, ["Skills", "Technical Skills", "Technologies", "Core Competencies"])
  
  if (!skillsSection) return skills
  
  // Common skill separators
  const separators = [",", "•", "-", "|", "\n"]
  
  // Split by separators and clean up
  const rawSkills = skillsSection.split(new RegExp(separators.join("|")))
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0)
  
  // Filter out non-skill lines
  for (const skill of rawSkills) {
    // Skip if it's a header or too long
    if (skill.length > 50 || skill.toLowerCase().includes("skill")) {
      continue
    }
    skills.push(skill)
  }
  
  return [...new Set(skills)] // Remove duplicates
}

/**
 * Extract work experience
 */
function extractExperience(text: string): Experience[] {
  const experiences: Experience[] = []
  
  // Look for experience section
  const experienceSection = extractSection(text, [
    "Experience", "Work Experience", "Professional Experience", "Employment", "Work History"
  ])
  
  if (!experienceSection) return experiences
  
  const lines = experienceSection.split("\n").map(l => l.trim()).filter(l => l)
  
  let currentExperience: Experience | null = null
  let description: string[] = []
  
  for (const line of lines) {
    // Check if line looks like a company/position header
    if (looksLikeCompanyHeader(line)) {
      if (currentExperience) {
        currentExperience.description = description
        experiences.push(currentExperience)
      }
      
      const parts = line.split(/[,-]/).map(p => p.trim())
      currentExperience = {
        company: parts[0],
        position: parts[1],
      }
      description = []
      
      // Extract dates from the line
      const dates = line.match(/\d{4}/g)
      if (dates) {
        currentExperience.startDate = dates[0]
        if (dates.length > 1) {
          currentExperience.endDate = dates[1]
        }
      }
    } else if (currentExperience) {
      // Add to description
      if (line.startsWith("•") || line.startsWith("-")) {
        description.push(line.replace(/^[•-]\s*/, ""))
      } else if (line.length > 10) {
        description.push(line)
      }
    }
  }
  
  if (currentExperience) {
    currentExperience.description = description
    experiences.push(currentExperience)
  }
  
  return experiences
}

/**
 * Check if line looks like a company/position header
 */
function looksLikeCompanyHeader(line: string): boolean {
  // Should contain company-like words or position-like words
  const companyIndicators = ["Inc", "Corp", "LLC", "Ltd", "Company", "Technologies", "Solutions"]
  const positionIndicators = ["Engineer", "Developer", "Manager", "Director", "Analyst", "Lead", "Senior", "Junior"]
  
  const hasCompanyIndicator = companyIndicators.some(ind => line.includes(ind))
  const hasPositionIndicator = positionIndicators.some(ind => line.toLowerCase().includes(ind.toLowerCase()))
  const hasDate = /\d{4}/.test(line)
  
  return (hasCompanyIndicator || hasPositionIndicator) && hasDate
}

/**
 * Extract projects
 */
function extractProjects(text: string): Project[] {
  const projects: Project[] = []
  
  // Look for projects section
  const projectsSection = extractSection(text, ["Projects", "Personal Projects", "Key Projects"])
  
  if (!projectsSection) return projects
  
  const lines = projectsSection.split("\n").map(l => l.trim()).filter(l => l)
  
  let currentProject: Project | null = null
  let description: string[] = []
  
  for (const line of lines) {
    // Check if line looks like a project name
    if (line.length < 50 && !line.includes("•") && !line.includes("-")) {
      if (currentProject) {
        currentProject.description = description
        projects.push(currentProject)
      }
      currentProject = {
        name: line,
      }
      description = []
    } else if (currentProject) {
      // Add to description or technologies
      if (line.toLowerCase().includes("tech") || line.toLowerCase().includes("stack")) {
        currentProject.technologies = line.split(/[,|]/).map(t => t.trim())
      } else {
        description.push(line.replace(/^[•-]\s*/, ""))
      }
    }
  }
  
  if (currentProject) {
    currentProject.description = description
    projects.push(currentProject)
  }
  
  return projects
}

/**
 * Extract achievements
 */
function extractAchievements(text: string): string[] {
  const achievements: string[] = []
  
  // Look for achievements section
  const achievementsSection = extractSection(text, [
    "Achievements", "Accomplishments", "Awards", "Honors", "Recognition"
  ])
  
  if (!achievementsSection) return achievements
  
  const lines = achievementsSection.split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("•") || l.startsWith("-"))
    .map(l => l.replace(/^[•-]\s*/, ""))
  
  return lines.filter(l => l.length > 5)
}

/**
 * Extract certificates
 */
function extractCertificates(text: string): Certificate[] {
  const certificates: Certificate[] = []
  
  // Look for certificates section
  const certificatesSection = extractSection(text, [
    "Certificates", "Certifications", "Credentials", "Licenses"
  ])
  
  if (!certificatesSection) return certificates
  
  const lines = certificatesSection.split("\n").map(l => l.trim()).filter(l => l)
  
  for (const line of lines) {
    if (line.length > 5 && !line.toLowerCase().includes("certificate")) {
      const cert: Certificate = {
        name: line,
      }
      
      // Try to extract issuer and date
      const parts = line.split(/[,-]/).map(p => p.trim())
      if (parts.length > 1) {
        cert.issuer = parts[1]
      }
      
      const dates = line.match(/\d{4}/g)
      if (dates) {
        cert.date = dates[0]
      }
      
      certificates.push(cert)
    }
  }
  
  return certificates
}

/**
 * Extract languages
 */
function extractLanguages(text: string): string[] {
  const languages: string[] = []
  
  // Look for languages section
  const languagesSection = extractSection(text, ["Languages", "Language Proficiency"])
  
  if (!languagesSection) return languages
  
  // Common language names
  const commonLanguages = [
    "English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean",
    "Hindi", "Arabic", "Portuguese", "Russian", "Italian", "Dutch", "Swedish"
  ]
  
  for (const lang of commonLanguages) {
    if (languagesSection.toLowerCase().includes(lang.toLowerCase())) {
      languages.push(lang)
    }
  }
  
  return [...new Set(languages)]
}

/**
 * Extract a specific section from resume text
 */
function extractSection(text: string, sectionHeaders: string[]): string | undefined {
  const lines = text.split("\n")
  let startIndex = -1
  let endIndex = lines.length
  
  // Find section start
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase()
    if (sectionHeaders.some(header => line.includes(header.toLowerCase()))) {
      startIndex = i
      break
    }
  }
  
  if (startIndex === -1) return undefined
  
  // Find section end (next major section)
  const majorSections = [
    "experience", "education", "skills", "projects", "achievements",
    "certificates", "languages", "interests", "references"
  ]
  
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase()
    if (majorSections.some(section => line === section && i > startIndex + 1)) {
      endIndex = i
      break
    }
  }
  
  return lines.slice(startIndex + 1, endIndex).join("\n")
}
