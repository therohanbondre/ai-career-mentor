import { GoogleGenerativeAI } from "@google/generative-ai"

/* 
 * Architectural Decision: Gemini AI Service
 * - Google Generative AI integration
 * - Structured prompt engineering
 * - Consistent JSON output
 * - Error handling and retries
 * - Rate limiting awareness
 */

const genAI = new GoogleGenerativeAI(process.env["GEMINI_API_KEY"] || "")

export interface AnalysisResult {
  grammar: GrammarAnalysis
  formatting: FormattingAnalysis
  achievements: AchievementsAnalysis
  skillRelevance: SkillRelevanceAnalysis
  missingKeywords: MissingKeywordsAnalysis
  atsCompatibility: ATSCompatibilityAnalysis
  resumeScore: number
  atsScore: number
  improvements: Improvement[]
}

export interface GrammarAnalysis {
  score: number
  issues: GrammarIssue[]
  summary: string
}

export interface GrammarIssue {
  type: "spelling" | "grammar" | "punctuation" | "capitalization"
  text: string
  suggestion: string
  severity: "low" | "medium" | "high"
}

export interface FormattingAnalysis {
  score: number
  issues: FormattingIssue[]
  summary: string
}

export interface FormattingIssue {
  type: "spacing" | "alignment" | "consistency" | "structure"
  location: string
  suggestion: string
  severity: "low" | "medium" | "high"
}

export interface AchievementsAnalysis {
  score: number
  achievements: string[]
  suggestions: string[]
  summary: string
}

export interface SkillRelevanceAnalysis {
  score: number
  relevantSkills: string[]
  irrelevantSkills: string[]
  suggestions: string[]
  summary: string
}

export interface MissingKeywordsAnalysis {
  score: number
  missingKeywords: string[]
  suggestedKeywords: string[]
  summary: string
}

export interface ATSCompatibilityAnalysis {
  score: number
  keywordMatch: number
  formatScore: number
  contentScore: number
  readabilityScore: number
  issues: string[]
  summary: string
}

export interface Improvement {
  category: "grammar" | "formatting" | "content" | "ats"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  effort: "quick" | "moderate" | "significant"
}

/**
 * Analyze resume using Gemini AI
 */
export async function analyzeResume(resumeText: string, jobDescription?: string): Promise<AnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = generateAnalysisPrompt(resumeText, jobDescription)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    const analysis = JSON.parse(text) as AnalysisResult

    // Validate and sanitize the response
    return validateAnalysis(analysis)
  } catch (error) {
    console.error("Gemini analysis error:", error)
    throw new Error("Failed to analyze resume with AI")
  }
}

/**
 * Generate comprehensive analysis prompt
 */
function generateAnalysisPrompt(resumeText: string, jobDescription?: string): string {
  const jobContext = jobDescription 
    ? `\nTarget Job Description:\n${jobDescription}\n`
    : ""

  return `You are an expert resume analyzer and career coach. Analyze the following resume and provide detailed feedback in JSON format.

${jobContext}
Resume Text:
${resumeText}

Provide your analysis in the following JSON structure:
{
  "grammar": {
    "score": 0-100,
    "issues": [
      {
        "type": "spelling|grammar|punctuation|capitalization",
        "text": "the problematic text",
        "suggestion": "corrected version",
        "severity": "low|medium|high"
      }
    ],
    "summary": "brief summary of grammar quality"
  },
  "formatting": {
    "score": 0-100,
    "issues": [
      {
        "type": "spacing|alignment|consistency|structure",
        "location": "where the issue is",
        "suggestion": "how to fix",
        "severity": "low|medium|high"
      }
    ],
    "summary": "brief summary of formatting quality"
  },
  "achievements": {
    "score": 0-100,
    "achievements": ["list of identified achievements"],
    "suggestions": ["how to improve achievements"],
    "summary": "brief summary of achievements section"
  },
  "skillRelevance": {
    "score": 0-100,
    "relevantSkills": ["list of relevant skills"],
    "irrelevantSkills": ["list of irrelevant or outdated skills"],
    "suggestions": ["how to improve skill presentation"],
    "summary": "brief summary of skill relevance"
  },
  "missingKeywords": {
    "score": 0-100,
    "missingKeywords": ["important keywords missing from resume"],
    "suggestedKeywords": ["keywords to consider adding"],
    "summary": "brief summary of keyword coverage"
  },
  "atsCompatibility": {
    "score": 0-100,
    "keywordMatch": 0-100,
    "formatScore": 0-100,
    "contentScore": 0-100,
    "readabilityScore": 0-100,
    "issues": ["ATS-specific issues"],
    "summary": "brief summary of ATS compatibility"
  },
  "resumeScore": 0-100,
  "atsScore": 0-100,
  "improvements": [
    {
      "category": "grammar|formatting|content|ats",
      "title": "improvement title",
      "description": "detailed description",
      "priority": "high|medium|low",
      "effort": "quick|moderate|significant"
    }
  ]
}

Scoring Guidelines:
- Grammar: Check for spelling, grammar, punctuation, and capitalization errors
- Formatting: Evaluate spacing, alignment, consistency, and overall structure
- Achievements: Assess quantifiable achievements and impact statements
- Skill Relevance: Evaluate relevance to modern job market and target role
- Missing Keywords: Identify important industry keywords that are missing
- ATS Compatibility: Evaluate keyword match, format compatibility, content structure, and readability
- Resume Score: Overall weighted average (30% grammar, 20% formatting, 25% achievements, 25% skills)
- ATS Score: Overall weighted average (40% keyword match, 20% format, 20% content, 20% readability)

Return ONLY valid JSON without any additional text or formatting.`
}

