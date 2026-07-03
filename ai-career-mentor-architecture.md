# AI Career Mentor Platform - Software Architecture Document

## Executive Summary

The AI Career Mentor Platform is a production-ready, full-stack application designed to help students navigate their career development through AI-powered guidance. The platform addresses critical pain points in career preparation by providing intelligent resume analysis, skill gap identification, personalized learning roadmaps, and interview preparation tools.

**Key Differentiators:**
- AI-first approach using Gemini API for intelligent analysis
- Multi-role support (Student, Recruiter, Admin)
- Real-time ATS scoring and job matching
- Personalized learning paths based on industry standards
- Comprehensive interview preparation with AI-generated questions

---

## 1. System Overview

### 1.1 Problem Statement

Students face significant challenges in career preparation:
- Uncertainty about resume quality and effectiveness
- Lack of clarity on required skills for target roles
- Difficulty in selecting relevant projects to build
- Insufficient interview preparation resources
- Poor understanding of job description requirements

### 1.2 Solution Architecture

The platform acts as an AI-powered career mentor that:
- Analyzes resumes against industry standards and job descriptions
- Identifies skill gaps and provides personalized learning recommendations
- Suggests relevant projects based on career goals
- Generates interview questions and conducts mock interviews
- Matches candidates with job descriptions using ATS algorithms

### 1.3 User Roles

| Role | Description | Key Permissions |
|------|-------------|------------------|
| **Student** | Primary user seeking career guidance | Upload resumes, view analysis, access learning paths, take mock interviews |
| **Recruiter** | Reviews candidate profiles and matches | View candidate profiles, post job descriptions, access analytics |
| **Admin** | Platform management and oversight | Manage users, configure AI settings, view platform analytics, moderate content |

---

## 2. Technology Stack

### 2.1 Frontend Stack
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State Management:** React Context + Server Actions
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** Next.js Server Components + Fetch API

### 2.2 Backend Stack
- **Runtime:** Node.js 22+
- **API:** Next.js API Routes (App Router)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** Auth.js (NextAuth v5)
- **AI Integration:** Vercel AI SDK + Gemini API
- **File Processing:** Built-in Next.js file handling
- **PDF Parsing:** pdf-parse or similar library

### 2.3 Infrastructure
- **Hosting:** Vercel (Primary)
- **Database:** Neon PostgreSQL (Serverless) or Supabase
- **File Storage:** Vercel Blob or AWS S3
- **CDN:** Vercel Edge Network
- **Monitoring:** Vercel Analytics + Sentry
- **CI/CD:** GitHub Actions

---

## 3. Folder Structure

