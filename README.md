# AI Career Mentor Platform

A production-ready, AI-powered career mentorship platform built with Next.js 16, React 19, and modern web technologies.

## Overview

The AI Career Mentor Platform helps students navigate their career development through intelligent guidance:
- Resume analysis and ATS scoring
- Skill gap identification
- Personalized learning roadmaps
- AI-powered interview preparation
- Project recommendations

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **Auth.js** - Authentication solution

### AI Integration
- **Gemini API** - Google's AI model
- **Vercel AI SDK** - AI integration utilities

### Infrastructure
- **Vercel** - Deployment platform
- **Neon PostgreSQL** - Serverless database
- **Vercel Blob** - File storage

## Project Structure

```
ai-career-mentor/
├── apps/
│   └── web/              # Next.js application
│       ├── app/          # App Router pages
│       ├── components/   # React components
│       ├── lib/          # Utilities and configurations
│       └── prisma/       # Database schema
├── packages/             # Shared packages
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- PostgreSQL database

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ai-career-mentor

# Install dependencies
npm install

# Setup environment
cp apps/web/.env.example apps/web/.env
# Edit .env with your configuration

# Setup database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

## Available Scripts

### Root Scripts
- `npm run dev` - Start all applications in development
- `npm run build` - Build all applications
- `npm run lint` - Lint all applications
- `npm run format` - Format all code
- `npm run typecheck` - Type check all applications

### Database Scripts
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## Architecture

See [ai-career-mentor-architecture.md](./ai-career-mentor-architecture.md) for detailed architecture documentation.

## Development

### Code Standards

- **TypeScript:** Strict mode enabled
- **ESLint:** Next.js and TypeScript rules
- **Prettier:** Consistent code formatting
- **Husky:** Git hooks for code quality

### Git Workflow

1. Create feature branch from `develop`
2. Implement changes with tests
3. Create pull request
4. Code review and approval
5. Merge to `develop`
6. Deploy to staging
7. Merge to `main` for production

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Required environment variables for production:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GEMINI_API_KEY="..."
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

##license

MIT License - see LICENSE file for details

## Author

**Rohan Bondre** - [GitHub](https://github.com/therohanbondre)
