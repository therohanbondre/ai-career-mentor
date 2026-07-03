import Link from "next/link"
import {
  Brain,
  FileText,
  Target,
  Map,
  Mic,
  PenLine,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Award,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"

/* ─── Static data ──────────────────────────────────────────────────────────── */

const features = [
  {
    icon: FileText,
    title: "Resume Analysis",
    description:
      "Upload your resume and get an instant ATS compatibility score with actionable improvement suggestions powered by Gemini AI.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Target,
    title: "Job Match & Skill Gap",
    description:
      "Paste any job description and see exactly how well your resume matches — with a prioritised list of missing skills.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Map,
    title: "Learning Roadmap",
    description:
      "Get a personalised week-by-week learning plan tailored to your target role, current skills, and available time.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Mic,
    title: "Mock Interviews",
    description:
      "Practice with AI-generated technical and behavioural questions, then receive detailed feedback and a performance score.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: PenLine,
    title: "Cover Letter Generator",
    description:
      "Generate a tailored, professional cover letter in seconds. Choose your tone, edit inline, and export as PDF.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Brain,
    title: "Project Recommendations",
    description:
      "Discover portfolio projects aligned with your target role and skill gaps, complete with tech stack and resource links.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
]

const steps = [
  {
    step: "01",
    title: "Upload your resume",
    description:
      "Drop your PDF or DOCX. Our AI parses it in seconds and extracts every skill, role, and achievement.",
  },
  {
    step: "02",
    title: "Paste a job description",
    description:
      "Add the JD you're targeting. We calculate your match score and surface every gap holding you back.",
  },
  {
    step: "03",
    title: "Follow your roadmap",
    description:
      "Work through your personalised learning plan, build recommended projects, and track your progress.",
  },
  {
    step: "04",
    title: "Ace the interview",
    description:
      "Practice with role-specific AI questions, get instant feedback, and walk in with confidence.",
  },
]

const stats = [
  { value: "10k+", label: "Resumes analysed" },
  { value: "94%", label: "ATS pass rate" },
  { value: "3×", label: "Faster skill growth" },
  { value: "4.9★", label: "Average rating" },
]

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer @ Google",
    avatar: "PS",
    quote:
      "The skill gap analysis was eye-opening. I knew exactly what to learn before my interviews and landed my dream role in 6 weeks.",
  },
  {
    name: "Arjun Mehta",
    role: "Frontend Developer @ Razorpay",
    avatar: "AM",
    quote:
      "My ATS score went from 42 to 91 after following the AI suggestions. Got 3× more callbacks the very next week.",
  },
  {
    name: "Sneha Patel",
    role: "Full Stack Dev @ Flipkart",
    avatar: "SP",
    quote:
      "The mock interview feature is incredible — the AI feedback was more detailed than feedback I got from real interviews.",
  },
]

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started.",
    features: [
      "3 resume analyses / month",
      "ATS score & basic suggestions",
      "1 job description match",
      "5 interview questions",
    ],
    cta: "Get started free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    description: "For serious job seekers.",
    features: [
      "Unlimited resume analyses",
      "Full ATS report & suggestions",
      "Unlimited job matches",
      "Full mock interview suite",
      "Learning roadmap",
      "Cover letter generator",
      "Project recommendations",
    ],
    cta: "Start free trial",
    href: "/register",
    highlighted: true,
  },
  {
    name: "Recruiter",
    price: "₹1,999",
    period: "per month",
    description: "Post jobs and rank candidates.",
    features: [
      "Unlimited job postings",
      "AI candidate ranking",
      "Side-by-side comparison",
      "Resume viewer",
      "Applicant analytics",
      "Priority support",
    ],
    cta: "Contact sales",
    href: "/register",
    highlighted: false,
  },
]

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">
              AI Career <span className="text-primary">Mentor</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Get started <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
          {/* Background blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl"
          >
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-purple-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              <Zap className="mr-1.5 h-3.5 w-3.5 text-yellow-500" />
              Powered by Google Gemini AI
            </Badge>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Land your dream job{" "}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                10× faster
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              AI Career Mentor analyses your resume, identifies skill gaps, builds
              your personalised learning roadmap, and coaches you through mock
              interviews — so you walk into every interview fully prepared.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-base font-semibold">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  See how it works
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Free forever plan available
            </p>
          </div>

          {/* ── Stats bar ──────────────────────────────────────────────── */}
          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <Badge variant="outline" className="mb-4">
                Everything you need
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your complete career toolkit
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Six AI-powered tools working together to take you from confused
                applicant to confident hire.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className="group rounded-2xl border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                  >
                    <div
                      className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="bg-muted/40 px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <Badge variant="outline" className="mb-4">
                Simple process
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                From upload to offer in 4 steps
              </h2>
            </div>

            <div className="relative grid gap-8 md:grid-cols-4">
              {/* Connector line */}
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 top-10 hidden h-px bg-border md:block"
              />

              {steps.map((s, i) => (
                <div key={s.step} className="relative text-center">
                  <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/20 bg-background shadow-sm">
                    <span className="text-2xl font-bold text-primary">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why us ──────────────────────────────────────────────────────── */}
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <Badge variant="outline" className="mb-4">
                  Why AI Career Mentor
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Built for students and freshers who want results
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Most career advice is generic. We analyse{" "}
                  <em>your specific resume</em> against{" "}
                  <em>the specific job you want</em> and give you a precise
                  action plan — not platitudes.
                </p>

                <ul className="mt-8 space-y-4">
                  {[
                    {
                      icon: Zap,
                      text: "AI-first: Gemini analyses every word of your resume",
                    },
                    {
                      icon: Shield,
                      text: "Secure: your data is encrypted and never shared",
                    },
                    {
                      icon: TrendingUp,
                      text: "Data-driven: scores and metrics, not vague feedback",
                    },
                    {
                      icon: Users,
                      text: "Multi-role: tools for students, recruiters, and admins",
                    },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.text} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.text}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Feature checklist card */}
              <div className="rounded-2xl border bg-card p-8 shadow-sm">
                <p className="mb-6 font-semibold">What you get with every account</p>
                <ul className="space-y-3">
                  {[
                    "Instant ATS score with detailed breakdown",
                    "Keyword gap analysis vs any job description",
                    "Grammar, formatting & achievement scoring",
                    "Skill gap identification by priority",
                    "Week-by-week personalised learning roadmap",
                    "AI-generated portfolio project ideas",
                    "Unlimited mock interview practice",
                    "One-click cover letter generation",
                    "Progress tracking dashboard",
                    "Email notifications for completed analyses",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────────────────── */}
        <section className="bg-muted/40 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">
                Success stories
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Loved by job seekers
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border bg-card p-6 shadow-sm"
                >
                  <div className="mb-4 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────────────────── */}
        <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <Badge variant="outline" className="mb-4">
                Simple pricing
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Start free, upgrade when ready
              </h2>
              <p className="mt-4 text-muted-foreground">
                No hidden fees. Cancel anytime.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-8 ${
                    plan.highlighted
                      ? "border-primary bg-primary shadow-lg shadow-primary/10"
                      : "bg-card"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary-foreground px-3 py-0.5 text-primary shadow-sm">
                        <Award className="mr-1 h-3 w-3" />
                        Most popular
                      </Badge>
                    </div>
                  )}

                  <h3
                    className={`text-lg font-bold ${plan.highlighted ? "text-primary-foreground" : ""}`}
                  >
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-extrabold ${plan.highlighted ? "text-primary-foreground" : ""}`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                    >
                      /{plan.period}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-sm ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {plan.description}
                  </p>

                  <ul className="my-8 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-primary-foreground" : "text-green-500"}`}
                        />
                        <span
                          className={`text-sm ${plan.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"}`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href} className="block">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "secondary" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ──────────────────────────────────────────────────── */}
        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary to-purple-600 px-8 py-16 text-center shadow-xl shadow-primary/20">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to land your dream job?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Join thousands of students already using AI Career Mentor to get
              more callbacks, ace interviews, and grow faster.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 px-8 text-base font-semibold"
                >
                  Create free account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 px-8 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ── Main footer row ── */}
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-bold">AI Career Mentor</span>
            </Link>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#features" className="hover:text-foreground">
                Features
              </Link>
              <Link href="#pricing" className="hover:text-foreground">
                Pricing
              </Link>
              <Link href="/login" className="hover:text-foreground">
                Sign in
              </Link>
              <Link href="/register" className="hover:text-foreground">
                Sign up
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} AI Career Mentor
              </p>
            </div>
          </div>

          {/* ── Author credit (submission requirement) ── */}
          <div className="border-t pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Built by{" "}
              <span className="font-semibold text-foreground">Rohan Bondre</span>
              {" · "}
              <a
                href="https://github.com/therohanbondre"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
                aria-label="Rohan Bondre's GitHub profile"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                </svg>
                GitHub
              </a>
              {" · "}
              <a
                href="https://www.linkedin.com/in/rohan-bondre1/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
                aria-label="Rohan Bondre's LinkedIn profile"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </p>
          </div>

        </div>
      </footer>
    </div>
  )
}