```
ai-career-mentor/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── test.yml
├── apps/
│   ├── web/                          # Next.js Frontend Application
│   │   ├── app/
│   │   │   ├── (auth)/              # Auth route group
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/         # Dashboard route group
│   │   │   │   ├── student/
│   │   │   │   │   ├── resume/
│   │   │   │   │   │   ├── upload/
│   │   │   │   │   │   ├── analysis/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── skills/
│   │   │   │   │   │   ├── gap-analysis/
│   │   │   │   │   │   ├── roadmap/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── projects/
│   │   │   │   │   │   ├── recommendations/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── interview/
│   │   │   │   │   │   ├── mock/
│   │   │   │   │   │   ├── questions/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── recruiter/
│   │   │   │   │   ├── candidates/
│   │   │   │   │   ├── jobs/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── admin/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── settings/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── api/                 # API Routes
│   │   │   │   ├── auth/
│   │   │   │   │   └── [...nextauth]/
│   │   │   │   ├── resume/
│   │   │   │   │   ├── upload/route.ts
│   │   │   │   │   ├── parse/route.ts
│   │   │   │   │   ├── analyze/route.ts
│   │   │   │   │   └── ats-score/route.ts
│   │   │   │   ├── jobs/
│   │   │   │   │   ├── analyze/route.ts
│   │   │   │   │   └── match/route.ts
│   │   │   │   ├── skills/
│   │   │   │   │   ├── gap-analysis/route.ts
│   │   │   │   │   └── roadmap/route.ts
│   │   │   │   ├── projects/
│   │   │   │   │   └── recommend/route.ts
│   │   │   │   ├── interview/
│   │   │   │   │   ├── questions/route.ts
│   │   │   │   │   ├── mock/route.ts
│   │   │   │   │   └── evaluate/route.ts
│   │   │   │   ├── cover-letter/
│   │   │   │   │   └── generate/route.ts
│   │   │   │   └── analytics/
│   │   │   │       └── route.ts
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── dashboard/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   └── navigation.tsx
│   │   │   ├── resume/
│   │   │   │   ├── uploader.tsx
│   │   │   │   ├── parser.tsx
│   │   │   │   ├── analyzer.tsx
│   │   │   │   └── ats-score.tsx
│   │   │   ├── skills/
│   │   │   │   ├── gap-chart.tsx
│   │   │   │   ├── roadmap-timeline.tsx
│   │   │   │   └── skill-card.tsx
│   │   │   ├── interview/
│   │   │   │   ├── question-generator.tsx
│   │   │   │   ├── mock-interview.tsx
│   │   │   │   └── feedback-panel.tsx
│   │   │   └── shared/
│   │   │       ├── loading-spinner.tsx
│   │   │       ├── error-boundary.tsx
│   │   │       └── notification-toast.tsx
│   │   ├── lib/
│   │   │   ├── auth/
│   │   │   │   ├── config.ts
│   │   │   │   └── utils.ts
│   │   │   ├── ai/
│   │   │   │   ├── gemini-client.ts
│   │   │   │   ├── prompts/
│   │   │   │   │   ├── resume-analysis.ts
│   │   │   │   │   ├── skill-gap.ts
│   │   │   │   │   ├── interview-questions.ts
│   │   │   │   │   └── cover-letter.ts
│   │   │   │   └── utils.ts
│   │   │   ├── db/
│   │   │   │   └── prisma.ts
│   │   │   ├── parsers/
│   │   │   │   ├── pdf-parser.ts
│   │   │   │   └── docx-parser.ts
│   │   │   ├── utils/
│   │   │   │   ├── validation.ts
│   │   │   │   ├── formatting.ts
│   │   │   │   └── constants.ts
│   │   │   └── hooks/
│   │   │       ├── use-auth.ts
│   │   │       ├── use-resume.ts
│   │   │       └── use-interview.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── public/
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   ├── styles/
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   └── docs/
│       ├── api/
│       │   ├── endpoints.md
│       │   └── authentication.md
│       ├── database/
│       │   ├── schema.md
│       │   └── migrations.md
│       └── deployment/
│           ├── vercel.md
│           └── environment-variables.md
├── packages/
│   ├── shared/                      # Shared utilities and types
│   │   ├── types/
│   │   ├── constants/
│   │   └── utils/
│   └── config/                      # Shared configuration
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── turbo.json
└── README.md
```

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
User (1) ----< (1) Resume
User (1) ----< (N) JobDescription
User (1) ----< (N) SkillAnalysis
User (1) ----< (N) LearningRoadmap
User (1) ----< (N) InterviewSession
User (1) ----< (N) ProjectRecommendation
JobDescription (1) ----< (N) JobMatch
Resume (1) ----< (N) ResumeSection
Resume (1) ----< (N) ATSScore
InterviewSession (1) ----< (N) InterviewQuestion
InterviewSession (1) ----< (1) InterviewFeedback
```

### 4.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== User Management ====================

enum UserRole {
  STUDENT
  RECRUITER
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  PENDING
}

model User {
  id            String      @id @default(cuid())
  email         String      @unique
  name          String?
  password      String?     // For credential auth
  image         String?
  emailVerified DateTime?
  role          UserRole    @default(STUDENT)
  status        UserStatus  @default(ACTIVE)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  resumes              Resume[]
  jobDescriptions      JobDescription[]
  skillAnalyses         SkillAnalysis[]
  learningRoadmaps      LearningRoadmap[]
  interviewSessions     InterviewSession[]
  projectRecommendations ProjectRecommendation[]
  notifications         Notification[]
  candidateMatches      CandidateMatch[] @relation("RecruiterMatches")

  @@index([email])
  @@index([role])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ==================== Resume Management ====================

model Resume {
  id          String   @id @default(cuid())
  userId      String
  title       String
  fileUrl     String
  fileName    String
  fileSize    Int
  fileType    String
  parsedData  Json?    // Structured resume data
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  sections     ResumeSection[]
  atsScores    ATSScore[]
  jobMatches   JobMatch[]

  @@index([userId])
}

model ResumeSection {
  id        String   @id @default(cuid())
  resumeId  String
  type      String   // education, experience, skills, projects
  content   Json     // Section content
  order     Int
  createdAt DateTime @default(now())

  resume Resume @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@index([resumeId])
}

model ATSScore {
  id          String   @id @default(cuid())
  resumeId    String
  overallScore Int     // 0-100
  keywordScore Int
  formatScore  Int
  contentScore Int
  details     Json     // Detailed breakdown
  createdAt   DateTime @default(now())

  resume Resume @relation(fields: [resumeId], references: [id], onDelete: Cascade)

  @@index([resumeId])
}

// ==================== Job Description ====================

model JobDescription {
  id          String   @id @default(cuid())
  userId      String   // Recruiter who posted it
  title       String
  company     String
  description String   @db.Text
  requirements String @db.Text
  skills      String[] // Array of required skills
  location    String?
  salaryRange String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  matches     JobMatch[]

  @@index([userId])
  @@index([isActive])
}

model JobMatch {
  id               String   @id @default(cuid())
  resumeId         String
  jobDescriptionId String
  matchScore       Int      // 0-100
  skillMatch       Int
  experienceMatch  Int
  details          Json
  createdAt        DateTime @default(now())

  resume         Resume         @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  jobDescription JobDescription @relation(fields: [jobDescriptionId], references: [id], onDelete: Cascade)

  @@unique([resumeId, jobDescriptionId])
  @@index([jobDescriptionId])
}

model CandidateMatch {
  id               String   @id @default(cuid())
  recruiterId      String
  studentId        String
  matchScore       Int
  status           String   // pending, contacted, rejected, hired
  notes            String?  @db.Text
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  recruiter User @relation("RecruiterMatches", fields: [recruiterId], references: [id], onDelete: Cascade)

  @@index([recruiterId])
  @@index([studentId])
  @@index([status])
}

// ==================== Skills & Learning ====================

model SkillAnalysis {
  id          String   @id @default(cuid())
  userId      String
  resumeId    String?
  targetRole  String
  presentSkills    String[]
  missingSkills    String[]
  recommendedSkills String[]
  analysisDetails  Json
  createdAt   DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model LearningRoadmap {
  id          String   @id @default(cuid())
  userId      String
  title       String
  targetRole  String
  duration    Int      // in weeks
  modules     Json     // Array of learning modules
  progress    Int      @default(0) // 0-100
  status      String   @default("active") // active, completed, paused
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model ProjectRecommendation {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String   @db.Text
  difficulty  String   // beginner, intermediate, advanced
  skills      String[]
  duration    String   // estimated time
  resources   Json     // Links to tutorials, docs
  status      String   @default("recommended") // recommended, in_progress, completed
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// ==================== Interview ====================

enum InterviewType {
  TECHNICAL
  BEHAVIORAL
  MIXED
}

enum InterviewStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model InterviewSession {
  id          String         @id @default(cuid())
  userId      String
  type        InterviewType
  jobRole     String
  status      InterviewStatus @default(SCHEDULED)
  duration    Int            // in minutes
  questions   Json           // Array of questions
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  user     User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  questions InterviewQuestion[]
  feedback  InterviewFeedback?

  @@index([userId])
  @@index([status])
}

model InterviewQuestion {
  id                String   @id @default(cuid())
  interviewSessionId String
  question          String   @db.Text
  type              String       // technical, behavioral
  category          String
  difficulty        String
  userAnswer        String?  @db.Text
  aiFeedback        String?  @db.Text
  score             Int?
  order             Int
  createdAt         DateTime @default(now())

  interviewSession InterviewSession @relation(fields: [interviewSessionId], references: [id], onDelete: Cascade)

  @@index([interviewSessionId])
}

model InterviewFeedback {
  id                String   @id @default(cuid())
  interviewSessionId String   @unique
  overallScore      Int      // 0-100
  strengths         String[] @db.Text
  weaknesses        String[] @db.Text
  recommendations   String   @db.Text
  createdAt         DateTime @default(now())

  interviewSession InterviewSession @relation(fields: [interviewSessionId], references: [id], onDelete: Cascade)
}

// ==================== Cover Letter ====================

model CoverLetter {
  id          String   @id @default(cuid())
  userId      String
  resumeId    String?
  jobTitle    String
  company     String
  content     String   @db.Text
  template    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

// ==================== Notifications ====================

enum NotificationType {
  RESUME_ANALYSIS_COMPLETE
  SKILL_GAP_UPDATE
  INTERVIEW_REMINDER
  JOB_MATCH
  SYSTEM
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String           @db.Text
  read      Boolean          @default(false)
  actionUrl String?
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([read])
}

// ==================== Analytics ====================

model AnalyticsEvent {
  id        String   @id @default(cuid())
  userId    String?
  eventType String
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([eventType])
  @@index([createdAt])
}
```

