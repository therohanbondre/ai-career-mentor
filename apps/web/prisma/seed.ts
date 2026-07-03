import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

/*
 * Database Seed
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates:
 *   1. Admin user          admin@aicareermentor.app  /  Admin@1234
 *   2. Demo student        student@aicareermentor.app / Student@1234
 *   3. Demo recruiter      recruiter@aicareermentor.app / Recruiter@1234
 *   4. Skills taxonomy     (75 common tech skills across 8 categories)
 *
 * Run with:  npm run db:seed
 * Safe to re-run — upserts on unique fields, never duplicates.
 */

const prisma = new PrismaClient()

// ─── Skills taxonomy ──────────────────────────────────────────────────────────

const SKILLS: { name: string; category: string; description?: string }[] = [
  // Programming Languages
  { name: "JavaScript", category: "Programming Languages" },
  { name: "TypeScript", category: "Programming Languages" },
  { name: "Python", category: "Programming Languages" },
  { name: "Java", category: "Programming Languages" },
  { name: "C++", category: "Programming Languages" },
  { name: "C#", category: "Programming Languages" },
  { name: "Go", category: "Programming Languages" },
  { name: "Rust", category: "Programming Languages" },
  { name: "Ruby", category: "Programming Languages" },
  { name: "PHP", category: "Programming Languages" },
  { name: "Swift", category: "Programming Languages" },
  { name: "Kotlin", category: "Programming Languages" },
  { name: "Scala", category: "Programming Languages" },
  { name: "R", category: "Programming Languages" },

  // Frontend
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "Angular", category: "Frontend" },
  { name: "Svelte", category: "Frontend" },
  { name: "HTML", category: "Frontend" },
  { name: "CSS", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Redux", category: "Frontend" },
  { name: "GraphQL", category: "Frontend" },
  { name: "Webpack", category: "Frontend" },
  { name: "Vite", category: "Frontend" },

  // Backend
  { name: "Node.js", category: "Backend" },
  { name: "Express.js", category: "Backend" },
  { name: "NestJS", category: "Backend" },
  { name: "Django", category: "Backend" },
  { name: "FastAPI", category: "Backend" },
  { name: "Flask", category: "Backend" },
  { name: "Spring Boot", category: "Backend" },
  { name: "Ruby on Rails", category: "Backend" },
  { name: "Laravel", category: "Backend" },
  { name: "REST APIs", category: "Backend" },
  { name: "gRPC", category: "Backend" },
  { name: "WebSockets", category: "Backend" },

  // Databases
  { name: "PostgreSQL", category: "Databases" },
  { name: "MySQL", category: "Databases" },
  { name: "MongoDB", category: "Databases" },
  { name: "Redis", category: "Databases" },
  { name: "Elasticsearch", category: "Databases" },
  { name: "SQLite", category: "Databases" },
  { name: "DynamoDB", category: "Databases" },
  { name: "Prisma ORM", category: "Databases" },
  { name: "Mongoose", category: "Databases" },

  // DevOps & Cloud
  { name: "Docker", category: "DevOps & Cloud" },
  { name: "Kubernetes", category: "DevOps & Cloud" },
  { name: "AWS", category: "DevOps & Cloud" },
  { name: "Google Cloud", category: "DevOps & Cloud" },
  { name: "Azure", category: "DevOps & Cloud" },
  { name: "Vercel", category: "DevOps & Cloud" },
  { name: "CI/CD", category: "DevOps & Cloud" },
  { name: "GitHub Actions", category: "DevOps & Cloud" },
  { name: "Terraform", category: "DevOps & Cloud" },
  { name: "Linux", category: "DevOps & Cloud" },
  { name: "Nginx", category: "DevOps & Cloud" },

  // AI & Data
  { name: "Machine Learning", category: "AI & Data" },
  { name: "Deep Learning", category: "AI & Data" },
  { name: "TensorFlow", category: "AI & Data" },
  { name: "PyTorch", category: "AI & Data" },
  { name: "scikit-learn", category: "AI & Data" },
  { name: "LangChain", category: "AI & Data" },
  { name: "OpenAI API", category: "AI & Data" },
  { name: "Gemini API", category: "AI & Data" },
  { name: "Pandas", category: "AI & Data" },
  { name: "NumPy", category: "AI & Data" },
  { name: "Data Analysis", category: "AI & Data" },

  // Tools & Practices
  { name: "Git", category: "Tools & Practices" },
  { name: "Agile / Scrum", category: "Tools & Practices" },
  { name: "Test-Driven Development", category: "Tools & Practices" },
  { name: "System Design", category: "Tools & Practices" },
  { name: "Microservices", category: "Tools & Practices" },
  { name: "Design Patterns", category: "Tools & Practices" },

  // Soft Skills
  { name: "Communication", category: "Soft Skills" },
  { name: "Problem Solving", category: "Soft Skills" },
  { name: "Team Collaboration", category: "Soft Skills" },
  { name: "Time Management", category: "Soft Skills" },
  { name: "Leadership", category: "Soft Skills" },
]

// ─── Seed helpers ─────────────────────────────────────────────────────────────

async function upsertUser(params: {
  email: string
  password: string
  role: "ADMIN" | "STUDENT" | "RECRUITER"
  firstName: string
  lastName: string
}) {
  const { email, password, role, firstName, lastName } = params
  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashed,
      role,
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
        },
      },
    },
  })

  console.log(`  ✓ ${role.toLowerCase()} — ${email}`)
  return user
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🌱 Seeding database…\n")

  // ── 1. Demo users ────────────────────────────────────────────────────────
  console.log("Users:")
  await upsertUser({
    email: "admin@aicareermentor.app",
    password: "Admin@1234",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "User",
  })

  await upsertUser({
    email: "student@aicareermentor.app",
    password: "Student@1234",
    role: "STUDENT",
    firstName: "Demo",
    lastName: "Student",
  })

  await upsertUser({
    email: "recruiter@aicareermentor.app",
    password: "Recruiter@1234",
    role: "RECRUITER",
    firstName: "Demo",
    lastName: "Recruiter",
  })

  // ── 2. Skills taxonomy ───────────────────────────────────────────────────
  console.log("\nSkills:")
  let created = 0
  let skipped = 0

  for (const skill of SKILLS) {
    const result = await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    })
    if (result) created++
    else skipped++
  }

  console.log(`  ✓ ${SKILLS.length} skills upserted (${skipped} already existed)`)

  console.log("\n✅ Seed complete.\n")
  console.log("Demo credentials:")
  console.log("  Admin     admin@aicareermentor.app     /  Admin@1234")
  console.log("  Student   student@aicareermentor.app   /  Student@1234")
  console.log("  Recruiter recruiter@aicareermentor.app /  Recruiter@1234\n")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