/**
 * Validate and sanitize analysis response
 */
function validateAnalysis(analysis: any): AnalysisResult {
  // Ensure all required fields exist
  const validated: AnalysisResult = {
    grammar: {
      score: Math.min(100, Math.max(0, analysis.grammar?.score || 0)),
      issues: Array.isArray(analysis.grammar?.issues) ? analysis.grammar.issues : [],
      summary: analysis.grammar?.summary || "No grammar analysis available",
    },
    formatting: {
      score: Math.min(100, Math.max(0, analysis.formatting?.score || 0)),
      issues: Array.isArray(analysis.formatting?.issues) ? analysis.formatting.issues : [],
      summary: analysis.formatting?.summary || "No formatting analysis available",
    },
    achievements: {
      score: Math.min(100, Math.max(0, analysis.achievements?.score || 0)),
      achievements: Array.isArray(analysis.achievements?.achievements) ? analysis.achievements.achievements : [],
      suggestions: Array.isArray(analysis.achievements?.suggestions) ? analysis.achievements.suggestions : [],
      summary: analysis.achievements?.summary || "No achievements analysis available",
    },
    skillRelevance: {
      score: Math.min(100, Math.max(0, analysis.skillRelevance?.score || 0)),
      relevantSkills: Array.isArray(analysis.skillRelevance?.relevantSkills) ? analysis.skillRelevance.relevantSkills : [],
      irrelevantSkills: Array.isArray(analysis.skillRelevance?.irrelevantSkills) ? analysis.skillRelevance.irrelevantSkills : [],
      suggestions: Array.isArray(analysis.skillRelevance?.suggestions) ? analysis.skillRelevance.suggestions : [],
      summary: analysis.skillRelevance?.summary || "No skill relevance analysis available",
    },
    missingKeywords: {
      score: Math.min(100, Math.max(0, analysis.missingKeywords?.score || 0)),
      missingKeywords: Array.isArray(analysis.missingKeywords?.missingKeywords) ? analysis.missingKeywords.missingKeywords : [],
      suggestedKeywords: Array.isArray(analysis.missingKeywords?.suggestedKeywords) ? analysis.missingKeywords.suggestedKeywords : [],
      summary: analysis.missingKeywords?.summary || "No missing keywords analysis available",
    },
    atsCompatibility: {
      score: Math.min(100, Math.max(0, analysis.atsCompatibility?.score || 0)),
      keywordMatch: Math.min(100, Math.max(0, analysis.atsCompatibility?.keywordMatch || 0)),
      formatScore: Math.min(100, Math.max(0, analysis.atsCompatibility?.formatScore || 0)),
      contentScore: Math.min(100, Math.max(0, analysis.atsCompatibility?.contentScore || 0)),
      readabilityScore: Math.min(100, Math.max(0, analysis.atsCompatibility?.readabilityScore || 0)),
      issues: Array.isArray(analysis.atsCompatibility?.issues) ? analysis.atsCompatibility.issues : [],
      summary: analysis.atsCompatibility?.summary || "No ATS compatibility analysis available",
    },
    resumeScore: Math.min(100, Math.max(0, analysis.resumeScore || 0)),
    atsScore: Math.min(100, Math.max(0, analysis.atsScore || 0)),
    improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
  }

  return validated
}