### 4.3 Database Indexes Strategy

- **Primary Indexes:** All primary keys
- **Foreign Key Indexes:** All foreign keys for join performance
- **Query Optimization Indexes:**
  - `User.email` - Authentication lookups
  - `User.role` - Role-based filtering
  - `Resume.userId` - User's resume queries
  - `JobDescription.isActive` - Active job listings
  - `InterviewSession.status` - Interview status filtering
  - `Notification.read` - Unread notification queries
  - `AnalyticsEvent.createdAt` - Time-based analytics

---

## 5. API Design

### 5.1 RESTful API Endpoints

#### Authentication Endpoints

```
POST   /api/auth/signin          - User sign-in
POST   /api/auth/signup          - User registration
POST   /api/auth/signout         - User sign-out
GET    /api/auth/session         - Get current session
POST   /api/auth/callback/[provider] - OAuth callback
```

#### Resume Endpoints

```
POST   /api/resume/upload        - Upload resume file
GET    /api/resume/[id]          - Get resume details
DELETE /api/resume/[id]          - Delete resume
POST   /api/resume/[id]/parse    - Parse resume content
POST   /api/resume/[id]/analyze  - AI resume analysis
GET    /api/resume/[id]/ats      - Get ATS score
GET    /api/resume/list          - List user's resumes
```

