/* 
 * Architectural Decision: Application Constants
 * - Centralized constants for consistency
 * - Easy to maintain and update
 * - Type-safe constant values
 * - Reusable across the application
 */

// API Constants
export const API_ROUTES = {
  AUTH: {
    SIGN_IN: '/api/auth/signin',
    SIGN_UP: '/api/auth/signup',
    SIGN_OUT: '/api/auth/signout',
    SESSION: '/api/auth/session',
  },
  RESUME: {
    UPLOAD: '/api/resume/upload',
    PARSE: '/api/resume/parse',
    ANALYZE: '/api/resume/analyze',
    ATS: '/api/resume/ats',
    LIST: '/api/resume/list',
  },
  JOBS: {
    CREATE: '/api/jobs/create',
    ANALYZE: '/api/jobs/analyze',
    MATCH: '/api/jobs/match',
    LIST: '/api/jobs/list',
  },
  SKILLS: {
    GAP_ANALYSIS: '/api/skills/gap-analysis',
    ROADMAP: '/api/skills/roadmap',
  },
  PROJECTS: {
    RECOMMEND: '/api/projects/recommend',
    LIST: '/api/projects/list',
  },
  INTERVIEW: {
    CREATE: '/api/interview/create',
    QUESTIONS: '/api/interview/questions',
    MOCK: '/api/interview/mock',
    FEEDBACK: '/api/interview/feedback',
  },
  COVER_LETTER: {
    GENERATE: '/api/cover-letter/generate',
  },
  ANALYTICS: {
    USER: '/api/analytics/user',
    PLATFORM: '/api/analytics/platform',
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
  },
} as const

// User Roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
} as const

// User Status
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
} as const

// Interview Types
export const INTERVIEW_TYPES = {
  TECHNICAL: 'TECHNICAL',
  BEHAVIORAL: 'BEHAVIORAL',
  MIXED: 'MIXED',
} as const

// Interview Status
export const INTERVIEW_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx'],
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// ATS Scoring
export const ATS_SCORING = {
  EXCELLENT: 90,
  GOOD: 75,
  AVERAGE: 60,
  POOR: 40,
} as const

// Skill Levels
export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const

// Project Difficulty
export const PROJECT_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  RESUME_ANALYSIS_COMPLETE: 'RESUME_ANALYSIS_COMPLETE',
  SKILL_GAP_UPDATE: 'SKILL_GAP_UPDATE',
  INTERVIEW_REMINDER: 'INTERVIEW_REMINDER',
  JOB_MATCH: 'JOB_MATCH',
  SYSTEM: 'SYSTEM',
} as const

// Learning Roadmap Status
export const ROADMAP_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
} as const

// Project Status
export const PROJECT_STATUS = {
  RECOMMENDED: 'recommended',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const

// Time Constants
export const TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const