/**
 * Analyze specific aspect of resume
 */
export async function analyzeAspect(
  resumeText: string,
  aspect: "grammar" | "formatting" | "achievements" | "skills" | "ats" | "job"
): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = generateAspectPrompt(resumeText, aspect)
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return JSON.parse(text)
  } catch (error) {
    console.error(`Gemini ${aspect} analysis error:`, error)
    throw new Error(`Failed to analyze ${aspect}`)
  }
}

/**
 * Generate prompt for specific aspect analysis
 */
function generateAspectPrompt(resumeText: string, aspect: string): string {
  const prompts: Record<string, string> = {
    grammar: `Analyze the grammar of this resume. Check for spelling, grammar, punctuation, and capitalization errors. Return JSON with score (0-100), issues array with type, text, suggestion, severity, and a summary.`,
    formatting: `Analyze the formatting of this resume. Check for spacing, alignment, consistency, and structure. Return JSON with score (0-100), issues array with type, location, suggestion, severity, and a summary.`,
    achievements: `Analyze the achievements section of this resume. Identify quantifiable achievements and impact statements. Return JSON with score (0-100), achievements array, suggestions array, and a summary.`,
    skills: `Analyze the skills section of this resume. Evaluate relevance to modern job market. Return JSON with score (0-100), relevantSkills array, irrelevantSkills array, suggestions array, and a summary.`,
    ats: `Analyze the ATS compatibility of this resume. Evaluate keyword match, format compatibility, content structure, and readability. Return JSON with score (0-100), keywordMatch, formatScore, contentScore, readabilityScore, issues array, and a summary.`,
    job: `Analyze this job description. Extract title, company, location, requiredSkills array, preferredSkills array, responsibilities array, technologies array, education array with degree, field, required, experience array with years, level, required, keywords array, seniority (entry/mid/senior/lead/executive/unknown), salary object with min, max, currency, period, and benefits array. Return JSON with all these fields.`,
  }

  return `${prompts[aspect]}\n\nText:\n${resumeText}\n\nReturn ONLY valid JSON without any additional text.`
}

// ─── Job Match Analysis ──────────────────────────────────────────────────────