#### Job Description Endpoints

```
POST   /api/jobs/create          - Create job description (Recruiter)
GET    /api/jobs/[id]            - Get job details
PUT    /api/jobs/[id]            - Update job description
DELETE /api/jobs/[id]            - Delete job description
GET    /api/jobs/list            - List job descriptions
POST   /api/jobs/[id]/analyze    - Analyze job description
POST   /api/jobs/match           - Match resume to jobs
```

#### Skills & Learning Endpoints

```
POST   /api/skills/gap-analysis   - Analyze skill gaps
GET    /api/skills/gap/[id]       - Get skill gap analysis
POST   /api/skills/roadmap        - Generate learning roadmap
GET    /api/skills/roadmap/[id]   - Get learning roadmap
PUT    /api/skills/roadmap/[id]   - Update roadmap progress
```

#### Project Recommendations Endpoints

```
POST   /api/projects/recommend    - Get project recommendations
GET    /api/projects/list         - List recommended projects
PUT    /api/projects/[id]/status  - Update project status
```

#### Interview Endpoints

```
POST   /api/interview/create      - Create interview session
GET    /api/interview/[id]        - Get interview details
POST   /api/interview/[id]/start  - Start interview
POST   /api/interview/[id]/answer - Submit answer
GET    /api/interview/[id]/feedback - Get interview feedback
GET    /api/interview/questions   - Generate interview questions
GET    /api/interview/list        - List interview sessions
```

#### Cover Letter Endpoints

```
POST   /api/cover-letter/generate - Generate cover letter
GET    /api/cover-letter/[id]     - Get cover letter
PUT    /api/cover-letter/[id]     - Update cover letter
```

#### Analytics Endpoints

```
GET    /api/analytics/user        - User analytics
GET    /api/analytics/platform    - Platform analytics (Admin)
POST   /api/analytics/event       - Track analytics event
```

#### Notification Endpoints

```
GET    /api/notifications        - Get user notifications
PUT    /api/notifications/[id]/read - Mark as read
DELETE /api/notifications/[id]     - Delete notification
```

### 5.2 API Response Format

#### Success Response
```typescript
{
  success: true,
  data: T,
  message?: string,
  timestamp: string
}
```

#### Error Response
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  timestamp: string
}
```

### 5.3 API Authentication

- **Public Endpoints:** Sign-in, sign-up, public job listings
- **Authenticated Endpoints:** All user-specific endpoints
- **Role-Based Access:** Admin-only endpoints, Recruiter-only endpoints
- **Token-Based:** JWT tokens via HTTP Authorization header

---

## 6. Authentication Flow

### 6.1 Authentication Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Sign-in Request
       ▼
┌─────────────────┐
│  NextAuth.js    │
│  (Auth Config)  │
└──────┬──────────┘
       │
       │ 2. OAuth / Credentials
       ▼
┌─────────────────┐
│  OAuth Provider │
│  (Google/GitHub)│
└──────┬──────────┘
       │
       │ 3. OAuth Callback
       ▼
┌─────────────────┐
│  Database       │
│  (User/Session) │
└──────┬──────────┘
       │
       │ 4. Session Token
       ▼
┌─────────────────┐
│  Client (Cookie)│
└─────────────────┘
```

