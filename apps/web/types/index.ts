/* 
 * Architectural Decision: Type Definitions
 * - Centralized type definitions for the application
 * - Reusable types across components and API routes
 * - Consistent data structures
 * - Type-safe development
 */

// User Types
export type UserRole = 'STUDENT' | 'RECRUITER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING'

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: UserRole
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

// Resume Types
export interface Resume {
  id: string
  userId: string
  title: string
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  parsedData?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface ATSScore {
  id: string
  resumeId: string
  overallScore: number
  keywordScore: number
  formatScore: number
  contentScore: number
  details: Record<string, unknown>
  createdAt: Date
}

// Job Types
export interface JobDescription {
  id: string
  userId: string
  title: string
  company: string
  description: string
  requirements: string
  skills: string[]
  location?: string
  salaryRange?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface JobMatch {
  id: string
  resumeId: string
  jobDescriptionId: string
  matchScore: number
  skillMatch: number
  experienceMatch: number
  details: Record<string, unknown>
  createdAt: Date
}

// Skill Types
export interface SkillAnalysis {
  id: string
  userId: string
  resumeId?: string
  targetRole: string
  presentSkills: string[]
  missingSkills: string[]
  recommendedSkills: string[]
  analysisDetails: Record<string, unknown>
  createdAt: Date
}

export interface LearningRoadmap {
  id: string
  userId: string
  title: string
  targetRole: string
  duration: number
  modules: Record<string, unknown>[]
  progress: number
  status: string
  createdAt: Date
  updatedAt: Date
}

// Interview Types
export type InterviewType = 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED'
export type InterviewStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface InterviewSession {
  id: string
  userId: string
  type: InterviewType
  jobRole: string
  status: InterviewStatus
  duration: number
  questions: Record<string, unknown>[]
  createdAt: Date
  updatedAt: Date
}

export interface InterviewQuestion {
  id: string
  interviewSessionId: string
  question: string
  type: string
  category: string
  difficulty: string
  userAnswer?: string
  aiFeedback?: string
  score?: number
  order: number
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: string
}

// Form Types
export interface SignInFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// Job Match & Skill Gap Types (M4)
export interface JobMatchAnalysis {
  overallMatch: number
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  matchedSkills: string[]
  missingSkills: MissingSkill[]
  recommendations: string[]
  summary: string
}

export interface MissingSkill {
  skill: string
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  reason: string
}

export interface SkillGapAnalysis {
  presentSkills: SkillDetail[]
  missingSkills: SkillDetail[]
  recommendedSkills: SkillDetail[]
  learningPaths: LearningPath[]
  summary: string
}

export interface SkillDetail {
  name: string
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  category: string
  marketDemand?: "HIGH" | "MEDIUM" | "LOW"
  estimatedLearningTime?: string
}

export interface LearningPath {
  skill: string
  resources: Resource[]
  milestones: string[]
}

export interface Resource {
  type: "course" | "book" | "tutorial" | "practice"
  name: string
  url?: string
  duration?: string
}

// Roadmap Types (M5)
export interface RoadmapData {
  id: string
  title: string
  targetRole: string
  duration: number // weeks
  modules: RoadmapModule[]
  progress: number
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED"
  startedAt?: Date | string | null
  completedAt?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface RoadmapModule {
  week: number
  title: string
  description: string
  skills: string[]
  topics: string[]
  resources: Resource[]
  estimatedHours: number
  milestones: string[]
  completed?: boolean
}

// Project Types (M5)
export interface ProjectData {
  id: string
  title: string
  description: string
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  skills: string[]
  duration: string // e.g., "20h", "2 weeks"
  category: string
  resources: any
  createdAt: Date | string
  updatedAt: Date | string
  // User-specific fields (from ProjectRecommendation)
  userStatus?: "RECOMMENDED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED"
  startedAt?: Date | string | null
  completedAt?: Date | string | null
  notes?: string | null
}

export interface ProjectRecommendationData {
  title: string
  description: string
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  skills: string[]
  technologies: string[]
  estimatedHours: number
  category: string
  outcomes: string[]
  features: string[]
  resources: Resource[]
  githubIdeas?: string[]
}

// Notification Types (M8)
export type NotificationType =
  | "RESUME_ANALYSIS_COMPLETE"
  | "SKILL_GAP_UPDATE"
  | "INTERVIEW_REMINDER"
  | "JOB_MATCH"
  | "APPLICATION_UPDATE"
  | "ROADMAP_UPDATE"
  | "PROJECT_RECOMMENDATION"
  | "SYSTEM"
  | "MARKETING"

export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED"

export interface Notification {
  id:        string
  userId:    string
  type:      NotificationType
  title:     string
  message:   string
  status:    NotificationStatus
  actionUrl?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: Date | string
  readAt?:   Date | string | null
}

// Cover Letter Types (M7)
export type CoverLetterTone = "PROFESSIONAL" | "CONVERSATIONAL" | "ENTHUSIASTIC" | "FORMAL"
export type CoverLetterStatus = "DRAFT" | "FINAL" | "ARCHIVED"

export interface CoverLetter {
  id: string
  userId: string
  resumeId?: string | null
  jobDescriptionId?: string | null
  title: string
  jobTitle?: string | null
  company?: string | null
  tone: CoverLetterTone
  content: string
  wordCount?: number | null
  status: CoverLetterStatus
  aiGenerated: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

// Recruiter Types (M9)
export type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "FILLED" | "ARCHIVED"
export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "OFFER_EXTENDED"
  | "OFFER_ACCEPTED"
  | "OFFER_DECLINED"
  | "REJECTED"
  | "WITHDRAWN"

export interface RecruiterJob {
  id: string
  userId: string          // recruiter's user ID
  title: string
  company: string
  description: string
  requirements: string
  responsibilities: string
  benefits?: string | null
  skills: string[]
  location?: string | null
  salaryRange?: string | null
  employmentType?: string | null
  experienceLevel?: string | null
  remote: boolean
  status: JobStatus
  postedAt?: Date | string | null
  expiresAt?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  // Aggregated in API response
  applicantCount?: number
  averageMatchScore?: number | null
}

export interface ApplicationRecord {
  id: string
  userId: string          // student's user ID
  resumeId: string
  jobDescriptionId: string
  status: ApplicationStatus
  matchScore?: number | null
  submittedAt?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface RankedApplicant {
  applicationId: string
  userId: string
  candidateName: string
  candidateEmail: string
  candidateAvatar?: string | null
  resumeId: string
  resumeTitle: string
  atsScore?: number | null
  matchScore?: number | null
  applicationStatus: ApplicationStatus
  submittedAt?: Date | string | null
  skills: string[]
  experienceLevel?: string | null
  location?: string | null
}

export interface CandidateProfile {
  id: string
  email: string
  name?: string | null
  profile?: {
    firstName?: string | null
    lastName?: string | null
    displayName?: string | null
    avatar?: string | null
    bio?: string | null
    location?: string | null
    linkedinUrl?: string | null
    githubUrl?: string | null
    experienceLevel?: string | null
    targetRole?: string | null
  } | null
  resumes: {
    id: string
    title: string
    atsScore?: number | null
    analyzedAt?: Date | string | null
    createdAt: Date | string
    parsedData?: Record<string, unknown> | null
  }[]
  applications: {
    id: string
    jobDescriptionId: string
    status: ApplicationStatus
    matchScore?: number | null
    submittedAt?: Date | string | null
  }[]
}

// Admin Types (M10)
export interface AdminUser {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  emailVerified?: Date | string | null
  lastLoginAt?: Date | string | null
  createdAt: Date | string
  profile?: {
    displayName?: string | null
    firstName?: string | null
    lastName?: string | null
    avatar?: string | null
  } | null
  _count?: {
    resumes: number
    interviewSessions: number
    skillGaps: number
  }
}

export interface AdminStats {
  totalUsers: number
  totalStudents: number
  totalRecruiters: number
  totalAdmins: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
  totalResumes: number
  totalInterviews: number
  totalCoverLetters: number
  totalRoadmaps: number
  totalSkillGaps: number
  totalJobs: number
  newUsersToday: number
  newUsersPast7Days: number
  newUsersPast30Days: number
  aiCallsTotal: number
  aiCallsToday: number
  aiCallsByType: Record<string, number>
}

export interface AIUsageEntry {
  id: string
  userId?: string | null
  type: string
  status: string
  tokensUsed?: number | null
  latency?: number | null
  model?: string | null
  error?: string | null
  createdAt: Date | string
  user?: { email: string } | null
}