export interface JobMatchResult {
  overallMatch: number // 0-100
  skillMatch: number // 0-100
  experienceMatch: number // 0-100
  educationMatch: number // 0-100
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

/**
 * Analyze job match between resume and job description
 */
export async function analyzeJobMatch(
  resumeText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `You are an expert career coach and ATS specialist. Analyze how well this resume matches the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide your analysis in the following JSON structure:
{
  "overallMatch": 0-100,
  "skillMatch": 0-100,
  "experienceMatch": 0-100,
  "educationMatch": 0-100,
  "matchedSkills": ["list of skills present in both"],
  "missingSkills": [
    {
      "skill": "skill name",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "reason": "why this skill is important for this role"
    }
  ],
  "recommendations": ["specific actions to improve match"],
  "summary": "2-3 sentence summary of overall fit"
}

Scoring Guidelines:
- Overall Match: weighted average (40% skills, 30% experience, 20% education, 10% keywords)
- Skill Match: percentage of required skills present in resume
- Experience Match: years and relevance of experience vs requirements
- Education Match: degree and field alignment with requirements
- Priority Levels:
  * CRITICAL: mentioned multiple times or in "required" section
  * HIGH: mentioned in requirements or responsibilities
  * MEDIUM: mentioned in "nice to have" or once
  * LOW: tangentially related but not explicitly mentioned

Return ONLY valid JSON without any additional text or formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const analysis = JSON.parse(text) as JobMatchResult

    // Validate scores
    return {
      overallMatch: Math.min(100, Math.max(0, analysis.overallMatch || 0)),
      skillMatch: Math.min(100, Math.max(0, analysis.skillMatch || 0)),
      experienceMatch: Math.min(100, Math.max(0, analysis.experienceMatch || 0)),
      educationMatch: Math.min(100, Math.max(0, analysis.educationMatch || 0)),
      matchedSkills: Array.isArray(analysis.matchedSkills) ? analysis.matchedSkills : [],
      missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      summary: analysis.summary || "No summary available",
    }
  } catch (error) {
    console.error("Job match analysis error:", error)
    throw new Error("Failed to analyze job match")
  }
}

// ─── Skill Gap Analysis ──────────────────────────────────────────────────────

export interface SkillGapResult {
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
  category: string // "Programming", "Framework", "Tool", "Soft Skill"
  marketDemand?: "HIGH" | "MEDIUM" | "LOW"
  estimatedLearningTime?: string // e.g., "2 weeks", "1 month"
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

/**
 * Analyze skill gaps for a target role
 */
export async function analyzeSkillGap(
  presentSkills: string[],
  targetRole: string,
  jobDescription?: string
): Promise<SkillGapResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const jobContext = jobDescription 
      ? `\nTarget Job Description:\n${jobDescription}\n`
      : ""

    const prompt = `You are an expert career coach specializing in skill development. Analyze the skill gap for someone targeting a ${targetRole} role.

Current Skills:
${presentSkills.join(", ")}
${jobContext}
Analyze what skills are present, what's missing, and what should be learned next.

Provide your analysis in the following JSON structure:
{
  "presentSkills": [
    {
      "name": "skill name",
      "level": "BEGINNER|INTERMEDIATE|ADVANCED|EXPERT",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "Programming|Framework|Tool|Soft Skill|etc",
      "marketDemand": "HIGH|MEDIUM|LOW"
    }
  ],
  "missingSkills": [
    {
      "name": "skill name",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "category",
      "marketDemand": "HIGH|MEDIUM|LOW",
      "estimatedLearningTime": "time estimate"
    }
  ],
  "recommendedSkills": [
    {
      "name": "skill name that would be valuable",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "category": "category",
      "marketDemand": "HIGH|MEDIUM|LOW",
      "estimatedLearningTime": "time estimate"
    }
  ],
  "learningPaths": [
    {
      "skill": "skill name",
      "resources": [
        {
          "type": "course|book|tutorial|practice",
          "name": "resource name",
          "duration": "time estimate"
        }
      ],
      "milestones": ["milestone 1", "milestone 2"]
    }
  ],
  "summary": "2-3 sentence summary of skill gap analysis"
}

Guidelines:
- Present skills: rate proficiency level based on context
- Missing skills: identify gaps specifically for ${targetRole}
- Recommended skills: suggest valuable additions beyond requirements
- Learning paths: provide actionable resources and milestones
- Priority based on: job market demand, role requirements, career growth

Return ONLY valid JSON without any additional text or formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const analysis = JSON.parse(text) as SkillGapResult

    return {
      presentSkills: Array.isArray(analysis.presentSkills) ? analysis.presentSkills : [],
      missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [],
      recommendedSkills: Array.isArray(analysis.recommendedSkills) ? analysis.recommendedSkills : [],
      learningPaths: Array.isArray(analysis.learningPaths) ? analysis.learningPaths : [],
      summary: analysis.summary || "No summary available",
    }
  } catch (error) {
    console.error("Skill gap analysis error:", error)
    throw new Error("Failed to analyze skill gap")
  }
}

// ─── Learning Roadmap Generation ─────────────────────────────────────────────

export interface RoadmapModule {
  week: number
  title: string
  description: string
  skills: string[]
  topics: string[]
  resources: Resource[]
  estimatedHours: number
  milestones: string[]
}

export interface RoadmapResult {
  title: string
  targetRole: string
  duration: number // weeks
  totalHours: number
  modules: RoadmapModule[]
  summary: string
  prerequisites: string[]
}

/**
 * Generate a personalized learning roadmap
 */