### 6.2 Auth.js Configuration

```typescript
// lib/auth/config.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Custom credential validation
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.id = token.id
      return session
    },
  },
})
```

### 6.3 Middleware Protection

```typescript
// middleware.ts
import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                     req.nextUrl.pathname.startsWith("/register")
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Role-based protection
  if (req.nextUrl.pathname.startsWith("/dashboard/admin")) {
    if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

---

## 7. AI Architecture

### 7.1 AI Integration Strategy

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Request
       ▼
┌─────────────────┐
│  Next.js API     │
│  (Server Action) │
└──────┬──────────┘
       │
       │ 2. Process & Validate
       ▼
┌─────────────────┐
│  Vercel AI SDK   │
│  (Stream Handler)│
└──────┬──────────┘
       │
       │ 3. AI Request
       ▼
┌─────────────────┐
│  Gemini API      │
│  (AI Model)      │
└──────┬──────────┘
       │
       │ 4. AI Response
       ▼
┌─────────────────┐
│  Process & Store │
└──────┬──────────┘
       │
       │ 5. Response
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

### 7.2 Gemini API Integration

```typescript
// lib/ai/gemini-client.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiClient = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
})

export async function generateContent(
  prompt: string,
  systemInstruction?: string
) {
  const model = systemInstruction
    ? genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction,
      })
    : geminiClient

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function generateStream(
  prompt: string,
  systemInstruction?: string
) {
  const model = systemInstruction
    ? genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction,
      })
    : geminiClient

  const result = await model.generateContentStream(prompt)
  return result.stream
}
```

### 7.3 AI Prompt Templates

#### Resume Analysis Prompt
```typescript
// lib/ai/prompts/resume-analysis.ts
export const RESUME_ANALYSIS_PROMPT = `
You are an expert career coach and ATS (Applicant Tracking System) specialist.
Analyze the following resume and provide:

1. Overall Assessment (score 0-100)
2. Strengths (3-5 key points)
3. Weaknesses (3-5 key points)
4. Keyword Analysis (present/missing keywords)
5. Format Score (0-100)
6. Content Score (0-100)
7. Specific Recommendations for improvement

Resume Content:
{resumeContent}

Target Job Role (if provided):
{targetRole}

Respond in JSON format with the following structure:
{
  "overallScore": number,
  "strengths": string[],
  "weaknesses": string[],
  "keywords": {
    "present": string[],
    "missing": string[]
  },
  "formatScore": number,
  "contentScore": number,
  "recommendations": string[]
}
`
```

#### Skill Gap Analysis Prompt
```typescript
// lib/ai/prompts/skill-gap.ts
export const SKILL_GAP_PROMPT = `
You are an expert technical career advisor.
Analyze the skill gap between the user's current skills and the target role.

User's Current Skills:
{currentSkills}

Target Role:
{targetRole}

Job Description:
{jobDescription}

Provide:
1. Present Skills (matched)
2. Missing Skills (critical gaps)
3. Recommended Skills (nice-to-have)
4. Learning Priority (high/medium/low for each missing skill)
5. Estimated learning time for each skill

Respond in JSON format:
{
  "presentSkills": string[],
  "missingSkills": [{
    "skill": string,
    "priority": "high" | "medium" | "low",
    "estimatedTime": string
  }],
  "recommendedSkills": string[]
}
`
```

#### Interview Questions Prompt
```typescript
// lib/ai/prompts/interview-questions.ts
export const INTERVIEW_QUESTIONS_PROMPT = `
You are an expert technical interviewer.
Generate interview questions for the given role and difficulty level.

Role: {role}
Difficulty: {difficulty}
Type: {type} (technical/behavioral/mixed)
Number of Questions: {count}

For each question, provide:
1. Question text
2. Category (e.g., algorithms, system design, behavioral)
3. Difficulty level
4. Expected key points in answer

Respond in JSON format:
{
  "questions": [{
    "question": string,
    "category": string,
    "difficulty": string,
    "keyPoints": string[]
  }]
}
`
```

#### Cover Letter Prompt
```typescript
// lib/ai/prompts/cover-letter.ts
export const COVER_LETTER_PROMPT = `
You are an expert career coach and professional writer.
Generate a personalized cover letter based on the resume and job description.

Resume Content:
{resumeContent}

Job Title: {jobTitle}
Company: {company}
Job Description:
{jobDescription}

Requirements:
- Professional tone
- Highlight relevant experience
- Show enthusiasm for the role
- Keep it concise (300-400 words)
- Include specific examples from resume

Generate the cover letter in plain text format.
`
```

### 7.4 AI Response Processing

```typescript
// lib/ai/utils.ts
export function parseAIResponse<T>(response: string): T {
  try {
    // Extract JSON from response if it contains markdown code blocks
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                      response.match(/```\n([\s\S]*?)\n```/)
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    
    return JSON.parse(response)
  } catch (error) {
    console.error("Failed to parse AI response:", error)
    throw new Error("Invalid AI response format")
  }
}

