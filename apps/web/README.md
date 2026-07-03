# AI Career Mentor Platform

> An AI-powered full-stack career mentorship platform that helps students and freshers navigate their career development through intelligent resume analysis, skill gap identification, personalised learning roadmaps, and interview preparation.

**Live Demo:** [https://ai-career-mentor.vercel.app](https://ai-career-mentor.vercel.app)  
**GitHub:** [https://github.com/therohanbondre](https://github.com/therohanbondre)  
**Author:** [Rohan Bondre](https://www.linkedin.com/in/rohan-bondre1/)

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [AI Integration](#ai-integration)
- [Architecture](#architecture)
- [Security](#security)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Code Quality](#code-quality)
- [Real-World Considerations](#real-world-considerations)
- [Demo Credentials](#demo-credentials)

---

## Problem Statement

Students and freshers face significant challenges in career preparation:

- They don't know whether their resume is ATS-friendly
- They can't tell if they match a specific job description
- They don't know which skills are missing for their target role
- They lack guidance on which projects to build for their portfolio
- They have no structured way to prepare for interviews

**Existing solutions** are either generic (LinkedIn tips), expensive (career coaches), or passive (static templates). None combine resume analysis + skill gap + roadmap + interview prep in one intelligent, personalised system.

---

## Solution

AI Career Mentor acts as a **personal AI career coach** available 24/7. It:

1. Analyses your resume against ATS algorithms and gives you a score with actionable fixes
2. Compares your resume against any job description to surface exact skill gaps
3. Generates a personalised week-by-week learning roadmap from those gaps
4. Recommends portfolio projects tailored to your target role
5. Runs AI mock interviews with per-answer scoring and model answers
6. Generates tailored cover letters in your chosen tone
7. Notifies you asynchronously when AI tasks complete

This is **not a basic CRUD app** — every meaningful feature is powered by Google Gemini AI with structured prompt engineering, typed JSON responses, and persistent analysis results.

---

## Tech Stack

### Mandatory (per assignment)

| Technology | Version | Usage |
|---|---|---|
| **Next.js** | 16.2 | Full-stack framework (App Router, API Routes, SSR) |
| **React** | 19 | UI with Server and Client Components |
| **TypeScript** | 5 | Strict type safety throughout |
| **Tailwind CSS** | 4 | Utility-first styling |
| **PostgreSQL** | 15+ | Primary relational database |
| **Git** | — | Version control |

### Core Dependencies

| Technology | Usage |
|---|---|
| **Prisma ORM** | Type-safe database access, migrations, seeding |
| **Auth.js v5** | Authentication (JWT, Google OAuth, GitHub OAuth, Credentials) |
| **Google Gemini API** | All AI features (`@google/generative-ai`) |
| **shadcn/ui + Radix UI** | Accessible component library |
| **Zod** | Runtime input validation and sanitisation |
| **React Hook Form** | Form state management |
| **Recharts** | Data visualisation in dashboard |
| **Nodemailer** | Transactional email (verification, password reset) |
| **bcryptjs** | Password hashing (cost factor 12) |
| **date-fns** | Date formatting |
| **pdf-parse + mammoth** | PDF/DOCX text extraction for resume parsing |

---

## Features

### Student Portal

| Feature | Description |
|---|---|
| **Register / Login** | Email + password with email verification, Google OAuth, GitHub OAuth |
| **Resume Upload** | PDF/DOCX upload (max 10 MB), drag-and-drop, version history |
| **Resume Parsing** | Extracts name, email, phone, skills, experience, education, projects |
| **ATS Analysis** | Grammar, formatting, achievements, keyword, ATS compatibility scores |
| **Resume Improvement** | Prioritised actionable improvement suggestions per category |
| **Job Description Analysis** | Paste any JD → overall/skill/experience/education match scores |
| **Skill Gap Analysis** | Missing skills by priority (CRITICAL / HIGH / MEDIUM / LOW) |
| **Learning Roadmap** | AI-generated week-by-week plan with resources and milestones |
| **Project Recommendations** | Portfolio projects tailored to role, difficulty, and skill gaps |
| **Mock Interview** | Role + type + difficulty → questions → per-answer AI evaluation |
| **Cover Letter Generator** | 4 tone options, inline editor, word count, copy-with-subject |
| **Notifications** | Real-time bell badge, full notifications page, mark-read / archive |
| **Dashboard** | Score cards, charts, recent resumes, roadmap progress |

### Recruiter Portal

| Feature | Description |
|---|---|
| **Post Jobs** | Full job creation form with skills, employment type, experience level |
| **Manage Jobs** | Draft → Active → Closed lifecycle, edit, delete |
| **View Applicants** | Ranked by ATS/match score with profile preview |
| **Candidate Profiles** | Full candidate profile with resume data |

### Authentication & Authorisation

| Feature | Description |
|---|---|
| **Multi-provider** | Google OAuth, GitHub OAuth, Email/Password |
| **Email verification** | PENDING → ACTIVE flow with 24 h token |
| **Password reset** | Secure 1-hour token via email |
| **JWT sessions** | 30-day expiry, role + status in token |
| **RBAC** | Edge middleware protects routes per role (STUDENT / RECRUITER / ADMIN) |
| **Account status** | PENDING users redirected to verification notice |

---

## AI Integration

All AI features use **Google Gemini 1.5 Pro** with structured JSON prompting.

| Function | Description |
|---|---|
| `analyzeResume()` | Full resume analysis: grammar, formatting, achievements, ATS scores |
| `analyzeJobMatch()` | Resume vs JD: 4-dimension match scores + matched/missing skills |
| `analyzeSkillGap()` | Present/missing/recommended skills with learning paths |
| `generateLearningRoadmap()` | Week-by-week plan with resources, milestones, estimated hours |
| `recommendProjects()` | 5–7 portfolio projects with tech stack, features, GitHub ideas |
| `generateInterviewQuestions()` | Role-specific questions with hints, tags, expected duration |
| `evaluateAnswer()` | Per-answer scoring: grade A–F, strengths, improvements, model answer |
| `generateCoverLetter()` | Tailored letter with tone, highlights, email subject line |

Each function:
- Uses structured JSON prompts with explicit output schemas
- Validates and sanitises the response before returning
- Never throws in notification hooks (fire-and-forget pattern)

---

## Architecture

```
ai-career-mentor/
├── apps/
│   └── web/                        # Next.js 16 application
│       ├── app/
│       │   ├── api/                # API Routes (server-side)
│       │   │   ├── auth/           # signup, login, verify-email, reset-password
│       │   │   ├── resumes/        # upload, parse, analyze, CRUD
│       │   │   ├── jobs/           # analyze, save, list
│       │   │   ├── skills/         # gap-analysis, roadmap/generate, gaps
│       │   │   ├── interviews/     # generate, answer, evaluate, complete
│       │   │   ├── projects/       # recommend, catalog, status
│       │   │   ├── cover-letter/   # generate, CRUD
│       │   │   ├── notifications/  # list, mark-read, mark-all-read
│       │   │   └── recruiter/      # jobs, applicants, candidates
│       │   ├── dashboard/          # Protected dashboard pages
│       │   ├── login/ register/    # Auth pages
│       │   └── page.tsx            # Marketing landing page
│       ├── components/
│       │   ├── dashboard/          # Sidebar, score cards, charts
│       │   ├── resume/             # Upload, list, preview modals
│       │   ├── jobs/               # JD form, match score, skill gap
│       │   ├── roadmap/            # Timeline, module cards
│       │   ├── projects/           # Project grid, project cards
│       │   ├── interviews/         # Setup, question card, feedback
│       │   ├── cover-letter/       # Form, editor, list
│       │   ├── notifications/      # Bell, item, page
│       │   ├── recruiter/          # Job posting form, applicant table
│       │   └── ui/                 # shadcn/ui base components
│       ├── lib/
│       │   ├── ai/gemini.ts        # All Gemini AI functions
│       │   ├── auth/               # Auth config, utils, types
│       │   ├── email/              # Nodemailer service
│       │   ├── notifications/      # Notification service
│       │   ├── resume/             # Parser, parser-utils
│       │   ├── job/                # Job description parser
│       │   └── hooks/              # useResume, useInterview, useToast
│       ├── prisma/
│       │   ├── schema.prisma       # Complete database schema (20+ models)
│       │   └── seed.ts             # Demo users + skills taxonomy
│       └── types/index.ts          # Centralised TypeScript types
```

### Data Flow

```
User Action → Next.js API Route → Zod Validation → Prisma (PostgreSQL)
                                       ↓
                              Gemini AI (structured JSON)
                                       ↓
                              Persist results → Create Notification
                                       ↓
                              Return response to client
```

---

## Security

| Concern | Implementation |
|---|---|
| **Password hashing** | bcrypt cost factor 12 |
| **Input validation** | Zod schemas on every API route |
| **CSRF** | SameSite cookies + origin validation |
| **RBAC** | Edge middleware — no client-side-only checks |
| **JWT** | 30-day sessions, role + status embedded |
| **Email enumeration** | Forgot-password always returns 200 |
| **Account status** | PENDING/SUSPENDED/DELETED checked at auth layer |
| **Security headers** | X-Frame-Options, X-Content-Type-Options, HSTS, CSP in `next.config.ts` |
| **File validation** | MIME type check, 10 MB size limit |
| **SQL injection** | Prisma parameterised queries — no raw SQL |
| **Secret management** | All secrets in environment variables, never committed |

---

## Getting Started

### Prerequisites

- **Node.js** 22+
- **npm** 10+
- **PostgreSQL** 15+ (local or cloud — Neon, Supabase, Railway all work)
- A **Google Gemini API key** — [get one free here](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/therohanbondre/ai-career-mentor.git
cd ai-career-mentor

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your actual values (see Environment Variables section)

# 4. Generate Prisma client and push schema to your database
npm run db:generate
npm run db:push

# 5. Seed the database with demo users and skills
npm run db:seed

# 6. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**

---

## Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env` and fill in these values:

```env
# ─── Required ─────────────────────────────────────────────────────────────────

# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/ai_career_mentor"

# Auth.js secret — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini AI — https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-api-key"

# ─── OAuth (optional in dev, required in prod) ────────────────────────────────

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# ─── Email (optional in dev — uses Ethereal catch-all automatically) ─────────

SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-pass"
SMTP_FROM='"AI Career Mentor" <noreply@aicareermentor.app>'

# ─── App URL ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Email in development:** If no SMTP vars are set, Nodemailer automatically uses [Ethereal](https://ethereal.email) — a catch-all test inbox. The preview URL is printed to the console on every email sent. No configuration needed.

---

## Database Setup

```bash
# Generate Prisma client types
npm run db:generate

# Push schema to database (development — no migration files)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Seed demo data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Seeded Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@aicareermentor.app` | `Admin@1234` |
| Student | `student@aicareermentor.app` | `Student@1234` |
| Recruiter | `recruiter@aicareermentor.app` | `Recruiter@1234` |

---

## Project Structure

### Key Files

| File | Purpose |
|---|---|
| `apps/web/lib/ai/gemini.ts` | All 8 Gemini AI functions with typed interfaces |
| `apps/web/lib/auth/config.ts` | Auth.js config — providers, callbacks, RBAC |
| `apps/web/middleware.ts` | Edge middleware — route protection, role checks |
| `apps/web/prisma/schema.prisma` | Full database schema — 20+ models, 15+ enums |
| `apps/web/lib/notifications/service.ts` | Notification service — createNotification() |
| `apps/web/lib/email/nodemailer.ts` | Email service — verification + password reset |
| `apps/web/types/index.ts` | Centralised TypeScript type definitions |

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run format       # Prettier format
npm run typecheck    # TypeScript type check
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed demo data
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/verify-email?token=` | Verify email address |
| POST | `/api/auth/resend-verification` | Resend verification email |

### Resumes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/resumes` | List user's resumes |
| POST | `/api/resumes/upload` | Upload PDF/DOCX resume |
| GET/PATCH/DELETE | `/api/resumes/[id]` | Resume CRUD |
| POST | `/api/resumes/[id]/parse` | Extract structured data |
| POST | `/api/resumes/[id]/analyze` | AI analysis + ATS score |

### Jobs & Skills

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/jobs/analyze` | Analyze JD vs resume (AI) |
| POST | `/api/jobs/save` | Save job to dashboard |
| GET | `/api/jobs` | List saved jobs |
| POST | `/api/skills/gap-analysis` | Standalone skill gap analysis |
| POST | `/api/skills/roadmap/generate` | Generate learning roadmap (AI) |
| GET | `/api/skills/roadmap` | List user's roadmaps |
| PATCH | `/api/skills/roadmap/[id]/progress` | Update module completion |

### Interviews

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interviews/generate` | Generate questions + create session |
| GET | `/api/interviews` | List interview sessions |
| GET | `/api/interviews/[id]` | Session with all answers |
| POST | `/api/interviews/[id]/answer` | Submit an answer |
| POST | `/api/interviews/[id]/evaluate` | AI-evaluate an answer |
| POST | `/api/interviews/[id]/complete` | Finalize session + overall score |

### Cover Letters & Notifications

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/cover-letter/generate` | Generate cover letter (AI) |
| GET | `/api/cover-letters` | List saved cover letters |
| GET/PATCH/DELETE | `/api/cover-letter/[id]` | Cover letter CRUD |
| GET | `/api/notifications` | List notifications + unread count |
| PATCH | `/api/notifications/[id]` | Mark read / archive |
| PATCH | `/api/notifications/mark-all-read` | Bulk mark-all-read |

---

## Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```

### Required Environment Variables on Vercel

Set all variables from `.env.example` in your Vercel project settings. For the database, use a serverless-compatible Postgres provider:

- **[Neon](https://neon.tech)** — free tier, serverless Postgres, Vercel integration
- **[Supabase](https://supabase.com)** — free tier, full Postgres
- **[Railway](https://railway.app)** — free tier, simple setup

### CI/CD

The project is configured for automatic Vercel deployments:

- Every push to `main` triggers a production deployment
- Every pull request gets a preview deployment URL
- TypeScript and ESLint checks run before build

---

## Code Quality

### Standards Enforced

| Tool | Configuration | Purpose |
|---|---|---|
| **TypeScript** | `strict: true` | Full type safety, no implicit `any` |
| **ESLint** | Next.js + Prettier rules | Code consistency |
| **Prettier** | Tailwind CSS plugin | Automatic formatting |
| **Husky** | Pre-commit hooks | Lint + format on commit |

### Patterns Used

- **Server Components by default** — client boundary only where state is needed
- **Parallel data fetching** — `Promise.all()` for independent queries
- **Optimistic UI updates** — immediate state updates before server confirmation
- **Error boundaries** — graceful error handling at component level
- **Zod validation** — every API route validates input before DB access
- **Never-throw notifications** — notification failures cannot break feature routes

---

## Real-World Considerations

### Scalability

- Prisma connection pooling prevents connection exhaustion under load
- All database models have appropriate indexes on frequently queried columns
- AI calls are parallelised where independent (`Promise.all`)
- Heavy components (`Recharts`) are lazy-loaded with `next/dynamic`

### Error Handling

- All API routes return consistent `{ success, error: { code, message } }` shape
- AI failures return typed error responses, never crash the calling route
- Email failures are non-fatal — logged but swallowed so registration still succeeds
- File parsing errors return clear user-facing messages

### Security in Production

- Security headers (CSP, HSTS, X-Frame-Options) applied to every response
- Passwords never stored or logged — only bcrypt hashes
- OAuth tokens never exposed to the client
- RBAC enforced at the network edge (middleware), not just client-side
- All SQL access through Prisma's parameterised query layer

### Performance

- Dashboard data fetched server-side with `async/await` in Server Components
- Resume text cached in `parsedData.rawText` to avoid re-parsing on every analysis
- Notification polling at 60-second intervals (not real-time WebSocket) to reduce server load
- Images optimised through `next/image` with remote pattern allowlist

---

## Submission Details

- **Name:** Rohan Bondre
- **GitHub:** [https://github.com/therohanbondre](https://github.com/therohanbondre)
- **LinkedIn:** [https://www.linkedin.com/in/rohan-bondre1/](https://www.linkedin.com/in/rohan-bondre1/)
- **Live Deployment:** [https://ai-career-mentor.vercel.app](https://ai-career-mentor.vercel.app)

---

## Assignment Checklist

| Requirement | Status |
|---|---|
| Next.js 16 | ✅ |
| React 19 + TypeScript | ✅ |
| Tailwind CSS + shadcn/ui | ✅ |
| PostgreSQL + Prisma ORM | ✅ |
| AI Integration (Gemini) | ✅ |
| Authentication + JWT | ✅ |
| RBAC + Authorization | ✅ |
| CRUD Operations | ✅ |
| Input Validation + Sanitization | ✅ |
| Responsive UI | ✅ |
| Accessibility best practices | ✅ |
| Security headers | ✅ |
| Deployment (Vercel) | ✅ |
| Name/GitHub/LinkedIn in footer | ✅ |
| Not a basic CRUD app | ✅ (8 AI features) |