export async function generateLearningRoadmap(
  missingSkills: string[],
  targetRole: string,
  timelineWeeks: number = 12
): Promise<RoadmapResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `You are an expert career coach and curriculum designer. Create a personalized ${timelineWeeks}-week learning roadmap for someone targeting a ${targetRole} role.

Missing Skills to Address:
${missingSkills.join(", ")}

Create a structured learning plan that:
- Builds from foundational to advanced concepts
- Allocates realistic weekly time commitments
- Provides specific, actionable resources
- Includes measurable milestones

Provide your roadmap in the following JSON structure:
{
  "title": "descriptive title for the roadmap",
  "targetRole": "${targetRole}",
  "duration": ${timelineWeeks},
  "totalHours": 0,
  "modules": [
    {
      "week": 1,
      "title": "module title",
      "description": "what will be learned this week",
      "skills": ["skills covered"],
      "topics": ["specific topics"],
      "resources": [
        {
          "type": "course|book|tutorial|practice",
          "name": "resource name",
          "url": "https://...",
          "duration": "time estimate"
        }
      ],
      "estimatedHours": 10,
      "milestones": ["measurable achievements"]
    }
  ],
  "summary": "2-3 sentence overview of the roadmap",
  "prerequisites": ["skills or knowledge needed to start"]
}

Guidelines:
- Each week should have 8-12 hours of content
- Provide real, publicly available resources (courses, docs, tutorials)
- Include a mix of theory and practice
- Build complexity progressively
- Add specific milestones (e.g., "Build a REST API", "Deploy to production")
- Focus on skills that are most valuable for ${targetRole}

Return ONLY valid JSON without any additional text or formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const roadmap = JSON.parse(text) as RoadmapResult

    // Validate and calculate total hours
    const totalHours = roadmap.modules.reduce((sum, m) => sum + (m.estimatedHours || 0), 0)

    return {
      title: roadmap.title || `${targetRole} Learning Path`,
      targetRole: roadmap.targetRole || targetRole,
      duration: roadmap.duration || timelineWeeks,
      totalHours: totalHours || roadmap.totalHours || 0,
      modules: Array.isArray(roadmap.modules) ? roadmap.modules : [],
      summary: roadmap.summary || "Personalized learning roadmap",
      prerequisites: Array.isArray(roadmap.prerequisites) ? roadmap.prerequisites : [],
    }
  } catch (error) {
    console.error("Roadmap generation error:", error)
    throw new Error("Failed to generate learning roadmap")
  }
}

// ─── Project Recommendations ─────────────────────────────────────────────────

export interface ProjectRecommendation {
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

export interface ProjectRecommendationsResult {
  projects: ProjectRecommendation[]
  summary: string
}

/**
 * Recommend portfolio projects based on skills and target role
 */
export async function recommendProjects(
  currentSkills: string[],
  targetRole: string,
  difficultyLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "MIXED" = "MIXED"
): Promise<ProjectRecommendationsResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const difficultyFilter = difficultyLevel === "MIXED" 
      ? "Include a mix of BEGINNER, INTERMEDIATE, and ADVANCED projects"
      : `Focus on ${difficultyLevel} level projects`

    const prompt = `You are an expert career coach specializing in portfolio development. Recommend 5-7 portfolio projects for someone targeting a ${targetRole} role.

Current Skills:
${currentSkills.join(", ")}

${difficultyFilter}

Provide your recommendations in the following JSON structure:
{
  "projects": [
    {
      "title": "project name",
      "description": "brief description of what the project does",
      "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
      "skills": ["skills this project will demonstrate/teach"],
      "technologies": ["specific tech stack"],
      "estimatedHours": 20,
      "category": "Web App|Mobile|API|DevOps|AI/ML|etc",
      "outcomes": ["what you'll learn/demonstrate"],
      "features": ["key features to implement"],
      "resources": [
        {
          "type": "tutorial|course|documentation",
          "name": "resource name",
          "url": "https://...",
          "duration": "optional"
        }
      ],
      "githubIdeas": ["creative GitHub repo name ideas"]
    }
  ],
  "summary": "2-3 sentence overview of why these projects were chosen"
}

Guidelines:
- Projects should be impressive but achievable
- Each should demonstrate different skills
- Include projects that solve real problems
- Provide specific features, not just ideas
- Focus on projects valuable for ${targetRole}
- Suggest projects that build on each other in complexity
- Include unique/creative projects, not just tutorials

Return ONLY valid JSON without any additional text or formatting.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const recommendations = JSON.parse(text) as ProjectRecommendationsResult

    return {
      projects: Array.isArray(recommendations.projects) ? recommendations.projects : [],
      summary: recommendations.summary || "Personalized project recommendations",
    }
  } catch (error) {
    console.error("Project recommendation error:", error)
    throw new Error("Failed to recommend projects")
  }
}