export function validateAIResponse<T>(
  response: T,
  schema: z.ZodSchema<T>
): T {
  return schema.parse(response)
}
```

### 7.5 Streaming Implementation

```typescript
// app/api/interview/mock/route.ts
import { generateStream } from "@/lib/ai/gemini-client"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { question, userAnswer } = await req.json()

  const prompt = `
  Evaluate the following interview answer:
  
  Question: ${question}
  User's Answer: ${userAnswer}
  
  Provide feedback on:
  1. Accuracy (0-100)
  2. Completeness (0-100)
  3. Clarity (0-100)
  4. Specific feedback
  5. Suggestions for improvement
  `

  const result = await streamText({
    model: generateStream(prompt),
    prompt,
  })

  return result.toAIStreamResponse()
}
```

---

## 8. Deployment Architecture

### 8.1 Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CDN (Vercel Edge)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel (Application Hosting)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Next.js App │  │  API Routes  │  │  Serverless  │ │
│  │  (Static)    │  │  (Dynamic)   │  │  Functions   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │  Vercel Blob │ │  Gemini API  │
│  (Neon/Supa) │ │  (File Store)│ │  (AI Service)│
└──────────────┘ └──────────────┘ └──────────────┘
```

### 8.2 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# AI Services
GEMINI_API_KEY="..."

# File Storage
BLOB_READ_WRITE_TOKEN="..."

# Monitoring
SENTRY_DSN="..."
NEXT_PUBLIC_SENTRY_DSN="..."

# Analytics
NEXT_PUBLIC_GA_ID="..."
```

### 8.3 Deployment Strategy

#### Development
```bash
# Local development with Turborepo
npm run dev
```

#### Staging
```bash
# Deploy to Vercel preview environment
vercel deploy --preview
```

#### Production
```bash
# Deploy to Vercel production
vercel deploy --prod
```

### 8.4 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 9. Scalability Strategy

### 9.1 Horizontal Scaling

- **Serverless Functions:** Vercel automatically scales based on demand
- **Database Connection Pooling:** Prisma with connection pooling
- **CDN Caching:** Static assets and API responses cached at edge
- **Rate Limiting:** API rate limiting to prevent abuse

### 9.2 Vertical Scaling

- **Database Optimization:** 
  - Read replicas for analytics queries
  - Connection pooling with PgBouncer
  - Query optimization with proper indexes

- **AI API Optimization:**
  - Response caching for similar queries
  - Batch processing for bulk operations
  - Fallback to smaller models for simple tasks

### 9.3 Performance Optimization

#### Frontend Optimization
- **Code Splitting:** Route-based and component-based splitting
- **Image Optimization:** Next.js Image component with WebP
- **Font Optimization:** Next.js Font with self-hosting
- **Lazy Loading:** Components and routes loaded on demand

#### Backend Optimization
- **API Response Caching:** Redis for frequently accessed data
- **Database Query Optimization:** 
  - N+1 query prevention with Prisma includes
  - Query result caching
- **File Upload Optimization:** 
  - Chunked uploads for large files
  - Compression before storage

### 9.4 Load Balancing

- **Edge Functions:** Vercel Edge Network for global distribution
- **Database Load Balancing:** Read replicas for analytics
- **CDN Load Balancing:** Automatic geographic distribution

---

## 10. Security Strategy

### 10.1 Authentication Security

- **Password Security:**
  - bcrypt hashing with salt rounds >= 12
  - Password strength validation
  - Rate limiting on auth endpoints

- **Session Security:**
  - HTTP-only, secure, same-site cookies
  - Short-lived session tokens (1 hour)
  - Refresh token rotation

- **OAuth Security:**
  - PKCE flow for mobile apps
  - State parameter validation
  - Token validation on each request

### 10.2 Data Security

- **Encryption:**
  - TLS 1.3 for all connections
  - At-rest encryption for database
  - Encrypted file storage

- **Data Validation:**
  - Input validation with Zod schemas
  - SQL injection prevention with Prisma
  - XSS prevention with React escaping

- **PII Protection:**
  - Data minimization principle
  - GDPR compliance measures
  - Right to deletion implementation

### 10.3 API Security

- **Rate Limiting:**
  - Per-user rate limits
  - Per-IP rate limits
  - Exponential backoff

- **CORS Configuration:**
  - Strict CORS policies
  - Whitelisted origins only
  - Preflight request handling

- **API Key Security:**
  - Environment variable storage
  - Key rotation policies
  - Scoped permissions

### 10.4 File Upload Security

- **File Type Validation:**
  - MIME type verification
  - Magic number validation
  - File extension whitelisting

- **File Size Limits:**
  - Maximum file size (10MB)
  - Chunked upload for large files
  - Storage quota per user

- **Malware Scanning:**
  - Virus scanning integration
  - Sandbox execution for files
  - Quarantine for suspicious files

### 10.5 Monitoring & Logging

- **Security Monitoring:**
  - Failed login attempt tracking
  - Anomaly detection
  - Real-time alerting

- **Audit Logging:**
  - User action logging
  - Admin action logging
  - Data access logging

- **Error Handling:**
  - Secure error messages
  - Stack trace protection
  - Error rate monitoring

---

## 11. Coding Standards

### 11.1 TypeScript Standards

- **Strict Mode:** Enable all strict type checking options
- **Type Definitions:** Explicit types for all functions
- **Interface vs Type:** Use interfaces for object shapes, types for unions
- **Generic Types:** Use generics for reusable components
- **No Any:** Avoid `any` type, use `unknown` with type guards

```typescript
// Good
interface User {
  id: string
  name: string
  email: string
}

async function getUser(id: string): Promise<User> {
  // Implementation
}

// Bad
async function getUser(id: any): Promise<any> {
  // Implementation
}
```

### 11.2 React Standards

- **Functional Components:** Use functional components with hooks
- **Props Interface:** Define props interfaces explicitly
- **Custom Hooks:** Extract reusable logic into custom hooks
- **Server Components:** Use Server Components by default
- **Client Components:** Mark with 'use client' only when needed

```typescript
// Good
'use client'

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const { user, loading } = useUser(userId)
  
  if (loading) return <LoadingSpinner />
  return <UserProfileCard user={user} />
}

// Bad
export default function UserProfile({ userId }: any) {
  // Implementation
}
```

### 11.3 API Standards

- **Error Handling:** Consistent error response format
- **Validation:** Input validation with Zod schemas
- **Status Codes:** Appropriate HTTP status codes
- **Response Format:** Consistent JSON structure

```typescript
// Good
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'RECRUITER', 'ADMIN']),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = CreateUserSchema.parse(body)
    // Process request
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
```

### 11.4 Database Standards

- **Prisma Best Practices:**
  - Use typed queries with Prisma Client
  - Leverage includes for eager loading
  - Use transactions for multi-step operations
  - Implement soft deletes where appropriate

```typescript
// Good
const userWithResumes = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    resumes: {
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    },
  },
})

// Bad - N+1 query problem
const user = await prisma.user.findUnique({ where: { id: userId } })
const resumes = await prisma.resume.findMany({ where: { userId } })
```

### 11.5 Code Organization

- **File Naming:** kebab-case for files, PascalCase for components
- **Folder Structure:** Feature-based organization
- **Import Order:** External, internal, relative
- **Export Strategy:** Named exports for utilities, default for components

```typescript
// Import order
import React from 'react'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generateContent } from '@/lib/ai/gemini-client'
```

### 11.6 Testing Standards

- **Unit Tests:** Test individual functions and components
- **Integration Tests:** Test API endpoints and database operations
- **E2E Tests:** Test critical user flows
- **Test Coverage:** Minimum 80% coverage

```typescript
// Example unit test
import { describe, it, expect } from 'vitest'
import { parseAIResponse } from '@/lib/ai/utils'