// ─── Interview Question Generation ───────────────────────────────────────────

export interface InterviewQuestion {
  order: number
  question: string
  type: "technical" | "behavioral" | "system_design" | "coding"
  category: string
  difficulty: "easy" | "medium" | "hard"
  expectedDuration: number // minutes
  hints?: string[]
  tags: string[]
}

export interface InterviewQuestionsResult {
  questions: InterviewQuestion[]
  totalDuration: number // minutes
  focusAreas: string[]
}

/**
 * Generate interview questions for a role and type
 */
export async function generateInterviewQuestions(
  jobRole: string,
  interviewType: "TECHNICAL" | "BEHAVIORAL" | "MIXED" | "SYSTEM_DESIGN" | "CODING",
  difficulty: "easy" | "medium" | "hard" | "mixed" = "mixed",
  count: number = 10,
  jobDescription?: string
): Promise<InterviewQuestionsResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const typeGuide: Record<string, string> = {
      TECHNICAL:     "Focus on technical knowledge, algorithms, data structures, and system concepts",
      BEHAVIORAL:    "Focus on past experiences, problem-solving, teamwork, and leadership using STAR format",
      MIXED:         "Mix of technical and behavioral questions (60% technical, 40% behavioral)",
      SYSTEM_DESIGN: "Focus on system design, scalability, architecture decisions, and trade-offs",
      CODING:        "Focus on coding problems, algorithms, time/space complexity, and code quality",
    }

    const difficultyGuide = difficulty === "mixed"
      ? "Mix of easy (30%), medium (50%), and hard (20%) questions"
      : `All questions at ${difficulty} difficulty`

    const jobContext = jobDescription ? `\nJob Description:\n${jobDescription}\n` : ""

    const prompt = `You are a senior technical interviewer. Generate ${count} interview questions for a ${jobRole} position.

Interview Type: ${interviewType}
Guidance: ${typeGuide[interviewType]}
Difficulty: ${difficultyGuide}
${jobContext}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "order": 1,
      "question": "full question text",
      "type": "technical|behavioral|system_design|coding",
      "category": "e.g., Arrays, OOP, Leadership, Architecture",
      "difficulty": "easy|medium|hard",
      "expectedDuration": 5,
      "hints": ["optional hint 1", "optional hint 2"],
      "tags": ["relevant", "topic", "tags"]
    }
  ],
  "totalDuration": 60,
  "focusAreas": ["main areas covered"]
}

Rules:
- Questions must be specific, clear, and appropriate for the role
- Behavioral questions should reference STAR format in hints
- Technical questions should be practical and test real understanding
- Coding questions should specify input/output examples
- Set expectedDuration: easy=3-5min, medium=5-10min, hard=10-15min
- totalDuration = sum of all expectedDuration values

Return ONLY valid JSON without any additional text.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const data = JSON.parse(text) as InterviewQuestionsResult

    return {
      questions: Array.isArray(data.questions) ? data.questions : [],
      totalDuration: data.totalDuration ?? count * 6,
      focusAreas: Array.isArray(data.focusAreas) ? data.focusAreas : [],
    }
  } catch (error) {
    console.error("Interview question generation error:", error)
    throw new Error("Failed to generate interview questions")
  }
}

// ─── Answer Evaluation ────────────────────────────────────────────────────────

export interface AnswerEvaluationResult {
  score: number            // 0-100
  grade: "A" | "B" | "C" | "D" | "F"
  strengths: string[]
  improvements: string[]
  modelAnswer: string
  detailedFeedback: string
  technicalAccuracy?: number  // 0-100, for technical questions
  communication?: number      // 0-100
  completeness?: number       // 0-100
}

/**
 * Evaluate a candidate's answer to an interview question
 */
export async function evaluateAnswer(
  question: string,
  questionType: string,
  userAnswer: string,
  jobRole: string,
  difficulty: string
): Promise<AnswerEvaluationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `You are a senior interviewer evaluating a candidate's answer for a ${jobRole} position.

Question (${questionType}, ${difficulty}):
${question}

Candidate's Answer:
${userAnswer || "[No answer provided]"}