describe('parseAIResponse', () => {
  it('should parse valid JSON response', () => {
    const response = '{"score": 85, "feedback": "Good"}'
    const result = parseAIResponse(response)
    expect(result).toEqual({ score: 85, feedback: 'Good' })
  })

  it('should extract JSON from markdown code blocks', () => {
    const response = '```json\n{"score": 85}\n```'
    const result = parseAIResponse(response)
    expect(result).toEqual({ score: 85 })
  })
})
```

### 11.7 Git Standards

- **Commit Messages:** Conventional Commits format
- **Branch Naming:** feature/description, fix/description
- **Pull Requests:** Descriptive title and template
- **Code Review:** Required for all changes

```
feat: add resume upload functionality
fix: resolve ATS score calculation bug
docs: update API documentation
refactor: improve AI response parsing
```

---

## 12. Monitoring & Analytics

### 12.1 Application Monitoring

- **Vercel Analytics:** Real-time performance metrics
- **Sentry:** Error tracking and alerting
- **Custom Analytics:** User behavior tracking

### 12.2 Key Metrics

- **Performance Metrics:**
  - Page load time
  - API response time
  - Time to Interactive

- **Business Metrics:**
  - User registration rate
  - Resume upload count
  - Interview completion rate
  - Skill gap analysis usage

- **Technical Metrics:**
  - Error rate
  - API success rate
  - Database query performance
  - AI API latency

### 12.3 Alerting

- **Critical Alerts:**
  - Database connection failures
  - AI API outages
  - Authentication failures
  - Error rate > 5%

- **Warning Alerts:**
  - High memory usage
  - Slow API responses (> 2s)
  - Rate limit breaches

---

## 13. Development Workflow

### 13.1 Local Development Setup

```bash
# Clone repository
git clone <repository-url>
cd ai-career-mentor

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Setup database
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

### 13.2 Git Workflow

```
main (production)
  ↑
  develop (staging)
    ↑
    feature/* (feature branches)
    fix/* (bug fixes)
```

### 13.3 Code Review Process

1. Create feature branch from develop
2. Implement changes with tests
3. Create pull request with description
4. Automated checks (CI/CD)
5. Code review by team
6. Address feedback
7. Merge to develop
8. Deploy to staging for testing
9. Merge to main for production

---

## 14. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Project setup and configuration
- Database schema design
- Authentication implementation
- Basic UI components

### Phase 2: Core Features (Week 3-4)
- Resume upload and parsing
- AI resume analysis
- ATS scoring
- Basic dashboard

### Phase 3: Advanced Features (Week 5-6)
- Skill gap analysis
- Learning roadmap
- Project recommendations
- Interview question generator

### Phase 4: Interview Features (Week 7-8)
- Mock interview functionality
- AI feedback system
- Cover letter generator

### Phase 5: Recruiter Features (Week 9-10)
- Job description management
- Candidate matching
- Recruiter dashboard

### Phase 6: Admin & Analytics (Week 11-12)
- Admin dashboard
- Platform analytics
- User management
- System configuration

### Phase 7: Testing & Optimization (Week 13-14)
- Comprehensive testing
- Performance optimization
- Security audit
- Documentation

---

## 15. Conclusion

This architecture document provides a comprehensive blueprint for building a production-ready AI Career Mentor Platform. The design emphasizes:

- **Scalability:** Serverless architecture with automatic scaling
- **Security:** Multi-layer security approach with best practices
- **Performance:** Optimized for speed with caching and CDN
- **Maintainability:** Clean code architecture with proper separation of concerns
- **User Experience:** Modern, responsive UI with real-time AI interactions

The architecture is designed to be flexible and adaptable to future requirements while maintaining high standards for code quality and system reliability.

---

## Appendix

### A. Technology Justification

| Technology | Rationale |
|------------|-----------|
| Next.js 16 | Latest features, App Router, Server Components |
| React 19 | Latest React features and performance improvements |
| TypeScript | Type safety, better developer experience |
| Tailwind CSS | Utility-first, rapid UI development |
| shadcn/ui | Modern, accessible components |
| PostgreSQL | Robust relational database with advanced features |
| Prisma | Type-safe ORM with excellent DX |
| Auth.js | Flexible authentication solution |
| Gemini API | Advanced AI capabilities with good performance |
| Vercel AI SDK | Seamless AI integration with Next.js |

### B. Risk Assessment

| Risk | Mitigation |
|------|------------|
| AI API rate limits | Implement caching and fallback strategies |
| Database performance | Proper indexing, connection pooling, read replicas |
| File upload abuse | Strict validation, rate limiting, malware scanning |
| Security vulnerabilities | Regular audits, dependency updates, security testing |
| Scalability issues | Serverless architecture, monitoring, auto-scaling |

### C. Success Criteria

- **Technical:**
  - 99.9% uptime
  - < 2s page load time
  - < 500ms API response time
  - 80%+ test coverage

- **Business:**
  - 1000+ registered users in first 3 months
  - 500+ resumes analyzed
  - 200+ interview sessions completed
  - 4.5+ star user rating

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-03  
**Author:** AI System Architecture Team  
**Status:** Ready for Review