Evaluate this answer and return a JSON object with this exact structure:
{
  "score": 0-100,
  "grade": "A|B|C|D|F",
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "modelAnswer": "comprehensive ideal answer for this question",
  "detailedFeedback": "2-3 paragraph detailed feedback explaining the score",
  "technicalAccuracy": 0-100,
  "communication": 0-100,
  "completeness": 0-100
}

Scoring rubric:
- 90-100 (A): Exceptional — covers all key points with examples, shows deep understanding
- 75-89  (B): Good — covers most points, minor gaps, clear communication  
- 60-74  (C): Fair — covers basics but misses important aspects
- 45-59  (D): Poor — significant gaps, unclear or incorrect information
- 0-44   (F): Unacceptable — off-topic, wrong, or no meaningful answer

For behavioral questions: evaluate STAR format usage, specificity, and relevance
For technical questions: evaluate accuracy, depth, edge cases, and optimization
For empty/no answers: score 0, grade F

Return ONLY valid JSON without any additional text.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const data = JSON.parse(text) as AnswerEvaluationResult

    return {
      score: Math.min(100, Math.max(0, data.score ?? 0)),
      grade: data.grade ?? "F",
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
      modelAnswer: data.modelAnswer ?? "",
      detailedFeedback: data.detailedFeedback ?? "",
      technicalAccuracy: data.technicalAccuracy ?? undefined,
      communication: data.communication ?? undefined,
      completeness: data.completeness ?? undefined,
    }
  } catch (error) {
    console.error("Answer evaluation error:", error)
    throw new Error("Failed to evaluate answer")
  }
}

// ─── Cover Letter Generation ──────────────────────────────────────────────────

export type CoverLetterTone = "PROFESSIONAL" | "CONVERSATIONAL" | "ENTHUSIASTIC" | "FORMAL"

export interface CoverLetterResult {
  content: string       // full letter body
  wordCount: number
  subject: string       // suggested email subject line
  highlights: string[]  // key points the letter emphasizes
}

/**
 * Generate a tailored cover letter from resume data and job description.
 */
export async function generateCoverLetter(
  resumeData: {
    name: string
    skills: string[]
    experience: string
    education: string
    achievements?: string[]
  },
  jobDescription: string,
  jobTitle: string,
  company: string,
  tone: CoverLetterTone = "PROFESSIONAL"
): Promise<CoverLetterResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const toneGuide: Record<CoverLetterTone, string> = {
      PROFESSIONAL:   "formal and polished, appropriate for corporate roles",
      CONVERSATIONAL: "warm and approachable while remaining professional",
      ENTHUSIASTIC:   "energetic and passionate, showing excitement for the role",
      FORMAL:         "very formal and traditional, conservative phrasing",
    }

    const prompt = `You are an expert career coach and professional writer. Write a compelling cover letter for the following candidate.

Candidate Profile:
- Name: ${resumeData.name}
- Key Skills: ${resumeData.skills.slice(0, 10).join(", ")}
- Experience Summary: ${resumeData.experience}
- Education: ${resumeData.education}
${resumeData.achievements?.length ? `- Notable Achievements: ${resumeData.achievements.slice(0, 3).join("; ")}` : ""}

Target Position:
- Job Title: ${jobTitle}
- Company: ${company}
- Job Description: ${jobDescription.slice(0, 2000)}

Tone: ${toneGuide[tone]}

Requirements:
- 3-4 paragraphs (opening, relevant experience, why this company, closing)
- 250-350 words
- No generic filler — every sentence must be specific to this candidate and role
- Reference specific skills and achievements from the candidate profile
- Show genuine knowledge of what the role requires
- End with a clear call to action
- Do NOT include address blocks, date, or "Dear Hiring Manager" — just the letter body

Return a JSON object with this exact structure:
{
  "content": "full cover letter body text with paragraph breaks as \\n\\n",
  "wordCount": 0,
  "subject": "suggested email subject line",
  "highlights": ["key point 1", "key point 2", "key point 3"]
}

Return ONLY valid JSON without any additional text.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const data = JSON.parse(text) as CoverLetterResult

    const wordCount = (data.content ?? "").split(/\s+/).filter(Boolean).length

    return {
      content:    data.content ?? "",
      wordCount:  wordCount,
      subject:    data.subject ?? `Application for ${jobTitle} at ${company}`,
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
    }
  } catch (error) {
    console.error("Cover letter generation error:", error)
    throw new Error("Failed to generate cover letter")
  }
}
